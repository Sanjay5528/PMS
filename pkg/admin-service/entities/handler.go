package entities

import (
	
	"errors"
	"fmt"
	"io"
	"log"
	"net/url"
	"os"
	"strconv"

	
	

	"strings"
	"time"

	//"github.com/tidwall/gjson"

	//"go.mongodb.org/mongo-driver/mongo"

	"github.com/gofiber/fiber/v2"
	//"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"

	"kriyatec.com/go-api/pkg/shared/database"
	"kriyatec.com/go-api/pkg/shared/helper"
)

var updateOpts = options.Update().SetUpsert(true)
var fileUploadPath = ""

func GetFileUploadPath() {
	fileUploadPath = helper.GetEnvStr("FILE_UPLOAD_PATH", "./uploads")
}

// postEntitiesHandler - Create Entities
func postDocHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	fmt.Println(orgId)
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	userToken := helper.GetUserTokenValue(c)
	collectionName := c.Params("collectionName")

	// Insert data to collection
	inputData := make(map[string]interface{})
	err := c.BodyParser(&inputData)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	//update date string to time object
	helper.UpdateDateObject(inputData)
	inputData["created_on"] = time.Now()
	inputData["created_by"] = userToken.UserId
	if collectionName == "request" {
		seq := helper.GetNextSeqNumber(orgId, collectionName)
		docID := fmt.Sprintf("%s%03d", "GP", seq)
		inputData["gate_pass_number"] = docID
		
	}
	if collectionName == "user" {

		inputData["pwd"] = helper.PasswordHash(inputData["pwd"].(string))
		delete(inputData, "pwdConfirm")
	}
	
	return insertData(c, orgId, collectionName, inputData)

}

func insertData(c *fiber.Ctx, orgId string, collectionName string, data interface{}) error {

	response, err := database.GetConnection(orgId).Collection(collectionName).InsertOne(ctx, data)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// putEntitiesHandler - Update Entities
func putDocByIDHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)
	a := c.Params("id")
	filter := helper.DocIdFilter(a)
	collectionName := c.Params("collectionName")
	var inputData map[string]interface{}
	err := c.BodyParser(&inputData)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	//update date string to time object
	helper.UpdateDateObject(inputData)
	//delete the _id field
	delete(inputData, "_id")
	//add updated by and on values
	inputData["updated_on"] = time.Now()
	inputData["updated_by"] = token.UserId

	//For insert
	insertData := make(map[string]interface{})
	insertData["created_on"] = time.Now()
	insertData["created_by"] = token.UserId

	if collectionName == "user" {
		delete(inputData, "pwd")
		//	inputData["pwd"] = helper.PasswordHash(inputData["pwd"].(string))
		delete(inputData, "pwdConfirm")
	}

	//Update
	response, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(
		ctx,
		filter,
		bson.M{
			"$set":         inputData,
			"$setOnInsert": insertData,
		},
		updateOpts,
	)
	if err != nil {
		fmt.Println(err.Error())
		return helper.BadRequest(err.Error())
	}

	return helper.SuccessResponse(c, response)
}

