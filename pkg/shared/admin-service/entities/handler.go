package entities

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"gopkg.in/mail.v2"

	"go.mongodb.org/mongo-driver/mongo/options"
	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/helper"

	"kriyatec.com/pms-api/pkg/shared/utils"
)

var updateOpts = options.Update().SetUpsert(true)

var fileUploadPath = ""
var ctx = context.Background()

// PostDocHandler --METHOD Data insert to mongo Db with Proper Field Validation
func PostDocHandler(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// to  Get the User Details from Token
	userToken := utils.GetUserTokenValue(c)

	//get the collection from model_config collection to find the model_name
	collectionName, err := CollectionNameGet(c.Params("model_name"), org.Id)
	if err != nil {
		shared.BadRequest("Invalid CollectionName")
	}

	var inputData map[string]interface{}
	c.BodyParser(&inputData)

	helper.UpdateDateObject(inputData)

	// user collection is here that time only password validation
	if collectionName == "user" {
		// user collection only OnboadingProcessing for send the mail to activation --METHOD OnboardingProcessing
		err := OnboardingProcessing(inputData["_id"].(string))
		if err != nil {
			return shared.BadRequest("invalid user Id")
		}
	} else if collectionName == "task" {
		inputData["task_id"] = helper.Sequenceordercreate(org.Id, collectionName, inputData["task_name"].(string))
	}

	inputData["created_on"] = time.Now()
	inputData["created_by"] = userToken.UserId
	inputData["status"] = "A"

	// Insert he data to mongo Collection  name form params
	res, err := database.GetConnection(org.Id).Collection(collectionName).InsertOne(ctx, inputData)
	if err != nil {
		return shared.BadRequest("Failed to insert data into the database " + err.Error())
	}

	// if Data model collection to insert the data in Db to automatically run then Struct for load the new struct without cut the server
	// only Data model collection only we need to run the  ServerInitstruct
	if collectionName == "data_model" {
		// only Data to insert the Db that time only call the method
		if res.InsertedID != nil {
			// Goroutines for synchronized to load the struct without laging server
			helper.ServerInitstruct(org.Id)
		}
	}

	// return shared.SuccessResponse(c, res.InsertedID)
	return shared.SuccessResponse(c, fiber.Map{
		"message":  "Insert Successfully",
		"response": res.InsertedID,
	})
}

func GetDocByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	filter := helper.DocIdFilter(c.Params("id"))
	collectionName := c.Params("collectionName")
	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(1), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// func getDocsHandler(c *fiber.Ctx) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	// collectionName := c.Params("collectionName")
// 	var requestBody shared.PaginationRequest

// 	if err := c.BodyParser(&requestBody); err != nil {
// 		return nil
// 	}

// 	pipeline := shared.MasterAggregationPipeline(requestBody, c)

// 	Response, err := shared.GetAggregateQueryResult(orgId, c.Params("collectionName"), pipeline)

// 	if err != nil {
// 		if cmdErr, ok := err.(mongo.CommandError); ok {
// 			return shared.BadRequest(cmdErr.Message)
// 		}
// 	}

// 	return shared.SuccessResponse(c, Response)
// }

func DeleteById(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	//Filter conditon for common
	filter := helper.DocIdFilter(c.Params("id"))
	//user_files collection that time Delete S3 files
	if c.Params("collectionName") == "user_files" {
		return helper.DeleteFileIns3(c)
	}
	// Delete the Data from COllectionName
	_, err := database.GetConnection(org.Id).Collection(c.Params("collectionName")).DeleteOne(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error deleting document"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Document successfully deleted"})
}

func DeleteByAll(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	collectionName := c.Params("collectionName")

	filter := bson.M{}
	_, err := database.GetConnection(org.Id).Collection(collectionName).DeleteMany(ctx, filter)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Error deleting documents"})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"message": "Documents successfully deleted"})
}

func putDocByIDHandlers(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// to  Get the User Details from Token
	userToken := utils.GetUserTokenValue(c)

	collectionName, err := CollectionNameGet(org.Id, c.Params("collectionName"))
	if err != nil {
		return shared.BadRequest("Invalid CollectionName")
	}
	// Validate the input data based on the data model
	inputData, validationErrors := helper.UpdateValidateInDatamodel(collectionName, string(c.Body()), org.Id)
	if validationErrors != nil {
		//Handle validation errors with status code 400 (Bad Request)
		jsonstring, _ := json.Marshal(validationErrors)
		return shared.BadRequest(string(jsonstring))
	}

	updatedDatas := make(map[string]interface{})
	// update for nested fields
	UpdateData := helper.UpdateFieldsWithParentKey(inputData, "", updatedDatas)

	// var UpdateData map[string]interface{}
	// c.BodyParser(&UpdateData)

	update := bson.M{
		"$set": UpdateData,
	}

	UpdateData["update_on"] = time.Now()
	UpdateData["update_by"] = userToken.UserId
	// Update data in the collection
	res, err := database.GetConnection(org.Id).Collection(c.Params("model_name")).UpdateOne(ctx, helper.DocIdFilter(c.Params("id")), update, updateOpts)
	if err != nil {
		// Handle database update error with status code 500 (Internal Server Error)
		return shared.BadRequest(err.Error())
	}

	if c.Params("model_name") == "data_model" {
		if res.UpsertedID != nil {

			helper.ServerInitstruct(org.Id)
		}
	}
	return shared.SuccessResponse(c, "Updated Successfully")
}

func CollectionNameGet(model_name, orgId string) (string, error) {

	filter := bson.M{
		"model_name":    model_name,
		"is_collection": "Yes",
	}

	Response, err := helper.FindDocs(orgId, "model_config", filter)
	if err != nil {
		return "", nil
	}

	return Response["collection_name"].(string), nil
}

func getDocByIddHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	projectid := c.Params("projectid")

	filter := bson.A{
		bson.D{{"$match", bson.D{{"project_id", projectid}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "task"},
					{"localField", "moduleid"},
					{"foreignField", "moduleid"},
					{"as", "results"},
				},
			},
		},

		bson.D{
			{"$project",
				bson.D{
					{"_id", 1},
					{"moduleid", 1},
					{"parentmodulename", 1},
					{"modulename", 1},
					{"enddate", 1},
					{"project_id", 1},
					{"startdate", 1},
					{"task_name", "$results.task_name"},
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// todo
func getDocByClientIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	var filter bson.M
	collectionName := c.Params("collectionName")
	clientname := c.Params("clientname")
	decodedProjectName, err := url.QueryUnescape(clientname)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	client := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded Client Name:", client)
	if collectionName == "testcase" {
		filter = bson.M{"moduleid": client}
	} else {
		filter = bson.M{"clientname": client}

	}

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func getDocBycolonynameHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	var filter interface{}
	collectionName := c.Params("collectionName")

	// Decode the URL parameter to handle spaces
	paramsValue, err := url.QueryUnescape(c.Params("companyname"))
	if err != nil {
		return shared.BadRequest("Invalid URL parameter")
	}

	// fmt.Println(paramsValue)

	// Define a map of collection names to fields to search
	collectionFieldMap := map[string][]string{
		"company": {"companyname"},
		"colony":  {"colony_id", "colonyname", "companyname", "colonypin", "colonyid", "colonyaddr", "country_name", "states"},
		"block":   {"blockname", "colonyname"},
		"gate":    {"gatename", "colonyname"},
		"owner":   {"ownername", "ownerid"},
	}

	fieldsToSearch, ok := collectionFieldMap[collectionName]
	if !ok {
		// Handle the case where the collectionName is not recognized
		return shared.BadRequest("Invalid collectionName")
	}

	// Construct the filter dynamically based on the fields to search
	orConditions := make([]bson.M, len(fieldsToSearch))
	for i, field := range fieldsToSearch {
		orConditions[i] = bson.M{field: paramsValue}
	}
	filter = bson.M{"$or": orConditions}

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)

	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// getProduct Details by its ID
func getDocByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	filter := helper.DocIdFilter(c.Params("id"))

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func getModuleByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	moduleid := c.Params("moduleid")
	var collection string
	if collectionName == "testcase" {
		collection = "testcase"
	} else {
		collection = "modules"
	}
	filter := bson.A{
		bson.D{{"$match", bson.D{{"moduleid", moduleid}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collection, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func ModuleTaskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	projectid := c.Params("projectid")
	// fmt.Println(projectid)
	var collectionName = "modules"
	filter := bson.A{
		bson.D{{"$match", bson.D{{"projectid", projectid}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "task"},
					{"localField", "moduleid"},
					{"foreignField", "moduleid"},
					{"as", "results"},
				},
			},
		},

		bson.D{
			{"$project",
				bson.D{
					{"_id", 0},
					{"enddate", 1},
					{"startdate", 1},
					{"parentmodulename", 1},
					{"modulename", 1},
					{"taskname", "$results.taskname"},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func TeamRoleHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	teamid := c.Params("teamid")

	var collectionName = "projectteam"
	filter := bson.A{
		bson.D{{"$match", bson.D{{"teamid", teamid}}}},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$projectrole"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"_id", 0},
					{"name", "$projectrole.projectrolename"},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}
func TeamMemberHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	projectname := c.Params("projectname")
	decodedProjectName, err := url.QueryUnescape(projectname)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	project := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded Project Name:", project)
	var collectionName = "projectteammembers"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"projectname", project}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// todo
func ActiveClientHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	name := c.Params("name")

	filter := bson.A{
		bson.D{{"$match", bson.D{{"status", "Active"}}}},
	}

	response, err := helper.GetAggregateQueryResult(orgId, name, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func StateHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	country := c.Params("country")
	decodedProjectName, err := url.QueryUnescape(country)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	countryname := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded country Name:", countryname)
	var collectionName = "country"

	filter :=
		bson.A{
			bson.D{{"$match", bson.D{{"country_name", countryname}}}},
			bson.D{
				{"$project",
					bson.D{
						{"_id", 0},
						{"states", 1},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$states"},
						{"includeArrayIndex", "string"},
						{"preserveNullAndEmptyArrays", false},
					},
				},
			},
		}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// parent collection Task -- timesheet
func taskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	employee_id := c.Params("employee_id")
	// fmt.Println("employee_id", employee_id)
	var filter primitive.A
	filter =
		bson.A{
			//	bson.D{{"$match", bson.D{{"employeeid", employee_id}}}}, //"KT120"
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "timesheet"},
						{"localField", "task_id"},
						{"foreignField", "task_id"},
						{"as", "result"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$result"},
						{"includeArrayIndex", "string"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$group",
					bson.D{
						{"_id",
							bson.D{
								{"assigned_to", "$assigned_to"},
								{"task_id", "$task_id"},
							},
						},
						{"totalworkedhours", bson.D{{"$sum", "$result.workedhours"}}},
						{"id", bson.D{{"$first", "$_id"}}},
						{"allocated_hours", bson.D{{"$first", "$allocated_hours"}}},
						{"assigned_to", bson.D{{"$first", "$assigned_to"}}},
						{"task_id", bson.D{{"$first", "$task_id"}}},
						{"project_name", bson.D{{"$first", "$project_name"}}},
						{"moduleid", bson.D{{"$first", "$moduleid"}}},
						{"scheduled_start_date", bson.D{{"$first", "$scheduled_start_date"}}},
						{"scheduled_end_date", bson.D{{"$first", "$scheduled_end_date"}}},
						{"taskname", bson.D{{"$first", "$task_name"}}},
						{"assignedto", bson.D{{"$first", "$assignedto"}}},
						{"remarks", bson.D{{"$last", "$result.remarks"}}},
						{"status", bson.D{{"$first", "$status"}}},
						{"approval_Status", bson.D{{"$first", "$approval_Status"}}},
					},
				},
			},
			bson.D{{"$unset", "_id"}},
			bson.D{{"$set", bson.D{{"_id", "$id"}}}},
			bson.D{{"$unset", "id"}},
		}
	if employee_id == "SA" {
		filter = filter

	} else {
		// fmt.Println(employee_id)
		filter = append(filter, bson.D{{"$match", bson.D{{"assigned_to", employee_id}}}})
	}
	response, err := helper.GetAggregateQueryResult(orgId, "task", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func BlockidHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	id := c.Params("id")

	// decodedProjectName, err := url.QueryUnescape(schemaname)
	// if err != nil {
	// 	fmt.Println("Error decoding:", err)
	// }
	// project := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded Project Name:", project)
	var collectionName = "block"
	var collectionName1 = "colony"
	var collectionName2 = "gate"

	docId, err := primitive.ObjectIDFromHex(id)
	filter := bson.A{
		bson.D{{"$match", bson.D{{"_id", docId}}}},
	}
	//filter := bson.M{"_id": docId}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println("docId", response)
	//fmt.Println(response)
	response1, err := helper.GetAggregateQueryResult(orgId, collectionName1, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println("docId", response1)
	response2, err := helper.GetAggregateQueryResult(orgId, collectionName2, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println("docId", response2)
	combinedResponse := append(response, response1...)
	combinedResponse1 := append(combinedResponse, response2...)
	return shared.SuccessResponse(c, combinedResponse1)
}
func colonyHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	companyname := c.Params("companyname")

	decodedCompanyName, err := url.QueryUnescape(companyname)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	company := strings.Replace(decodedCompanyName, "%20", " ", -1)
	// fmt.Println("Decoded Company Name:", company)
	var collectionName = "colony"

	filter :=
		bson.A{
			bson.D{{"$match", bson.D{{"companyname", company}}}},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "block"},
						{"localField", "colonyname"},
						{"foreignField", "colonyname"},
						{"as", "block"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$block"},
						{"includeArrayIndex", "string"},
						{"preserveNullAndEmptyArrays", false},
					},
				},
			},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "gate"},
						{"localField", "colonyname"},
						{"foreignField", "colonyname"},
						{"as", "gate"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$gate"},
						{"includeArrayIndex", "string"},
						{"preserveNullAndEmptyArrays", false},
					},
				},
			},
			bson.D{
				{"$group",
					bson.D{
						{"_id",
							bson.D{
								{"_id", "$_id"},
								{"colonyname", "$colonyname"},
							},
						},
						{"block", bson.D{{"$push", "$block"}}},
						{"gate", bson.D{{"$push", "$gate"}}},
					},
				},
			},
			bson.D{
				{"$project",
					bson.D{
						{"colonyname", "$_id.colonyname"},
						{"_id", "$_id._id"},
						{"block", 1},
						{"gate", 1},
					},
				},
			},
		}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func EmployeeTaskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	assignedto := c.Params("assignedto")

	decodedProjectName, err := url.QueryUnescape(assignedto)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	assign := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded assign Name:", assign)
	var collectionName = "task"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"assignedto", assign}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}
func TimeSheetHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	timesheet_id := c.Params("timesheet_id")

	// decodedProjectName, err := url.QueryUnescape(schemaname)
	// if err != nil {
	// 	fmt.Println("Error decoding:", err)
	// }
	// project := strings.Replace(decodedProjectName, "%20", " ", -1)
	// fmt.Println("Decoded Project Name:", project)
	var collectionName = "timesheet"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"timesheet_id", timesheet_id}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}
func ColvalHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName") //:collectionName/:colvalue/:key
	colvalue := c.Params("colvalue")
	key := c.Params("key")

	decodedkeyName, err := url.QueryUnescape(key)
	if err != nil {
		// fmt.Println("Error decoding:", err)
	}
	keyname := strings.Replace(decodedkeyName, "%20", " ", -1)
	// fmt.Println("Decoded Key Name:", keyname)

	filter := bson.A{
		bson.D{{"$match", bson.D{{colvalue, keyname}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func TimeSheetByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	// fmt.Println(orgId)
	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")
	date, _ := time.Parse(time.RFC3339, scheduledstartdate)
	day := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	fmt.Println("Formatted :", day)
	fmt.Println("employee_id :", employee_id)
	var collectionName = "task"
	var filter primitive.A
	// !Parthi
	filter = bson.A{
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "timesheet"},
					{"localField", "task_id"},
					{"foreignField", "task_id"},
					{"as", "result"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$result"},
					{"includeArrayIndex", "string"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id",
						bson.D{
							{"assigned_to", "$assigned_to"},
							{"task_id", "$task_id"},
						},
					},
					{"totalworkedhours", bson.D{{"$sum", "$result.workedhours"}}},
					{"id", bson.D{{"$first", "$_id"}}},
					{"allocated_hours", bson.D{{"$first", "$allocated_hours"}}},
					//{"employeeid", bson.D{{"$first", "$employeeid"}}},
					{"task_id", bson.D{{"$first", "$task_id"}}},
					{"project_name", bson.D{{"$first", "$project_name"}}},
					{"moduleid", bson.D{{"$first", "$moduleid"}}},
					{"scheduled_start_date", bson.D{{"$first", "$scheduled_start_date"}}},
					{"scheduled_end_date", bson.D{{"$first", "$scheduled_end_date"}}},
					{"task_name", bson.D{{"$first", "$task_name"}}},
					{"assigned_to", bson.D{{"$first", "$assigned_to"}}},
					{"status", bson.D{{"$first", "$status"}}},
					{"result", bson.D{{"$addToSet", "$result"}}},
					{"formatteddate1", bson.D{{"$last", "$result.formatedDate"}}},
					{"formatteddate", bson.D{{"$first", "$result.formatedDate"}}},
				},
			},
		},
		bson.D{
			{"$match",
				bson.D{
					{"$or",
						bson.A{
							bson.D{
								{"$and",
									bson.A{
										bson.D{{"status", "Completed"}},
										bson.D{
											{"$and",
												bson.A{
													bson.D{{"formatteddate", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 0, 0, time.UTC)}}}},
													bson.D{{"formatteddate1", bson.D{{"$gte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}}},
												},
											},
										},
									},
								},
							},
							bson.D{
								{"$and",
									bson.A{
										bson.D{{"status", bson.D{{"$ne", "Completed"}}}},
										bson.D{{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 0, 0, time.UTC)}}}},
									},
								},
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$unset",
				bson.A{
					"_id",
					"status",
					"result",
				},
			},
		},
	}
	if employee_id == "SA" {

		filter = filter
	} else {
		// fmt.Println(employee_id)
		filter = append(filter, bson.D{{"$match", bson.D{{"assigned_to", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	//fmt.Println(response)
	return shared.SuccessResponse(c, response)
}

func TimeSheetByTesting(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")
	date, _ := time.Parse(time.RFC3339, scheduledstartdate)

	filter :=
		bson.A{
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "timesheet"},
						{"localField", "taskid"},
						{"foreignField", "task_id"},
						{"as", "result"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$result"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$group",
					bson.D{
						{"_id",
							bson.D{
								{"employeeid", "$employeeid"},
								{"task_id", "$taskid"},
							},
						},
						{"totalworkedhours", bson.D{{"$sum", "$result.workedhours"}}},
						{"id", bson.D{{"$first", "$_id"}}},
						{"allocatedhours", bson.D{{"$first", "$allocatedhours"}}},
						{"employeeid", bson.D{{"$first", "$employeeid"}}},
						{"remarks", bson.D{{"$first", "$remarks"}}},
						{"task_id", bson.D{{"$first", "$taskid"}}},
						{"projectname", bson.D{{"$first", "$projectname"}}},
						{"moduleid", bson.D{{"$first", "$moduleid"}}},
						{"scheduled_start_date", bson.D{{"$first", "$scheduledstartdate"}}},
						{"scheduled_end_date", bson.D{{"$first", "$scheduledenddate"}}},
						{"taskname", bson.D{{"$first", "$taskname"}}},
						{"assignedto", bson.D{{"$first", "$assignedto"}}},
						{"actual_start_date", bson.D{{"$min", "$result.created_on"}}},
						{"status", bson.D{{"$first", "$status"}}},
						{"formatteddate", bson.D{{"$last", "$result.formatedDate"}}},
						{"formatteddate1", bson.D{{"$first", "$result.formatedDate"}}},
					},
				},
			},
			bson.D{
				{"$match",
					bson.D{
						{"status",
							bson.D{
								{"$in",
									bson.A{
										"In Progress",
										"Completed",
									},
								},
							},
						},
						{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}},
					},
				},
			},
		}
	if employee_id == "SA" {

		filter = filter
	} else {
		// fmt.Println(employee_id)
		filter = append(filter, bson.D{{"$match", bson.D{{"employeeid", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, "task", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// /  workedhour/:employee_id/:scheduledstartdate
func TimeSheetByiiIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")
	scheduledstartdate = strings.TrimPrefix(scheduledstartdate, ":")
	date, err := time.Parse(time.RFC3339, scheduledstartdate)
	if err != nil {
		// fmt.Println("Error parsing date:", err)
	}

	var collectionName = "task"
	var filter primitive.A
	filter =
		bson.A{
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "timesheet"},
						{"localField", "task_id"},
						{"foreignField", "task_id"},
						{"as", "result"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$result"},
						{"includeArrayIndex", "string"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$match",
					bson.D{
						{"$and",
							bson.A{
								bson.D{
									{"result.formatedDate",
										bson.D{
											{"$gte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)},
											{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, time.UTC)},
										},
									},
								},
								//bson.D{{"status", bson.D{{"$ne", "Completed"}}}},
							},
						},
					},
				},
			},
		}
	if employee_id == "SA" {
		filter = filter
	} else {
		filter = append(filter, bson.D{{"$match", bson.D{{"assigned_to", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}
func TimeSeetByIdHandler(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	// fmt.Println("orgId", orgId)
	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")

	date, _ := time.Parse(time.RFC3339, scheduledstartdate)
	day := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)
	//day, _ := time.Parse(time.RFC3339, inputData["date"].(string))
	fmt.Println("Formatted UC:", day)
	//fmt.Println("Formatted UC:", day1)

	var collectionName = "task"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"employeeid", employee_id}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "timesheet"},
					{"localField", "taskid"},
					{"foreignField", "task_id"},
					{"as", "result"},
				},
			},
		},
		bson.D{{"$addFields", bson.D{{"resultSize", bson.D{{"$size", "$result"}}}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, "task", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	//fmt.Println("response UC:", response)
	for _, res1 := range response {
		// fmt.Println(res1["resultSize"], "gg")
		if res1["resultSize"] == 0 {
			// fmt.Println(res1["resultSize"], "gg")
			filter1 :=
				bson.A{
					bson.D{
						{"$lookup",
							bson.D{
								{"from", "timesheet"},
								{"localField", "taskid"},
								{"foreignField", "task_id"},
								{"as", "result"},
							},
						},
					},
					bson.D{
						{"$unwind",
							bson.D{
								{"path", "$result"},
								{"includeArrayIndex", "string"},
								{"preserveNullAndEmptyArrays", true},
							},
						},
					},
					bson.D{
						{"$group",
							bson.D{
								{"_id",
									bson.D{
										{"employeeid", "$employeeid"},
										{"task_id", "$taskid"},
									},
								},
								{"totalworkedhours", bson.D{{"$sum", "$result.workedhours"}}},
								{"id", bson.D{{"$first", "$_id"}}},
								{"allocatedhours", bson.D{{"$first", "$allocatedhours"}}},
								{"employeeid", bson.D{{"$first", "$employeeid"}}},
								{"task_id", bson.D{{"$first", "$taskid"}}},
								{"projectname", bson.D{{"$first", "$projectname"}}},
								{"moduleid", bson.D{{"$first", "$moduleid"}}},
								{"scheduled_start_date", bson.D{{"$first", "$scheduledstartdate"}}},
								{"scheduled_end_date", bson.D{{"$first", "$scheduledenddate"}}},
								{"taskname", bson.D{{"$first", "$taskname"}}},
								{"assignedto", bson.D{{"$first", "$assignedto"}}},
								{"actual_start_date", bson.D{{"$min", "$result.created_on"}}},
								{"status", bson.D{{"$first", "$status"}}},
							},
						},
					},
					bson.D{{"$unset", "_id"}},
					bson.D{
						{"$match",
							bson.D{
								{"$and",
									bson.A{
										bson.D{{"employeeid", employee_id}},
										bson.D{{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 0, 0, 0, time.UTC)}}}},
										bson.D{{"status", bson.D{{"$ne", "Completed"}}}},
									},
								},
							},
						},
					},
				}
			response1, err := helper.GetAggregateQueryResult(orgId, collectionName, filter1)
			if err != nil {
				return shared.BadRequest(err.Error())
			}
			// fmt.Println("SS", response1)
			return shared.SuccessResponse(c, response1)
		} else {
			filter :=
				bson.A{
					bson.D{
						{"$lookup",
							bson.D{
								{"from", "timesheet"},
								{"localField", "taskid"},
								{"foreignField", "task_id"},
								{"as", "result"},
							},
						},
					},
					bson.D{
						{"$unwind",
							bson.D{
								{"path", "$result"},
								{"includeArrayIndex", "string"},
								{"preserveNullAndEmptyArrays", true},
							},
						},
					},
					bson.D{
						{"$group",
							bson.D{
								{"_id",
									bson.D{
										{"employeeid", "$employeeid"},
										{"task_id", "$taskid"},
									},
								},
								{"totalworkedhours", bson.D{{"$sum", "$result.workedhours"}}},
								{"id", bson.D{{"$first", "$_id"}}},
								{"allocatedhours", bson.D{{"$first", "$allocatedhours"}}},
								{"employeeid", bson.D{{"$first", "$employeeid"}}},
								{"task_id", bson.D{{"$first", "$taskid"}}},
								{"projectname", bson.D{{"$first", "$projectname"}}},
								{"moduleid", bson.D{{"$first", "$moduleid"}}},
								{"scheduled_start_date", bson.D{{"$first", "$scheduledstartdate"}}},
								{"scheduled_end_date", bson.D{{"$first", "$scheduledenddate"}}},
								{"taskname", bson.D{{"$first", "$taskname"}}},
								{"assignedto", bson.D{{"$first", "$assignedto"}}},
								{"actual_start_date", bson.D{{"$min", "$result.created_on"}}},
								{"status", bson.D{{"$first", "$status"}}},
								{"result", bson.D{{"$addToSet", "$result"}}},
							},
						},
					},
					bson.D{{"$unset", "_id"}},
					bson.D{
						{"$unwind",
							bson.D{
								{"path", "$result"},
								{"includeArrayIndex", "string"},
								{"preserveNullAndEmptyArrays", true},
							},
						},
					},
					bson.D{
						{"$set",
							bson.D{
								{"formatedDate", "$result.formatedDate"},
								{"workedhours", "$result.workedhours"},
							},
						},
					},
					bson.D{
						{"$addFields",
							bson.D{
								{"hasFormattedDate",
									bson.D{
										{"$cond",
											bson.D{
												{"if",
													bson.D{
														{"$and",
															bson.A{
																bson.D{
																	{"$gte",
																		bson.A{
																			"$formatedDate",
																			time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC),
																		},
																	},
																},
																bson.D{
																	{"$lte",
																		bson.A{
																			"$formatedDate",
																			time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 0, 0, time.UTC),
																		},
																	},
																},
															},
														},
													},
												},
												{"then", true},
												{"else", false},
											},
										},
									},
								},
							},
						},
					},
					bson.D{
						{"$addFields",
							bson.D{
								{"workedhours",
									bson.D{
										{"$cond",
											bson.D{
												{"if",
													bson.D{
														{"$eq",
															bson.A{
																"$hasFormattedDate",
																true,
															},
														},
													},
												},
												{"then", "$workedhours"},
												{"else", "$$REMOVE"},
											},
										},
									},
								},
							},
						},
					},
					bson.D{
						{"$match",
							bson.D{
								{"$and",
									bson.A{
										bson.D{{"employeeid", employee_id}},
										bson.D{
											{"$or",
												bson.A{
													bson.D{{"formattedDate", bson.D{{"$exists", false}}}},
													bson.D{
														{"$and",
															bson.A{
																bson.D{{"formattedDate", bson.D{{"$exists", true}}}},
																bson.D{{"hasFormattedDate", true}},
															},
														},
													},
												},
											},
										},
										bson.D{{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 0, 0, 0, time.UTC)}}}},
										bson.D{{"status", bson.D{{"$ne", "Completed"}}}},
									},
								},
							},
						},
					},
				}
			response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
			if err != nil {
				return shared.BadRequest(err.Error())
			}
			// fmt.Println("SSU", response)
			return shared.SuccessResponse(c, response)
		}
	}
	return nil
}

// getDocsHandler --METHOD get the data from Db with pagination
func getDocsHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	// collectionName := c.Params("collectionName")
	var requestBody helper.PaginationRequest

	if err := c.BodyParser(&requestBody); err != nil {
		return nil
	}

	var pipeline []primitive.M
	pipeline = helper.MasterAggregationPipeline(requestBody, c)

	PagiantionPipeline := helper.PagiantionPipeline(requestBody.Start, requestBody.End)
	pipeline = append(pipeline, PagiantionPipeline)
	Response, err := helper.GetAggregateQueryResult(orgId, c.Params("collectionName"), pipeline)

	if err != nil {
		if cmdErr, ok := err.(mongo.CommandError); ok {
			return shared.BadRequest(cmdErr.Message)
		}
	}

	return shared.SuccessResponse(c, Response)
}

// getProduct --METHOD Details by its ID
func getDocsByKeyValueHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	token := utils.GetUserTokenValue(c)
	page := c.Params("page")
	limit := c.Params("limit")
	collectionName := c.Params("collectionName")
	key := c.Params("key")
	value := c.Params("value")
	if value == "_" {
		// fmt.Print("No User Id")
		value = token.UserId
		// fmt.Print(token.UserId)
	}
	filter := bson.M{key: value}
	response, err := helper.GetQueryResult(orgId, collectionName, filter, helper.Page(page), helper.Limit(limit), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// getProduct Details by its ID
// func updateIncrementalValue(c *fiber.Ctx) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	collectionName := c.Params("collectionName")
// 	var inputData map[string]interface{}
// 	err := c.BodyParser(&inputData)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	response, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(
// 		ctx,
// 		inputData["match"],
// 		bson.M{"$inc": inputData["data"]},
// 		updateOpts,
// 	)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	return shared.SuccessResponse(c, response)
// }

// / deleteEntitiesByIDHandler - Delete Entity By ID
func deleteDocumentByIDHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	var col interface{}

	value := c.Params("colName")
	colname := c.Params("value")

	fmt.Println(value, colname)

	if value == "_id" {
		colObj, err := primitive.ObjectIDFromHex(colname)
		if err != nil {
			fmt.Println(colObj)
			return shared.BadRequest(err.Error())
		}
		col = colObj
	}
	// } else {
	// 	col := colname
	// 	fmt.Println(col)
	// }
	if colname == "_" {
		token := utils.GetUserTokenValue(c)
		value = token.UserId
	}
	filter := bson.M{value: col}
	collectionName := c.Params("collectionName")
	response, err := database.GetConnection(orgId).Collection(collectionName).DeleteMany(ctx, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func OnboardingProcessing(email string) error {
	// Generate the 'decoding' value (replace this with your actual logic)
	decoding := helper.GenerateAppaccesscode()
	// Generate the URL with parameters  it call the back end api
	link := fmt.Sprintf("http://localhost:4200/activate?accesskey=%s", decoding)

	body := createOnBoardtemplate(link)
	if err := SendEmailS(email, os.Getenv("CLIENT_EMAIL"), "Welcome to pms Onboarding", body); err == nil {
		// If email sending was successful
		if err := UserJunkedFiles(email, decoding); err != nil {
			log.Println("Failed to insert user junked files:", err)
		}
	} else {
		return shared.BadRequest("Email sending failed:")
	}

	return nil
}

// func SendSimpleEmailHandler(c *fiber.Ctx) error {
// 	// bind the value in requestData
// 	var requestData map[string]interface{}
// 	err := c.BodyParser(&requestData)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}

// 	email := requestData["_id"].(string)
// 	// Generate the 'decoding' value (replace this with your actual logic)
// 	decoding := helper.GenerateAppaccesscode()

// 	// Generate the URL with parameters  it call the back end api
// 	link := fmt.Sprintf("http://localhost:4200/activate?accesskey=%s", decoding)

// 	body := createOnBoardtemplate(link)

// 	if err := SendEmailS(email, os.Getenv("CLIENT_EMAIL"), "Welcome to pms Onboarding", body); err == nil {
// 		// If email sending was successful
// 		if err := User_junked_files(email, decoding); err != nil {
// 			log.Println("Failed to insert user junked files:", err)
// 		} else {
// 			log.Println("Email sent successfully")
// 		}
// 	} else {
// 		log.Println("Email sending failed:", err)
// 	}

// 	return shared.SuccessResponse(c, requestData)
// }

// USER ON BOARDING TEMPLATE  //todo
func createOnBoardtemplate(link string) string {

	body := `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Welcome to Our Onboarding Process</title>
	</head>
	<body>
		<table cellpadding="0" cellspacing="0" width="100%" bgcolor="#f0f0f0">
			<tr>
				<td align="center">
					<table cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse;">
						<tr>
							<td align="center" bgcolor="#ffffff" style="padding: 40px 0 30px 0; border-top: 3px solid #007BFF;">
								<h1>Welcome to Our Onboarding Process</h1>
								<p>Thank you for choosing our services. We are excited to have you on board!</p>
								<p>Please follow the steps below to get started:</p>
								<ol>
									<div>Step 1: Complete your profile</div>
									<div>Step 2: Explore our platform</div>
									<div>Step 3: Contact our support team if you have any questions</div>
								</ol>
								<p>Enjoy your journey with us!</p>
								<p>
								<a href="` + link + `" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Activation Now</a>
								</p>
							</td>
						</tr>
					</table>
				</td>
			</tr>
		</table>
	</body>
	</html>`

	return body
}

func UserJunkedFiles(requestMail, appToken string) error {
	requestData := bson.M{
		"_id":        requestMail,
		"access_key": appToken,
		"expire_on":  time.Now(),
	}

	_, err := database.GetConnection("pms").Collection("temporary_user").InsertOne(ctx, requestData)

	if err != nil {
		// Log the detailed error for debugging
		log.Println("Failed to insert data into the database:", err.Error())
		return shared.BadRequest("Failed to insert data into the database")
	}

	return nil
}

func SendEmailS(recipientEmail string, senderEmail string, subject string, body string) error {
	email := mail.NewMessage()
	email.SetHeader("From", senderEmail)
	email.SetHeader("To", recipientEmail)

	email.SetHeader("Subject", subject)
	email.SetBody("text/html", body)

	sendinmail := mail.NewDialer("smtp.gmail.com", 587, senderEmail, os.Getenv("CLIENT_EMAIL_PASSWORD"))

	err := sendinmail.DialAndSend(email)
	if err != nil {
		return err
	}

	return nil
}

// func sendSimpleEmailHandler(c *fiber.Ctx) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	var requestData map[string]string
// 	err := c.BodyParser(&requestData)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	result := helper.SendEmail(orgId, strings.Split(requestData["to"], ","), strings.Split(requestData["cc"], ","), requestData["subject"], requestData["body"])
// 	if result {
// 		return shared.SuccessResponse(c, "Email Sent")
// 	}
// 	return shared.BadRequest("Try again")
// }

// // // Search EntitiesHandler - Get Entities
// func DataLookupDocsHandler(c *fiber.Ctx) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	var lookupQuery helper.LookupQuery
// 	err := c.BodyParser(&lookupQuery)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	response, err := helper.ExecuteLookupQuery(orgId, lookupQuery)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	return shared.SuccessResponse(c, response)
// }

func getNextSeqNumberHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	return c.JSON(GetNextSeqNumber(orgId, c.Params("key")))
}

func GetNextSeqNumber(orgId string, collectionName string) int32 {

	filter := bson.D{{"_id", collectionName}}
	update := bson.D{{"$inc", bson.D{{"seq", 1}}}}
	result, _ := helper.ExecuteFindAndModifyQuery(orgId, "sequence", filter, update)
	return result["seq"].(int32)
}

func postTimesheetDocHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	inputData := make(map[string]interface{})
	err := c.BodyParser(&inputData)
	if err != nil {
		return shared.BadRequest(err.Error())
	}

	if val, ok := inputData["workedhours"].(string); ok {
		// Value is a string, attempt to convert it to an integer
		if i, err := strconv.Atoi(val); err == nil {
			inputData["workedhours"] = i
			fmt.Println("Updated workedhours (integer):", inputData["workedhours"])
		} else {
			fmt.Println("Failed to convert string to integer:", err)
		}
	} else if val, ok := inputData["workedhours"].(int); ok {
		// Value is already an integer, no conversion needed
		fmt.Println("Value is already an integer:", val)
	} else {
		// Value is neither a string nor an integer
		fmt.Println("Value is neither a string nor an integer")
	}
	ref := inputData["ref_id"]
	start_date, _ := time.Parse(time.RFC3339, inputData["formatedDate"].(string))
	inputData["formatedDate"] = start_date
	filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"$and",
						bson.A{
							bson.D{
								{"formatedDate",
									bson.D{
										{"$gte", time.Date(start_date.Year(), start_date.Month(), start_date.Day(), 0, 0, 0, 0, time.UTC)},
										{"$lt", time.Date(start_date.Year(), start_date.Month(), start_date.Day(), 23, 59, 59, 0, time.UTC)},
									},
								},
							},
							bson.D{{"ref_id", ref}},
						},
					},
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(orgId, "timesheet", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	fmt.Println(len(response))
	//var res []primitive.M
	//var upfilter primitive.A

	if len(response) == 0 {

		helper.InsertData(c, orgId, "timesheet", inputData)
		if inputData["approval_Status"] == "Approved" || inputData["approval_Status"] == "Rejected" || inputData["approval_Status"] == "Hold" {
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"task_id": inputData["task_id"]},
				bson.M{
					"$set": bson.M{
						//"totalworkedhours":  inputData["workedhours"],
						//"status": inputData["status"],
						"approval_Status": inputData["approval_Status"],
					},
				},
				options.Update().SetUpsert(true))
			if err != nil {
				log.Print(err.Error())
			}
		} else {
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"task_id": inputData["task_id"]},
				bson.M{
					"$set": bson.M{
						"totalworkedhours": inputData["workedhours"],
						"status":           inputData["status"],
						//"approval_Status":inputData["approval_Status"],

					},
				},
				options.Update().SetUpsert(true))
			if err != nil {
				log.Print(err.Error())
			}
		}
	} else {
		updateFilter := bson.M{"_id": response[0]["_id"]}
		updateData := bson.M{
			"$set": inputData,
		}
		respons, err := database.GetConnection(orgId).Collection("timesheet").UpdateOne(
			ctx,
			updateFilter,
			updateData,
			updateOpts,
		)
		if err != nil {
			fmt.Println(err.Error())
			return shared.BadRequest(err.Error())
		} else {
			res, err := timesheetgroup(orgId, response)
			fmt.Println(res[0]["status"])
			if err != nil {
				return shared.BadRequest("g" + err.Error())
			}
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"task_id": response[0]["task_id"]},
				bson.M{
					"$set": bson.M{
						"totalworkedhours": res[0]["workedhours"],
						"status":           res[0]["status"],
						"approval_Status":  inputData["approval_Status"],
					},
				},
				options.Update().SetUpsert(true))
			if err != nil {
				log.Print(err.Error())
			}
			return shared.SuccessResponse(c, respons)
		}

	}
	return nil
}