// putEntitiesHandler - Update Entities
func postArrayEntityByIDHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)
	parentId := c.Params("pid")
	arrayDoc := c.Params("child")
	docId := c.Params("cid")
	collectionName := c.Params("collectionName")
	var inputData map[string]interface{}
	err := c.BodyParser(&inputData)
	if err != nil {
		return helper.BadRequest(err.Error())
	}

	//find respective entry is there or not
	filter := bson.M{
		"_id":             parentId,
		arrayDoc + "._id": docId,
	}
	var result bson.M
	if err := database.GetConnection(orgId).Collection(collectionName).FindOne(ctx, filter).Decode(&result); err == nil {
		//same entry exists
		return helper.SuccessResponse(c, result)
	}
	//entry not available
	//update date string to time object
	helper.UpdateDateObject(inputData)
	//add updated by and on values
	inputData["updated_on"] = time.Now()
	inputData["updated_by"] = token.UserId
	//Update
	response, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(
		ctx,
		bson.M{"_id": parentId},
		bson.M{"$addToSet": bson.M{arrayDoc: inputData}},
		updateOpts,
	)
	if err != nil {
		fmt.Println(err.Error())
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func getDocByIddHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	projectid := c.Params("projectid")

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
					{"_id", 1},
					{"moduleid", 1},
					{"parentmodulename", 1},
					{"modulename", 1},
					{"enddate", 1},
					{"projectid", 1},
					{"startdate", 1},
					{"taskname", "$results.taskname"},
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func getDocByClientIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var filter primitive.M
	collectionName := c.Params("collectionName")
	clientname := c.Params("clientname")
	decodedProjectName, err := url.QueryUnescape(clientname)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	client := strings.Replace(decodedProjectName, "%20", " ", -1)
	fmt.Println("Decoded Client Name:", client)
	if collectionName == "testcase" {
		filter = bson.M{"moduleid": client}
	} else {
		filter = bson.M{"clientname": client}

	}

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func getDocBycolonynameHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}

	var filter interface{}
	collectionName := c.Params("collectionName")

	// Decode the URL parameter to handle spaces
	paramsValue, err := url.QueryUnescape(c.Params("companyname"))
	if err != nil {
		return helper.BadRequest("Invalid URL parameter")
	}

	fmt.Println(paramsValue)

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
		return helper.BadRequest("Invalid collectionName")
	}

	// Construct the filter dynamically based on the fields to search
	orConditions := make([]bson.M, len(fieldsToSearch))
	for i, field := range fieldsToSearch {
		orConditions[i] = bson.M{field: paramsValue}
	}
	filter = bson.M{"$or": orConditions}

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)

	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// getProduct Details by its ID
func getDocByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	filter := helper.DocIdFilter(c.Params("id"))

	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func getModuleByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func ModuleTaskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	projectid := c.Params("projectid")
	fmt.Println(projectid)
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func TeamRoleHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	teamid := c.Params("teamid")
	
	var collectionName = "projectteam"
	filter := bson.A{
		bson.D{{"$match", bson.D{{"teamid",teamid}}}},
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func TeamMemberHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	projectname := c.Params("projectname")
	decodedProjectName, err := url.QueryUnescape(projectname)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	project := strings.Replace(decodedProjectName, "%20", " ", -1)
	fmt.Println("Decoded Project Name:", project)
	var collectionName = "projectteammembers"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"projectname", project}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func ActiveClientHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}

	name := c.Params("name")

	filter := bson.A{
		bson.D{{"$match", bson.D{{"status", "Active"}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, name, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func StateHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	country := c.Params("country")
	decodedProjectName, err := url.QueryUnescape(country)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	countryname := strings.Replace(decodedProjectName, "%20", " ", -1)
	fmt.Println("Decoded country Name:", countryname)
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}


func taskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	employee_id := c.Params("employee_id")
	fmt.Println("employee_id", employee_id)
	var filter primitive.A
	filter =
		bson.A{
		//	bson.D{{"$match", bson.D{{"employeeid", employee_id}}}}, //"KT120"
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
						{"taskid", bson.D{{"$first", "$taskid"}}},
						{"projectname", bson.D{{"$first", "$projectname"}}},
						{"moduleid", bson.D{{"$first", "$moduleid"}}},
						{"scheduledstartdate", bson.D{{"$first", "$scheduledstartdate"}}},
						{"scheduledenddate", bson.D{{"$first", "$scheduledenddate"}}},
						{"taskname", bson.D{{"$first", "$taskname"}}},
						{"assignedto", bson.D{{"$first", "$assignedto"}}},
						{"remarks", bson.D{{"$last", "$result.remarks"}}},
						{"status", bson.D{{"$first", "$status"}}},
						{"Approval Status", bson.D{{"$first", "$Approval Status"}}},
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
			fmt.Println(employee_id)
			filter = append(filter, bson.D{{"$match", bson.D{{"employeeid", employee_id}}}})
		}
	response, err := helper.GetAggregateQueryResult(orgId, "task", filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func BlockidHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		return helper.BadRequest(err.Error())
	}
	fmt.Println("docId", response)
	//fmt.Println(response)
	response1, err := helper.GetAggregateQueryResult(orgId, collectionName1, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	fmt.Println("docId", response1)
	response2, err := helper.GetAggregateQueryResult(orgId, collectionName2, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	fmt.Println("docId", response2)
	combinedResponse := append(response, response1...)
	combinedResponse1 := append(combinedResponse, response2...)
	return helper.SuccessResponse(c, combinedResponse1)
}
func colonyHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	companyname := c.Params("companyname")

	decodedCompanyName, err := url.QueryUnescape(companyname)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	company := strings.Replace(decodedCompanyName, "%20", " ", -1)
	fmt.Println("Decoded Company Name:", company)
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func EmployeeTaskHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	assignedto := c.Params("assignedto")

	decodedProjectName, err := url.QueryUnescape(assignedto)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	assign := strings.Replace(decodedProjectName, "%20", " ", -1)
	fmt.Println("Decoded assign Name:", assign)
	var collectionName = "task"

	filter := bson.A{
		bson.D{{"$match", bson.D{{"assignedto", assign}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func TimeSheetHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func ColvalHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName") //:collectionName/:colvalue/:key
	colvalue := c.Params("colvalue")
	key := c.Params("key")

	decodedkeyName, err := url.QueryUnescape(key)
	if err != nil {
		fmt.Println("Error decoding:", err)
	}
	keyname := strings.Replace(decodedkeyName, "%20", " ", -1)
	fmt.Println("Decoded Key Name:", keyname)

	filter := bson.A{
		bson.D{{"$match", bson.D{{colvalue, keyname}}}},
	}
	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func TimeSheetByIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	// fmt.Println(orgId)
	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")
	date, _ := time.Parse(time.RFC3339, scheduledstartdate)
	day := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)

	fmt.Println("Formatted UTC:", day)

	var collectionName = "task"
	var filter primitive.A
	filter =bson.A{
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
		fmt.Println(employee_id)
		filter = append(filter, bson.D{{"$match", bson.D{{"employeeid", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	//fmt.Println(response)
	return helper.SuccessResponse(c, response)
}

func TimeSheetByTesting(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		fmt.Println(employee_id)
		filter = append(filter, bson.D{{"$match", bson.D{{"employeeid", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, "task", filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// time.Date(date.Year(), date.Month(), date.Day(), 0, 59, 59, 0, time.UTC),
func TimeSheetByiiIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	employee_id := c.Params("employee_id")
	scheduledstartdate := c.Params("scheduledstartdate")
	scheduledstartdate = strings.TrimPrefix(scheduledstartdate, ":")
	date, err := time.Parse(time.RFC3339, scheduledstartdate)
	if err != nil {
		fmt.Println("Error parsing date:", err)
	}

	fmt.Println("Formatted UTC:", scheduledstartdate)
	fmt.Println("Formatted UTC:", date)
	fmt.Println("Foed UTC:", employee_id)
	var collectionName = "task"
	var filter primitive.A
	filter =
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
		filter = append(filter, bson.D{{"$match", bson.D{{"employeeid", employee_id}}}})
	}

	response, err := helper.GetAggregateQueryResult(orgId, collectionName, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
func TimeSeetByIdHandler(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	fmt.Println("orgId", orgId)
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
		return helper.BadRequest(err.Error())
	}
	//fmt.Println("response UC:", response)
	for _, res1 := range response {
		fmt.Println(res1["resultSize"], "gg")
		if res1["resultSize"] == 0 {
			fmt.Println(res1["resultSize"], "gg")
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
				return helper.BadRequest(err.Error())
			}
			fmt.Println("SS", response1)
			return helper.SuccessResponse(c, response1)
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
				return helper.BadRequest(err.Error())
			}
			fmt.Println("SSU", response)
			return helper.SuccessResponse(c, response)
		}
	}
	return nil
}

// getProduct Details by its ID
func getDocsHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	filter := bson.M{}

	collectionName := c.Params("collectionName")
	response, err := helper.GetQueryResult(orgId, collectionName, filter, int64(0), int64(50000), nil) //helper.Page(page), helper.Limit(limit),
	fmt.Println()
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// getProduct Details by its ID
func getDocsByKeyValueHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)
	page := c.Params("page")
	limit := c.Params("limit")
	collectionName := c.Params("collectionName")
	key := c.Params("key")
	value := c.Params("value")
	if value == "_" {
		fmt.Print("No User Id")
		value = token.UserId
		fmt.Print(token.UserId)
	}
	filter := bson.M{key: value}
	response, err := helper.GetQueryResult(orgId, collectionName, filter, helper.Page(page), helper.Limit(limit), nil)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// getProduct Details by its ID
func updateIncrementalValue(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	var inputData map[string]interface{}
	err := c.BodyParser(&inputData)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(
		ctx,
		inputData["match"],
		bson.M{"$inc": inputData["data"]},
		updateOpts,
	)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// / deleteEntitiesByIDHandler - Delete Entity By ID
func deleteDocumentByIDHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}

	var col interface{}

	value := c.Params("colName")
	colname := c.Params("value")

	fmt.Println(value, colname)

	if value == "_id" {
		colObj, err := primitive.ObjectIDFromHex(colname)
		if err != nil {
			fmt.Println(colObj)
			return helper.BadRequest(err.Error())
		}
		col = colObj
	}
	// } else {
	// 	col := colname
	// 	fmt.Println(col)
	// }
	if colname == "_" {
		token := helper.GetUserTokenValue(c)
		value = token.UserId
	}
	filter := bson.M{value: col}
	collectionName := c.Params("collectionName")
	response, err := database.GetConnection(orgId).Collection(collectionName).DeleteMany(ctx, filter)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func sendSimpleEmailHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var requestData map[string]string
	err := c.BodyParser(&requestData)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	result := helper.SendEmail(orgId, strings.Split(requestData["to"], ","), strings.Split(requestData["cc"], ","), requestData["subject"], requestData["body"])
	if result {
		return helper.SuccessResponse(c, "Email Sent")
	}
	return helper.BadRequest("Try again")
}

//func sendSMS(c *fiber.Ctx) error {
//	orgId := c.Get("OrgId")
//	if orgId == "" {
//		return helper.BadRequest("Organization Id missing")
//	}
//	var req map[string]string
//	err := c.BodyParser(&req)
//	if err != nil {
//		return helper.BadRequest(err.Error())
//	}
//	resp, errContent := helper.SendSMS(req["dMobileNumber"], req["cMobileNumber"], req["consignmentNumber"], req["reason"])
//	if errContent != "" {
//		return helper.BadRequest(errContent)
//	}
//	return helper.SuccessResponse(c, resp)
//}

// Search EntitiesHandler - Get Entities
func searchDocsHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var collectionName = c.Params("collectionName")
	var conditions []helper.Filter
	page := c.Params("page")
	if page == "" {
		page = "0"
	}
	limit := c.Params("limit")
	if limit == "" {
		limit = "200"
	}
	err := c.BodyParser(&conditions)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := helper.GetSearchQueryResult(orgId, collectionName, conditions, helper.Page(page), helper.Limit(limit))
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// Search EntitiesHandler - Get Entities
func DataLookupDocsHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var lookupQuery helper.LookupQuery
	err := c.BodyParser(&lookupQuery)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := helper.ExecuteLookupQuery(orgId, lookupQuery)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func GrpReportHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var request helper.GroupSumRequest
	err := c.BodyParser(&request)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := helper.ExecuteGroupReportQuery(orgId, request)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func ReportHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var request helper.GroupSumRequest
	err := c.BodyParser(&request)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := helper.ExecuteGroupQuery(orgId, request)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// Search EntitiesHandler - Get Entities
func searchEntityWithChildCountHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var parentCollection = c.Params("parent_collection")
	var keyColumn = c.Params("key_column")
	var childCollection = c.Params("child_collection")
	var lookupColumn = c.Params("lookup_column")
	var conditions []helper.Filter
	err := c.BodyParser(&conditions)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	response, err := helper.GetSearchQueryWithChildCount(orgId, parentCollection, keyColumn, childCollection, lookupColumn, conditions)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func sharedDBEntityHandler(c *fiber.Ctx) error {
	var collectionName = c.Params("collectionName")
	if collectionName == "db_config" {
		return helper.BadRequest("Access Denied")
	}
	cur, err := database.SharedDB.Collection(collectionName).Find(ctx, bson.D{})
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	var response []bson.M
	if err = cur.All(ctx, &response); err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// Search EntitiesHandler - Get Entities
func rawQueryHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	var collectionName = c.Params("collectionName")
	var query map[string]interface{}
	err := c.BodyParser(&query)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	helper.UpdateDateObject(query)
	var response []primitive.M
	if c.Params("type") == "aggregate" {
		response, err = helper.GetAggregateQueryResult(orgId, collectionName, query)
	} else {
		response, err = helper.GetQueryResult(orgId, collectionName, query, int64(0), int64(200), nil)
	}
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func getNextSeqNumberHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	return c.JSON(helper.GetNextSeqNumber(orgId, c.Params("key")))
}

func getPreSignedUploadUrlHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	request := new(PreSignedUploadUrlRequest)
	err := c.BodyParser(request)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	fileName := request.FolderPath + "/" + request.FileKey
	return c.JSON(helper.GetUploadUrl("tpctrz", fileName, request.MetaData))
}
func postTimesheetDocHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}

	inputData := make(map[string]interface{})
	err := c.BodyParser(&inputData)
	if err != nil {
		return helper.BadRequest(err.Error())
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
		return helper.BadRequest(err.Error())
	}
	fmt.Println(len(response))
	//var res []primitive.M
	//var upfilter primitive.A

	if len(response) == 0 {

		insertData(c, orgId, "timesheet", inputData)
		if inputData["Approval Status"] == "Approved" || inputData["Approval Status"] == "Rejected" || inputData["Approval Status"] == "Hold" {
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"taskid": inputData["task_id"]},
				bson.M{
					"$set": bson.M{
						//"totalworkedhours":  inputData["workedhours"],
						//"status": inputData["status"],
						"Approval Status": inputData["Approval Status"],
					},
				},
				options.Update().SetUpsert(true))
			if err != nil {
				log.Print(err.Error())
			}
		} else {
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"taskid": inputData["task_id"]},
				bson.M{
					"$set": bson.M{
						"totalworkedhours": inputData["workedhours"],
						"status":           inputData["status"],
						//"Approval Status":inputData["Approval Status"],

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
			return helper.BadRequest(err.Error())
		} else {
			res, err := timesheetgroup(orgId, response)
			fmt.Println(res[0]["status"])
			if err != nil {
				return helper.BadRequest("g" + err.Error())
			}
			_, err = database.GetConnection(orgId).Collection("task").UpdateOne(
				ctx,
				bson.M{"taskid": response[0]["task_id"]},
				bson.M{
					"$set": bson.M{
						"totalworkedhours": res[0]["workedhours"],
						"status":           res[0]["status"],
						"Approval Status":  inputData["Approval Status"],
					},
				},
				options.Update().SetUpsert(true))
			if err != nil {
				log.Print(err.Error())
			}
			return helper.SuccessResponse(c, respons)
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
		return nil, helper.BadRequest(err.Error())
	}
	fmt.Println(res)
	return res, nil
}
func getUnscheduleIdHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

// func putEntityByID(c *fiber.Ctx, putType string) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return helper.BadRequest("Organization Id missing")
// 	}
// 	token := helper.GetUserTokenValue(c)
// 	filter := helper.DocIdFilter(c.Params("id"))
// 	var collectionName = c.Params("collectionName")
// 	var inputData map[string]interface{}
// 	err := c.BodyParser(&inputData)
// 	if err != nil {
// 		return helper.BadRequest(err.Error())
// 	}
// 	//update date string to time object
// 	helper.UpdateDateObject(inputData)

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
// 		return helper.BadRequest(err.Error())
// 	}
// 	return helper.SuccessResponse(c, response)
// }

func handleFileUpload(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)
	fmt.Println(token)
	//var result []interface{}
	//var urll string
	var storageNames []interface{}
	//fileURLs := make(map[string][]string)
	InitS3Client()
	employeeID := c.FormValue("id")
	role := c.FormValue("role")
	details_type := c.FormValue("details_type")

	// Get the files from the form field "files"
	form, err := c.MultipartForm()
	if err != nil {
		return helper.BadRequest("Failed to retrieve files from the request")
	}

	files := form.File["file"]

	// Create a folder for the employee ID
	employeeFolder := "./" + employeeID
	err = os.MkdirAll(employeeFolder, 0755)
	if err != nil {
		return helper.BadRequest("Failed to create employee folder")
	}

	for _, file := range files {
		// Create the local file
		localFilePath := employeeFolder + "/" + file.Filename
		localFile, err := os.Create(localFilePath)
		if err != nil {
			return helper.BadRequest("Failed to create local file")
		}

		// Open the uploaded file
		uploadedFile, err := file.Open()
		if err != nil {
			localFile.Close() // Close the local file in case of an error
			return helper.BadRequest("Failed to open uploaded file")
		}

		// Copy the content of the uploaded file to the local file
		_, err = io.Copy(localFile, uploadedFile)
		if err != nil {
			localFile.Close() // Close the local file in case of an error
			return helper.BadRequest("Failed to copy file content")
		}

		localFile.Close() // Close the local file after copying

		// Upload the local file to S3
		fileKey, urll := S3PdfFileUpload(s3Client, localFilePath, employeeID, role, details_type)
		if err != nil {
			return helper.BadRequest("Failed to upload file to S3")
			fmt.Println(fileKey)
		}
		//fmt.Println(urll)

		apiResponse := bson.M{"e_id": employeeID, "uploaded_by": token.UserId, "file_name": file.Filename, "storage_name": urll, "size": file.Size}
		insertData(c, orgId, "user_files", apiResponse)

		//result = append(result, apiResponse)
		err = os.Remove(localFilePath)
		if err != nil {
			log.Println("Failed to delete the local PDF file:", err)
		}

		storageNames = append(storageNames, urll)
	}
	// _,err= database.GetConnection(orgId).Collection(role).UpdateOne(
	// 	ctx,
	// 	bson.M{role+"id": employeeID },
	// 	bson.M{
	// 		"$set": bson.M{
	// 			details_type:storageNames ,

	// 		},
	// 	},
	// 	 options.Update().SetUpsert(true))

	// if err != nil {
	// 	log.Print(err.Error())
	// }
	return helper.SuccessResponse(c, storageNames)
}

func getFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("category")
	refId := c.Params("refId")
	//	token := helper.GetUserTokenValue(c)
	query := bson.M{"ref_id": refId, "category": fileCategory}
	response, err := helper.GetQueryResult(orgId, "user_files", query, int64(0), int64(200), nil)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func getAllFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("category")
	//status := c.Params("status")
	page := c.Params("page")
	limit := c.Params("limit")
	query := bson.M{"category": fileCategory}
	response, err := helper.GetQueryResult(orgId, "user_files", query, helper.Page(page), helper.Limit(limit), nil)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}

func taskAllocHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
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
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, response)
}