func timesheetgroup(orgId string, response []primitive.M) ([]primitive.M, error) {
	if len(response) == 0 {
		return nil, errors.New("response is empty")
	}
	upfilter := bson.A{
		bson.D{{"$match", bson.D{{"task_id", response[0]["task_id"]}}}},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$task_id"},
					{"workedhours", bson.D{{"$sum", "$workedhours"}}},
					{"status_update", bson.D{{"$addToSet", "$status"}}},
					{"laststatus", bson.D{{"$last", "$status"}}},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"status",
						bson.D{
							{"$cond",
								bson.D{
									{"if",
										bson.D{
											{"$in",
												bson.A{
													"Completed",
													"$status_update",
												},
											},
										},
									},
									{"then", "Completed"},
									{"else", "$laststatus"},
								},
							},
						},
					},
				},
			},
		},
	}
	res, err := helper.GetAggregateQueryResult(orgId, "timesheet", upfilter)
	if err != nil {
		return nil, shared.BadRequest(err.Error())
	}
	fmt.Println(res)
	return res, nil
}
func getUnscheduleIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	employee_id := c.Params("employee_id")
	date := c.Params("date")
	scheduled_date, _ := time.Parse(time.RFC3339, date)
	fmt.Println(scheduled_date, employee_id)

	filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"formatedDate",
						bson.D{
							{"$gte", time.Date(scheduled_date.Year(), scheduled_date.Month(), scheduled_date.Day(), 0, 0, 0, 0, time.UTC)},
							{"$lt", time.Date(scheduled_date.Year(), scheduled_date.Month(), scheduled_date.Day(), 23, 0, 0, 0, time.UTC)},
						},
					},
				},
			},
		},
		bson.D{
			{"$match",
				bson.D{
					{"$and",
						bson.A{
							bson.D{{"employeeid", employee_id}},
						},
					},
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(orgId, "unschedule", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// func putEntityByID(c *fiber.Ctx, putType string) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	token := shared.GetUserTokenValue(c)
// 	filter := shared.DocIdFilter(c.Params("id"))
// 	var collectionName = c.Params("collectionName")
// 	var inputData map[string]interface{}
// 	err := c.BodyParser(&inputData)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	//update date string to time object
// 	shared.UpdateDateObject(inputData)

// 	//add updated by and on values
// 	inputData["updated_on"] = time.Now()
// 	inputData["updated_by"] = token.UserId

// 	//For insert
// 	var insertData map[string]interface{}
// 	insertData["created_on"] = time.Now()
// 	insertData["created_by"] = token.UserId

// 	query := bson.M{
// 		"$set":         inputData,
// 		"$setOnInsert": insertData,
// 	}
// 	if putType == "$addToSet" {
// 		arrayName := c.Params("array")
// 		query = bson.M{
// 			"$addToSet": bson.M{
// 				arrayName: inputData,
// 			},
// 		}
// 		filter = bson.M{
// 			"_id":     c.Params("id"),
// 			arrayName: bson.M{"$elemMatch": bson.M{"_id": inputData["_id"]}},
// 		}
// 		fmt.Println(filter)
// 	}
// 	//Update
// 	response, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(
// 		ctx,
// 		filter,
// 		query,
// 		updateOpts,
// 	)
// 	if err != nil {
// 		fmt.Println(err.Error())
// 		return shared.BadRequest(err.Error())
// 	}
// 	return shared.SuccessResponse(c, response)
// }

func getFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("category")
	refId := c.Params("refId")
	//	token := shared.GetUserTokenValue(c)
	query := bson.M{"ref_id": refId, "category": fileCategory}
	response, err := helper.GetQueryResult(orgId, "user_files", query, int64(0), int64(200), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func getAllFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("category")
	//status := c.Params("status")
	page := c.Params("page")
	limit := c.Params("limit")
	query := bson.M{"category": fileCategory}
	response, err := helper.GetQueryResult(orgId, "user_files", query, helper.Page(page), helper.Limit(limit), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func taskAllocHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	var collectionName = "users"
	task := c.Query("task")

	filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"data_access.Books", true},
					{"booktask", bson.D{{"$elemMatch", bson.D{{"_id", task}}}}},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func RequrimentObjectproject(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	filter := bson.A{
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
		bson.D{{"$addFields", bson.D{{"_id", bson.D{{"$toString", "$_id"}}}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "task"},
					{"localField", "_id"},
					{"foreignField", "requirement_id"},
					{"as", "task"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "testcase"},
					{"localField", "_id"},
					{"foreignField", "requirement_id"},
					{"as", "testcase"},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"taskcount", bson.D{{"$size", "$task"}}},
					{"testcasecount", bson.D{{"$size", "$testcase"}}},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(org.Id, "requirement", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
		// "pipeline": filter,
	})
}
