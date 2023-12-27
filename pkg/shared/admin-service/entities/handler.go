package entities

import (
	"context"
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
	org, exists := helper.GetOrg(c)
	if !exists {
		return shared.BadRequest("Invalid Org Id")
	}

	userToken := utils.GetUserTokenValue(c)
	// modelName := c.Params("model_name")

	// collectionName, err := helper.CollectionNameGet(modelName, org.Id)
	// if err != nil {
	// 	return shared.BadRequest("Invalid CollectionName")
	// }

	// inputData, errmsg := helper.InsertValidateInDatamodel(collectionName, string(c.Body()), org.Id)
	// if errmsg != nil {
	// 	// errmsg is map to string
	// 	for key, value := range errmsg {
	// 		return shared.BadRequest(fmt.Sprintf("%s is a %s", key, value))
	// 	}
	// }

	collectionName := c.Params("model_name")
	var inputData map[string]interface{}
	c.BodyParser(&inputData)
	// to paras the Datatype
	helper.UpdateDateObject(inputData)
	handleIDGeneration(inputData, org.Id)

	if collectionName == "user" {
		err := OnboardingProcessing(org.Id, inputData["_id"].(string), "Onboarding", "user")
		if err != nil {
			return shared.BadRequest("Invalid user Id")
		}
	} else if collectionName == "data_model" || collectionName == "model_config" {
		inputData["status"] = "A"
	}

	inputData["created_on"] = time.Now()
	inputData["created_by"] = userToken.UserId

	res, err := Insert(org.Id, collectionName, inputData)
	if err != nil {
		return shared.BadRequest("Failed to insert data into the database " + err.Error())
	}

	if collectionName == "data_model" && res.InsertedID != nil {
		go helper.ServerInitstruct(org.Id)
	}

	return shared.SuccessResponse(c, fiber.Map{
		"message":   "Insert Successfully",
		"insert ID": res.InsertedID,
	})
}

func Insert(orgId string, collectionName string, inputData map[string]interface{}) (*mongo.InsertOneResult, error) {
	res, err := database.GetConnection(orgId).Collection(collectionName).InsertOne(ctx, inputData)

	return res, err
}

// handleIDGeneration generates or handles the ID in the input data.
func handleIDGeneration(inputData bson.M, orgID string) {
	if inputData["_id"] != nil {
		result, err := helper.HandleSequenceOrder(inputData["_id"].(string), orgID)
		if err == nil {
			inputData["_id"] = result
		}
	} else {
		// fmt.Println("sdagsd")
		inputData["_id"] = helper.Generateuniquekey()
	}
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

	// collectionName, err := helper.CollectionNameGet(c.Params("model_name"), org.Id)
	// if err != nil {
	// return shared.BadRequest("Invalid CollectionName")
	// }

	// // Validate the input data based on the data model
	// inputData, validationErrors := helper.UpdateValidateInDatamodel(collectionName, string(c.Body()), org.Id)
	// if validationErrors != nil {
	// 	//Handle validation errors with status code 400 (Bad Request)
	// 	jsonstring, _ := json.Marshal(validationErrors)
	// 	return shared.BadRequest(string(jsonstring))
	// }

	// updatedDatas := make(map[string]interface{})
	// // update for nested fields
	// UpdateData := helper.UpdateFieldsWithParentKey(inputData, "", updatedDatas)
	collectionName := c.Params("model_name")
	var UpdateData map[string]interface{}
	c.BodyParser(&UpdateData)
	helper.UpdateDateObject(UpdateData)

	update := bson.M{
		"$set": UpdateData,
	}

	UpdateData["update_on"] = time.Now()
	UpdateData["update_by"] = userToken.UserId
	// Update data in the collection
	res, err := database.GetConnection(org.Id).Collection(collectionName).UpdateOne(ctx, helper.DocIdFilter(c.Params("id")), update, updateOpts)
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

// Old Pms code
func getDocByIddHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	collectionName := c.Params("collectionName")
	projectid := c.Params("projectid")
	// module Collection
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

	filter = bson.A{
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "timesheet"},
					{"localField", "_id"},
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

// /  workedhour/:employee_id/:scheduledstartdate   //todo don't use
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
	filter = bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 00, 00, 0, 0, time.UTC)}}},
					{"status",
						bson.D{
							{"$nin",
								bson.A{
									"Completed",
								},
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "timesheet"},
					{"localField", "_id"},
					{"foreignField", "task_id"},
					{"as", "timesheet"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$timesheet"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id",
						bson.D{
							{"employeeid", "$assigned_to"},
							{"task_id", "$_id"},
						},
					},
					{"totalworkedhours", bson.D{{"$first", "$totalworkedhours"}}},
					{"id", bson.D{{"$first", "$_id"}}},
					{"allocated_hours", bson.D{{"$first", "$allocated_hours"}}},
					{"requirement_id", bson.D{{"$first", "$requirement_id"}}},
					{"totalworkedhours", bson.D{{"$sum", "$timesheet.workedhours"}}},
					{"status", bson.D{{"$first", "$status"}}},
					{"task_name", bson.D{{"$first", "$task_name"}}},
					{"scheduled_start_date", bson.D{{"$first", "$scheduled_start_date"}}},
					{"scheduled_end_date", bson.D{{"$first", "$scheduled_end_date"}}},
					{"project_id", bson.D{{"$first", "$project_id"}}},
					{"task_type", bson.D{{"$first", "$task_type"}}},
					{"timesheet", bson.D{{"$addToSet", "$timesheet"}}},
					{"timeSheetDate1", bson.D{{"$last", "$timesheet.timeSheetDate"}}},
					{"timeSheetDate", bson.D{{"$first", "$timesheet.timeSheetDate"}}},
				},
			},
		},
		bson.D{{"$unwind", bson.D{{"path", "$timesheet"}}}},
		bson.D{
			{"$match",
				bson.D{
					{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, time.UTC)}}},
					{"scheduled_end_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}},
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
										// bson.D{{"status", bson.D{{"$eq", "Completed"}}}},
										bson.D{{"status", "Completed"}},
										bson.D{{"timeSheetDate", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}}},
										bson.D{{"timeSheetDate1", bson.D{{"$gte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}}},
									},
								},
							},
							bson.D{
								{"$and",
									bson.A{
										bson.D{{"status", bson.D{{"$ne", "Completed"}}}},
										bson.D{{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 23, 32, 5, 0, time.UTC)}}}},
										bson.D{{"scheduled_start_date", bson.D{{"$lte", time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, time.UTC)}}}},
									},
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$addFields", bson.D{{"employeeid", "$employeeid"}}}},
		bson.D{{"$addFields", bson.D{{"_id", "$id"}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "project"},
					{"localField", "project_id"},
					{"foreignField", "project_id"},
					{"as", "project"},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id",
						bson.D{
							{"employeeid", "$assigned_to"},
							{"task_id", "$_id"},
						},
					},
					{"totalworkedhours", bson.D{{"$first", "$totalworkedhours"}}},
					{"id", bson.D{{"$first", "$_id"}}},
					{"allocated_hours", bson.D{{"$first", "$allocated_hours"}}},
					{"requirement_id", bson.D{{"$first", "$requirement_id"}}},
					{"totalworkedhours", bson.D{{"$sum", "$timesheet.workedhours"}}},
					{"status", bson.D{{"$first", "$status"}}},
					{"task_name", bson.D{{"$first", "$task_name"}}},
					{"project_name", bson.D{{"$first", "$project.project_name"}}},

					{"scheduled_start_date", bson.D{{"$first", "$scheduled_start_date"}}},
					{"scheduled_end_date", bson.D{{"$first", "$scheduled_end_date"}}},
					{"project_id", bson.D{{"$first", "$project_id"}}},
					{"task_type", bson.D{{"$first", "$task_type"}}},
					{"timesheet", bson.D{{"$addToSet", "$timesheet"}}},
					{"timeSheetDate1", bson.D{{"$last", "$timesheet.timeSheetDate"}}},
					{"timeSheetDate", bson.D{{"$first", "$timesheet.timeSheetDate"}}},
				},
			},
		},
		bson.D{
			{"$unset",
				bson.A{
					"id",
					"timeSheetDate1",
					"timeSheetDate",
				},
			},
		},
	}

	fmt.Println(date)

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
	return shared.SuccessResponse(c, response)
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
	fmt.Println(Response)
	return shared.SuccessResponse(c, Response)
}

// !pending
// OnboardingProcessing  -- METHOD Onboarding processing for user and send the email
func OnboardingProcessing(orgId, email, emailtype, category string) error {
	// Generate the 'decoding' value (replace this with your actual logic)
	decoding := helper.Generateuniquekey()

	filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"title", category},
					{"emailtype", emailtype},
				},
			},
		},
	}

	Response, err := helper.GetAggregateQueryResult(orgId, "email_template", filter)
	if err != nil {
		fmt.Println("Err",
			err.Error(),
		)

	}

	if err := SimpleEmailHandler(email, os.Getenv("CLIENT_EMAIL"), "Welcome to pms Onboarding", replacestring(Response[0]["template"].(string), fmt.Sprintf("%s%s%s", Response[0]["link"].(string), `=`, decoding))); err == nil {
		// If email sending was successful
		if err := UsertemporaryStoringData(email, decoding); err != nil {
			log.Println("Failed to insert user junked files:", err)
		}
	} else {
		return shared.BadRequest("Email sending failed:")
	}

	return nil
}

func replacestring(template, Replacement string) string {

	return strings.ReplaceAll(template, `{{link}}`, Replacement)
}

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
								<a href="{{link}}" style="background-color: #007BFF; color: #fff; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">Activation Now</a>
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

// + link +
func UsertemporaryStoringData(requestMail, appToken string) error {
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

func SimpleEmailHandler(recipientEmail string, senderEmail string, subject string, body string) error {
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
// 	res := helper.SendEmail(orgId, strings.Split(requestData["to"], ","), strings.Split(requestData["cc"], ","), requestData["subject"], requestData["body"])
// 	if res {
// 		// return shared.SuccessResponse(c, "Email Sent")
// 	}
// 	return shared.BadRequest("Try again")
// }

// // Search EntitiesHandler - Get Entities
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

func getFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("folder")
	refId := c.Params("refId")
	//	token := shared.GetUserTokenValue(c)
	query := bson.M{"ref_id": refId, "folder": fileCategory}

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

func TaskRequeriment(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	filter := bson.A{
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
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
	}

	// bson.A{
	// 	bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "task"},
	// 				{"localField", "_id"},
	// 				{"foreignField", "requirement_id"},
	// 				{"as", "task"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$unwind",
	// 			bson.D{
	// 				{"path", "$task"},
	// 				{"preserveNullAndEmptyArrays", true},
	// 			},
	// 		},
	// 	},
	// 	// bson.D{{"$addFields", bson.D{{"task_id", "$task._id"}}}},
	// 	// bson.D{{"$addFields", bson.D{{"task._id", "$task.requirement_id"}}}},
	// }
	response, err := helper.GetAggregateQueryResult(org.Id, "requirement", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
	})
}
func RequrimentObjectproject(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	filter :=
		bson.A{
			bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "task"},
						{"localField", "_id"},
						{"foreignField", "requirement_id"},
						{"as", "taskresult"},
					},
				},
			},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "testcase"},
						{"localField", "_id"},
						{"foreignField", "requirement_id"},
						{"as", "tasecaseresult"},
					},
				},
			},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "employee"},
						{"localField", "taskresult.assigned_to"},
						{"foreignField", "employee_id"},
						{"as", "employeeResult"},
					},
				},
			},
			bson.D{
				{"$addFields",
					bson.D{
						{"number_of_Task_count", bson.D{{"$size", "$taskresult"}}},
						{"number_of_TestCase_count", bson.D{{"$size", "$tasecaseresult"}}},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$taskresult"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$employeeResult"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$addFields",
					bson.D{
						{"taskresult.employee_name",
							bson.D{
								{"$concat",
									bson.A{
										"$employeeResult.first_name",
										" ",
										"$employeeResult.last_name",
									},
								},
							},
						},
					},
				},
			},
			bson.D{{"$unset", "employeeResult"}},
			bson.D{
				{"$group",
					bson.D{
						{"_id", "$_id"},
						{"taskresult", bson.D{{"$push", "$taskresult"}}},
						{"tasecaseresult", bson.D{{"$addToSet", "$tasecaseresult"}}},
						{"requirement_name", bson.D{{"$first", "$requirement_name"}}},
						{"requirement_description", bson.D{{"$first", "$requirement_description"}}},
						{"project_id", bson.D{{"$first", "$project_id"}}},
						{"parentmodulename", bson.D{{"$first", "$parentmodulename"}}},
						{"created_on", bson.D{{"$first", "$created_on"}}},
						{"created_by", bson.D{{"$first", "$created_by"}}},
						{"sprint_id", bson.D{{"$first", "$sprint_id"}}},
						{"update_by", bson.D{{"$first", "$update_by"}}},
						{"module_id", bson.D{{"$first", "$module_id"}}},
						{"number_of_Task_count", bson.D{{"$first", "$number_of_Task_count"}}},
						{"number_of_TestCase_count", bson.D{{"$first", "$number_of_TestCase_count"}}},

						{"tasecaseresult", bson.D{{"$first", "$tasecaseresult"}}},
					},
				},
			},
			bson.D{{"$sort", bson.D{{"created_on", 1}}}},
		}
	// filter :=
	// 	bson.A{
	// 		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
	// 		bson.D{
	// 			{"$lookup",
	// 				bson.D{
	// 					{"from", "task"},
	// 					{"localField", "_id"},
	// 					{"foreignField", "requirement_id"},
	// 					{"as", "taskresult"},
	// 				},
	// 			},
	// 		},
	// 		bson.D{
	// 			{"$lookup",
	// 				bson.D{
	// 					{"from", "testcase"},
	// 					{"localField", "_id"},
	// 					{"foreignField", "requirement_id"},
	// 					{"as", "tasecaseresult"},
	// 				},
	// 			},
	// 		},
	// 		// bson.D{{"$match", bson.D{{"taskresult.status", bson.D{{"$ne", "Completed"}}}}}},
	// 		bson.D{
	// 			{"$lookup",
	// 				bson.D{
	// 					{"from", "employee"},
	// 					{"localField", "taskresult.assigned_to"},
	// 					{"foreignField", "employee_id"},
	// 					{"as", "employeeResult"},
	// 				},
	// 			},
	// 		},
	// 		bson.D{
	// 			{"$addFields",
	// 				bson.D{
	// 					{"number_of_Task_count", bson.D{{"$size", "$taskresult"}}},
	// 					{"number_of_TestCase_count", bson.D{{"$size", "$tasecaseresult"}}},
	// 				},
	// 			},
	// 		},
	// 		bson.D{
	// 			{"$addFields",
	// 				bson.D{
	// 					{"taskresult.employee_name",
	// 						bson.D{
	// 							{"$reduce",
	// 								bson.D{
	// 									{"input", "$employeeResult"},
	// 									{"initialValue", ""},
	// 									{"in",
	// 										bson.D{
	// 											{"$concat",
	// 												bson.A{
	// 													"$$value",
	// 													bson.D{
	// 														{"$cond",
	// 															bson.A{
	// 																bson.D{
	// 																	{"$eq",
	// 																		bson.A{
	// 																			"$$value",
	// 																			"",
	// 																		},
	// 																	},
	// 																},
	// 																"",
	// 																" ",
	// 															},
	// 														},
	// 													},
	// 													"$$this.first_name",
	// 													" ",
	// 													"$$this.last_name",
	// 												},
	// 											},
	// 										},
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 		bson.D{{"$unset", "employeeResult"}},
	// 	}
	response, err := helper.GetAggregateQueryResult(org.Id, "requirement", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
		// "pipeline": filter,
	})
}

func regressionproject(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	filter := bson.A{
		bson.D{{"$match", bson.D{{"_id", c.Params("regression_id")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "requirement"},
					{"localField", "sprint_id"},
					{"foreignField", "sprint_id"},
					{"as", "requirement"},
				},
			},
		},
		bson.D{{"$unwind", bson.D{{"path", "$requirement"}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "testcase"},
					{"localField", "requirement._id"},
					{"foreignField", "requirement_id"},
					{"as", "testcase"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "test_result"},
					{"localField", "testcase._id"},
					{"foreignField", "testCase_id"},
					{"as", "test_result"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "test_result.doneBy"},
					{"foreignField", "employee_id"},
					{"as", "employee_result"},
				},
			},
		},
		bson.D{
			{"$set",
				bson.D{
					{"test_result.employee_name",
						bson.D{
							{"$arrayElemAt",
								bson.A{
									"$employee_result.first_name",
									0,
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$unset", "employee_result"}},
	}
	response, err := helper.GetAggregateQueryResult(org.Id, "regression", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
	})
}

// filter := bson.A{
// 		bson.D{{"$match", bson.D{{"_id", c.Params("regression_id")}}}},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "requirement"},
// 					{"localField", "sprint_id"},
// 					{"foreignField", "sprint_id"},
// 					{"as", "requirement"},
// 				},
// 			},
// 		},
// 		bson.D{{"$unwind", "$requirement"}},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "testcase"},
// 					{"localField", "requirement._id"},
// 					{"foreignField", "requirement_id"},
// 					{"as", "testcase"},
// 				},
// 			},
// 		},
// 	}

func HandlerBugReport(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	filter := bson.A{}
	regression_id := c.Params("regression_id")
	if regression_id != "" {
		fmt.Println("INSIDE")
		filter = append(filter, bson.D{{"$match", bson.D{{"regression_id", regression_id}}}})
	}
	filter = append(filter,
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "testcase"},
					{"localField", "test_case_id"},
					{"foreignField", "_id"},
					{"as", "testcase"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "test_result"},
					{"localField", "test_result_id"},
					{"foreignField", "_id"},
					{"as", "test_result"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$testcase"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$test_result"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "requirement"},
					{"localField", "testcase.requirement_id"},
					{"foreignField", "_id"},
					{"as", "requirement"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$requirement"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		// bson.D{
		// 	{"$lookup",
		// 		bson.D{
		// 			{"from", "task"},
		// 			{"localField", "requirement._id"},
		// 			{"foreignField", "requirement_id"},
		// 			{"as", "task"},
		// 		},
		// 	},
		// },
		// bson.D{
		// 	{"$unwind",
		// 		bson.D{
		// 			{"path", "$task"},
		// 			{"preserveNullAndEmptyArrays", true},
		// 		},
		// 	},
		// },
		// bson.D{
		// 	{"$lookup",
		// 		bson.D{
		// 			{"from", "employee"},
		// 			{"localField", "task.assigned_to"},
		// 			{"foreignField", "employee_id"},
		// 			{"as", "taskemployee"},
		// 		},
		// 	},
		// },
		// bson.D{
		// 	{"$unwind",
		// 		bson.D{
		// 			{"path", "$taskemployee"},
		// 			{"preserveNullAndEmptyArrays", true},
		// 		},
		// 	},
		// },
		// bson.D{
		// 	{"$addFields",
		// 		bson.D{
		// 			{"taskemploye_name",
		// 				bson.D{
		// 					{"$concat",
		// 						bson.A{
		// 							"$taskemployee.first_name",
		// 							" ",
		// 							"$taskemployee.first_name",
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// },
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "test_result.doneBy"},
					{"foreignField", "employee_id"},
					{"as", "bugemployee"},
				},
			},
		},
		bson.D{{"$unwind", bson.D{{"path", "$bugemployee"}, {"preserveNullAndEmptyArrays", true}}}},
		bson.D{
			{"$addFields",
				bson.D{
					{"bugemploye_name",
						bson.D{
							{"$concat",
								bson.A{
									"$bugemployee.first_name",
									" ",
									"$bugemployee.first_name",
								},
							},
						},
					},
				},
			},
		},
	)

	response, err := helper.GetAggregateQueryResult(org.Id, "bug", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
	})
}

// team_specification   --METHOD to get the empolyee_name on team_specifcaiton data
func team_specification(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// query := bson.A{
	// 	bson.D{{"$match", bson.D{{"parentmodulename", bson.D{{"$ne", ""}}}}}},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "employee"},
	// 				{"localField", "user_id"},
	// 				{"foreignField", "employee_id"},
	// 				{"as", "employee"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unwind", bson.D{{"path", "$employee"}}}},
	// 	bson.D{
	// 		{"$addFields",
	// 			bson.D{
	// 				{"employe_name",
	// 					bson.D{
	// 						{"$concat",
	// 							bson.A{
	// 								"$employee.first_name",
	// 								" ",
	// 								"$employee.first_name",
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unset", "employee"}},
	// }
	query := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"project_id", c.Params("projectid")},
					{"parentmodulename", bson.D{{"$ne", ""}}},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "user_id"},
					{"foreignField", "employee_id"},
					{"as", "employee"},
				},
			},
		},
		bson.D{{"$unwind", "$employee"}},
		bson.D{
			{"$addFields",
				bson.D{
					{"employe_name",
						bson.D{
							{"$concat",
								bson.A{
									"$employee.first_name",
									" ",
									"$employee.last_name",
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$unset", "employee"}},
	}
	response, err := helper.GetAggregateQueryResult(org.Id, "team_specification", query)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
		// "pipeline": filter,
	})
}

func RealseSpirntList(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	query := bson.A{
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "sprint"},
					{"localField", "_id"},
					{"foreignField", "release_id"},
					{"as", "sprint"},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"_id", 1},
					{"name", 1},
					{"start_date", 1},
					{"end_date", 1},
					{"description", 1},
					{"project_id", 1},
					{"status", 1},
					{"sprint_ids", "$sprint._id"},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(org.Id, "release", query)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
		// "pipeline": filter,
	})
}

func team_specificationList(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// query := bson.A{
	// 	bson.D{{"$match", bson.D{{"parentmodulename", bson.D{{"$ne", ""}}}}}},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "employee"},
	// 				{"localField", "user_id"},
	// 				{"foreignField", "employee_id"},
	// 				{"as", "employee"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unwind", bson.D{{"path", "$employee"}}}},
	// 	bson.D{
	// 		{"$addFields",
	// 			bson.D{
	// 				{"employe_name",
	// 					bson.D{
	// 						{"$concat",
	// 							bson.A{
	// 								"$employee.first_name",
	// 								" ",
	// 								"$employee.first_name",
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unset", "employee"}},
	// }
	// query := bson.A{
	// 	bson.D{
	// 		{"$match",
	// 			bson.D{
	// 				{"project_id", c.Params("projectid")},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "employee"},
	// 				{"localField", "user_id"},
	// 				{"foreignField", "employee_id"},
	// 				{"as", "employee"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unwind", "$employee"},{"preserveNullAndEmptyArrays", true},},
	// 	bson.D{
	// 		{"$addFields",
	// 			bson.D{
	// 				{"employe_name",
	// 					bson.D{
	// 						{"$concat",
	// 							bson.A{
	// 								"$employee.first_name",
	// 								" ",
	// 								"$employee.last_name",
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unset", "employee"}},
	// }
	// query := bson.A{
	// 	bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "employee"},
	// 				{"localField", "user_id"},
	// 				{"foreignField", "employee_id"},
	// 				{"as", "employee"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$unwind",
	// 			bson.D{
	// 				{"path", "$employee"},
	// 				{"preserveNullAndEmptyArrays", true},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$addFields",
	// 			bson.D{
	// 				{"employe_name",
	// 					bson.D{
	// 						{"$concat",
	// 							bson.A{
	// 								"$employee.first_name",
	// 								" ",
	// 								"$employee.last_name",
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unset", "employee"}},
	// }
	query := bson.A{
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "user_id"},
					{"foreignField", "employee_id"},
					{"as", "employee"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$employee"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"employe_name",
						bson.D{
							{"$concat",
								bson.A{
									"$employee.first_name",
									" ",
									"$employee.last_name",
								},
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "approved_by"},
					{"foreignField", "employee_id"},
					{"as", "approved"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$approved"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"approved_by_name",
						bson.D{
							{"$concat",
								bson.A{
									"$approved.first_name",
									" ",
									"$approved.last_name",
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
					"approved",
					"employee",
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(org.Id, "team_specification", query)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return c.JSON(response)
}

func regressionTestcase(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// query := bson.A{
	// 	bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
	// 	bson.D{
	// 		{"$lookup",
	// 			bson.D{
	// 				{"from", "testcase"},
	// 				{"localField", "project_id"},
	// 				{"foreignField", "project_id"},
	// 				{"as", "testcase"},
	// 			},
	// 		},
	// 	},
	// 	bson.D{{"$unwind", "$testcase"}},
	// 	bson.D{
	// 		{"$group",
	// 			bson.D{
	// 				{"_id", "$_id"},
	// 				{"ResultPassCount",
	// 					bson.D{
	// 						{"$sum",
	// 							bson.D{
	// 								{"$cond",
	// 									bson.A{
	// 										bson.D{
	// 											{"$eq",
	// 												bson.A{
	// 													"$testcase.test_case_scenario",
	// 													"P",
	// 												},
	// 											},
	// 										},
	// 										1,
	// 										0,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{"ResultFailCount",
	// 					bson.D{
	// 						{"$sum",
	// 							bson.D{
	// 								{"$cond",
	// 									bson.A{
	// 										bson.D{
	// 											{"$eq",
	// 												bson.A{
	// 													"$testcase.test_case_scenario",
	// 													"N",
	// 												},
	// 											},
	// 										},
	// 										1,
	// 										0,
	// 									},
	// 								},
	// 							},
	// 						},
	// 					},
	// 				},
	// 				{"regression_id", bson.D{{"$first", "$regression_id"}}},
	// 				{"status", bson.D{{"$first", "$status"}}},
	// 				{"description", bson.D{{"$first", "$description"}}},
	// 				{"project_id", bson.D{{"$first", "$project_id"}}},
	// 				{"created_on", bson.D{{"$first", "$created_on"}}},
	// 				{"created_by", bson.D{{"$first", "$created_by"}}},
	// 				{"sprint_id", bson.D{{"$first", "$sprint_id"}}},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$addFields",
	// 			bson.D{
	// 				{"ResultCount",
	// 					bson.D{
	// 						{"$sum",
	// 							bson.A{
	// 								"$ResultPassCount",
	// 								"$ResultFailCount",
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$project",
	// 			bson.D{
	// 				{"_id", 1},
	// 				{"regression_id", 1},
	// 				{"description", 1},
	// 				{"project_id", 1},
	// 				{"created_on", 1},
	// 				{"status", 1},
	// 				{"created_by", 1},
	// 				{"sprint_id", 1},
	// 				{"ResultPassCount", 1},
	// 				{"ResultFailCount", 1},
	// 				{"ResultCount", 1},
	// 			},
	// 		},
	// 	},
	// }c.Params("projectid")
	query := bson.A{
		bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "requirement"},
					{"localField", "sprint_id"},
					{"foreignField", "sprint_id"},
					{"as", "requirement"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$requirement"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "testcase"},
					{"localField", "requirement._id"},
					{"foreignField", "requirement_id"},
					{"as", "testcase"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$testcase"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$_id"},
					// {"id", bson.D{{"$first", "$_id"}}},
					{"ResultPassCount",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											bson.D{
												{"$eq",
													bson.A{
														"$testcase.test_case_scenario",
														"P",
													},
												},
											},
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"ResultFailCount",
						bson.D{
							{"$sum",
								bson.D{
									{"$cond",
										bson.A{
											bson.D{
												{"$eq",
													bson.A{
														"$testcase.test_case_scenario",
														"N",
													},
												},
											},
											1,
											0,
										},
									},
								},
							},
						},
					},
					{"regression_id", bson.D{{"$first", "$regression_id"}}},
					{"status", bson.D{{"$first", "$status"}}},
					{"description", bson.D{{"$first", "$description"}}},
					{"project_id", bson.D{{"$first", "$project_id"}}},
					{"created_on", bson.D{{"$first", "$created_on"}}},
					{"created_by", bson.D{{"$first", "$created_by"}}},
					{"sprint_id", bson.D{{"$first", "$sprint_id"}}},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"_id", 1},
					{"regression_id", 1},
					{"description", 1},
					{"project_id", 1},
					{"created_on", 1},
					{"status", 1},
					{"created_by", 1},
					{"sprint_id", 1},
					{"ResultPassCount", 1},
					{"ResultFailCount", 1},
					{"ResultCount",
						bson.D{
							{"$add",
								bson.A{
									"$ResultPassCount",
									"$ResultFailCount",
								},
							},
						},
					},
				},
			},
		},
	}
	response, err := helper.GetAggregateQueryResult(org.Id, "regression", query)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
		// "pipeline": filter,
	})
}
func team_specifcaiton(c *fiber.Ctx) error {

	org, exists := helper.GetOrg(c)
	if !exists {
		return shared.BadRequest("Invalid Org Id")
	}

	scheduledstartdate, _ := time.Parse(time.RFC3339, c.Params("startdate"))

	scheduledenddate, _ := time.Parse(time.RFC3339, c.Params("enddate"))

	pipeline := bson.A{
		bson.D{{"$match", bson.D{{"approved_by", c.Params("approved_by")}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "employee"},
					{"localField", "user_id"},
					{"foreignField", "employee_id"},
					{"as", "employee"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$employee"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "project"},
					{"localField", "project_id"},
					{"foreignField", "project_id"},
					{"as", "project"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$project"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"User_name",
						bson.D{
							{"$concat",
								bson.A{
									"$employee.first_name",
									" ",
									"$employee.last_name",
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$addFields", bson.D{{"project_name", "$project.project_name"}}}},
		bson.D{
			{"$unset",
				bson.A{
					"employee",
					"project",
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "task"},
					{"localField", "user_id"},
					{"foreignField", "assigned_to"},
					{"as", "task"},
				},
			},
		},
		bson.D{{"$match", bson.D{{"project_id", bson.D{{"$exists", true}}}}}},
		bson.D{
			{"$addFields",
				bson.D{
					{"task",
						bson.D{
							{"$filter",
								bson.D{
									{"input", "$task"},
									{"as", "task"},
									{"cond",
										bson.D{
											{"$eq",
												bson.A{
													"$$task.project_id",
													"$project_id",
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$task"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "timesheet"},
					{"localField", "task._id"},
					{"foreignField", "task_id"},
					{"as", "timesheet"},
				},
			},
		},
		bson.D{{"$addFields", bson.D{{"totalworkedhours", bson.D{{"$sum", "$timesheet.workedhours"}}}}}},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$timesheet"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$match",
				bson.D{
					{"task.status", "Completed"},
					{"timesheet.status", "Completed"},
				},
			},
		},
		bson.D{
			{"$addFields",
				bson.D{
					{"end", "$task.scheduled_end_date"},
					{"start", "$task.scheduled_start_date"},
					{"Completed_On", "$timesheet.entry_Date"},
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
										bson.D{
											{"$expr",
												bson.D{
													{"$gte",
														bson.A{
															bson.D{
																{"$dateToString",
																	bson.D{
																		{"format", "%Y-%m-%d"},
																		{"date", "$start"},
																		{"timezone", "UTC"},
																	},
																},
															},
															scheduledstartdate,
														},
													},
												},
											},
										},
										bson.D{
											{"$expr",
												bson.D{
													{"$lte",
														bson.A{
															bson.D{
																{"$dateToString",
																	bson.D{
																		{"format", "%Y-%m-%d"},
																		{"date", "$end"},
																		{"timezone", "UTC"},
																	},
																},
															},
															scheduledenddate,
														},
													},
												},
											},
										},
									},
								},
							},
							bson.D{
								{"$expr",
									bson.D{
										{"$gte",
											bson.A{
												bson.D{
													{"$dateToString",
														bson.D{
															{"format", "%Y-%m-%d"},
															{"date", "$Completed_On"},
															{"timezone", "UTC"},
														},
													},
												},
												scheduledstartdate,
											},
										},
									},
								},
							},
							bson.D{
								{"$expr",
									bson.D{
										{"$lte",
											bson.A{
												bson.D{
													{"$dateToString",
														bson.D{
															{"format", "%Y-%m-%d"},
															{"date", "$Completed_On"},
															{"timezone", "UTC"},
														},
													},
												},
												scheduledenddate,
											},
										},
									},
								},
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$task._id"},
					{"data", bson.D{{"$first", "$$ROOT"}}},
				},
			},
		},
		bson.D{{"$replaceRoot", bson.D{{"newRoot", "$data"}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "unschedule"},
					{"localField", "user_id"},
					{"foreignField", "entry_by"},
					{"as", "unschedule"},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(org.Id, "team_specification", pipeline)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println(response)
	return shared.SuccessResponse(c, response)

}

// func team_specifcaiton(c *fiber.Ctx) error {

// 	org, exists := helper.GetOrg(c)
// 	if !exists {
// 		return shared.BadRequest("Invalid Org Id")
// 	}
// 	// approved_by/:startdate/:enddate
// 	start_date := c.Params("startdate")
// 	end_date := c.Params("enddate")
// 	scheduled_start_date, _ := time.Parse(time.RFC3339, start_date)
// 	scheduled_end_date, _ := time.Parse(time.RFC3339, end_date)
// 	fmt.Println("Start date: ", scheduled_start_date)
// 	fmt.Println("End date: ", scheduled_end_date)
// 	pipeline := bson.A{
// 		bson.D{{"$match", bson.D{{"approved_by", c.Params("approved_by")}}}},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "employee"},
// 					{"localField", "user_id"},
// 					{"foreignField", "employee_id"},
// 					{"as", "employee"},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$unwind",
// 				bson.D{
// 					{"path", "$employee"},
// 					{"preserveNullAndEmptyArrays", true},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "project"},
// 					{"localField", "project_id"},
// 					{"foreignField", "project_id"},
// 					{"as", "project"},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$unwind",
// 				bson.D{
// 					{"path", "$project"},
// 					{"preserveNullAndEmptyArrays", true},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$addFields",
// 				bson.D{
// 					{"User_name",
// 						bson.D{
// 							{"$concat",
// 								bson.A{
// 									"$employee.first_name",
// 									" ",
// 									"$employee.last_name",
// 								},
// 							},
// 						},
// 					},
// 				},
// 			},
// 		},
// 		bson.D{{"$addFields", bson.D{{"project_name", "$project.project_name"}}}},
// 		bson.D{
// 			{"$unset",
// 				bson.A{
// 					"employee",
// 					"project",
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "task"},
// 					{"localField", "user_id"},
// 					{"foreignField", "assigned_to"},
// 					{"as", "task"},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$unwind",
// 				bson.D{
// 					{"path", "$task"},
// 					{"preserveNullAndEmptyArrays", true},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$lookup",
// 				bson.D{
// 					{"from", "timesheet"},
// 					{"localField", "task._id"},
// 					{"foreignField", "task_id"},
// 					{"as", "timesheet"},
// 				},
// 			},
// 		},
// 		bson.D{{"$addFields", bson.D{{"totalworkedhours", bson.D{{"$sum", "$timesheet.workedhours"}}}}}},
// 		bson.D{
// 			{"$unwind",
// 				bson.D{
// 					{"path", "$timesheet"},
// 					{"preserveNullAndEmptyArrays", true},
// 				},
// 			},
// 		},
// 		bson.D{
// 			{"$match",
// 				bson.D{
// 					{"task.status", "Completed"},
// 					{"timesheet.status", "Completed"},
// 				},
// 			},
// 		},
// 		bson.D{{"$addFields", bson.D{{"end", "$task.scheduled_end_date"}}}},
// 		bson.D{{"$addFields", bson.D{{"start", "$task.scheduled_start_date"}}}},
// 		bson.D{
// 			{"$match",
// 				bson.D{
// 					{"$and",
// 						bson.A{
// 							bson.D{
// 								{"start",
// 									bson.D{
// 										{"$gte", time.Date(scheduled_start_date.Year(), scheduled_start_date.Month(), scheduled_start_date.Day(), 0, 0, 0, 0, time.UTC)},
// 										{"$lte", time.Date(scheduled_start_date.Year(), scheduled_start_date.Month(), scheduled_start_date.Day(), 23, 59, 59, 0, time.UTC)},
// 									},
// 								},
// 							},
// 							bson.D{
// 								{"end",
// 									bson.D{
// 										{"$gte", time.Date(scheduled_end_date.Year(), scheduled_end_date.Month(), scheduled_end_date.Day(), 0, 0, 0, 0, time.UTC)},
// 										{"$lte", time.Date(scheduled_end_date.Year(), scheduled_end_date.Month(), scheduled_end_date.Day(), 23, 59, 59, 0, time.UTC)},
// 									},
// 								},
// 							},
// 						},
// 					},
// 				},
// 			},
// 		},
// 	}

// 	response, err := helper.GetAggregateQueryResult(org.Id, "team_specification", pipeline)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	// fmt.Println(response)
// 	return shared.SuccessResponse(c, response)

// }

// too
func getFinalTimesheet(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {
		return shared.BadRequest("Invalid Org Id")
	}
	//
	scheduledstartdate := c.Params("date")
	t, _ := time.Parse(time.RFC3339, scheduledstartdate)
	employee_id := c.Params("employee_id")

	start_date := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)

	// end_date := time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 0, time.UTC)

	formattedDate := start_date.Format("2006-01-02")

	pipeline :=
		bson.A{
			bson.D{
				{"$match",
					bson.D{
						{"$expr",
							bson.D{
								{"$lte",
									bson.A{
										bson.D{
											{"$dateToString",
												bson.D{
													{"format", "%Y-%m-%d"},
													{"date", "$scheduled_start_date"},
													{"timezone", "UTC"},
												},
											},
										},
										formattedDate,
									},
								},
							},
						},
					},
				},
			},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "timesheet"},
						{"localField", "_id"},
						{"foreignField", "task_id"},
						{"as", "timesheet"},
					},
				},
			},
			bson.D{
				{"$addFields",
					bson.D{
						{"totalworkedhours", bson.D{{"$sum", "$timesheet.workedhours"}}},
						{"Timeentry_Date", "$timesheet.entry_Date"},
						{"Project_name", "$project.project_name"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$timesheet"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$lookup",
					bson.D{
						{"from", "project"},
						{"localField", "project_id"},
						{"foreignField", "project_id"},
						{"as", "project"},
					},
				},
			},
			bson.D{
				{"$unwind",
					bson.D{
						{"path", "$project"},
						{"preserveNullAndEmptyArrays", true},
					},
				},
			},
			bson.D{
				{"$addFields",
					bson.D{
						{"Timeentry_Date", "$timesheet.entry_Date"},
						{"Project_name", "$project.project_name"},
					},
				},
			},
			bson.D{{"$unset", "project"}},
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
												{"$expr",
													bson.D{
														{"$eq",
															bson.A{
																bson.D{
																	{"$dateToString",
																		bson.D{
																			{"format", "%Y-%m-%d"},
																			{"date", "$Timeentry_Date"},
																			{"timezone", "UTC"},
																		},
																	},
																},
																formattedDate,
															},
														},
													},
												},
											},
										},
									},
								},
								bson.D{
									{"$and",
										bson.A{
											bson.D{
												{"$expr",
													bson.D{
														{"$lte",
															bson.A{
																bson.D{
																	{"$dateToString",
																		bson.D{
																			{"format", "%Y-%m-%d"},
																			{"date", "$scheduled_start_date"},
																			{"timezone", "UTC"},
																		},
																	},
																},
																formattedDate,
															},
														},
													},
												},
											},
										},
									},
								},
							},
						},
					},
				},
			},
			bson.D{{"$unset", "Timeentry_Date"}},
			bson.D{
				{"$group",
					bson.D{
						{"_id", "$_id"},
						{"timesheet", bson.D{{"$push", "$timesheet"}}},
						{"created_by", bson.D{{"$first", "$created_by"}}},
						{"requirement_id", bson.D{{"$first", "$requirement_id"}}},
						{"status", bson.D{{"$first", "$status"}}},
						{"task_type", bson.D{{"$first", "$task_type"}}},
						{"update_by", bson.D{{"$first", "$update_by"}}},
						{"update_on", bson.D{{"$first", "$update_on"}}},
						{"task_name", bson.D{{"$first", "$task_name"}}},
						{"allocated_hours", bson.D{{"$first", "$allocated_hours"}}},
						{"scheduled_end_date", bson.D{{"$first", "$scheduled_end_date"}}},
						{"scheduled_start_date", bson.D{{"$first", "$scheduled_start_date"}}},
						{"assigned_to", bson.D{{"$first", "$assigned_to"}}},
						{"project_id", bson.D{{"$first", "$project_id"}}},
						{"totalworkedhours", bson.D{{"$first", "$totalworkedhours"}}},
						{"Project_name", bson.D{{"$first", "$Project_name"}}},
						{"remarks", bson.D{{"$first", "$remarks"}}},
						{"approval_Status", bson.D{{"$first", "$Approval_Status"}}},
					},
				},
			},
		}

		// {"remarks", bson.D{{"$first", "$remarks"}}},
		// {"approval_Status", bson.D{{"$first", "$Approval_Status"}}},
	// bson.D{{"$match", bson.D{{"assigned_to", "E0001"}}}},

	if employee_id != "SA" {
		filter := bson.A{
			bson.D{{"$match", bson.D{{"assigned_to", employee_id}}}},
		}
		pipeline = append(pipeline, filter...)

	}

	response, err := helper.GetAggregateQueryResult(org.Id, "task", pipeline)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println(response)
	return shared.SuccessResponse(c, response)
}
func sidenav(c *fiber.Ctx) error {

	org, exists := helper.GetOrg(c)
	if !exists {
		return shared.BadRequest("Invalid Org Id")
	}

	pipeline := bson.A{
		bson.D{{"$match", bson.D{{"user_id", c.Params("employeeID")}}}},
		// bson.D{
		// 	{"$match",
		// 		bson.D{
		// 			{"$expr",
		// 				bson.D{
		// 					{"$lt",
		// 						bson.A{
		// 							bson.D{
		// 								{"$dateToString",
		// 									bson.D{
		// 										{"format", "%Y-%m-%d"},
		// 										{"date", "$start"},
		// 										{"timezone", "UTC"},
		// 									},
		// 								},
		// 							},
		// 							"$scheduled_end_date",
		// 						},
		// 					},
		// 				},
		// 			},
		// 		},
		// 	},
		// },
		bson.D{{"$group", bson.D{{"_id", "$project_id"}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "project"},
					{"localField", "_id"},
					{"foreignField", "project_id"},
					{"as", "project"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$project"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "client"},
					{"localField", "project.client_id"},
					{"foreignField", "client_id"},
					{"as", "client"},
				},
			},
		},
		bson.D{
			{"$unwind",
				bson.D{
					{"path", "$client"},
					{"preserveNullAndEmptyArrays", true},
				},
			},
		},
		bson.D{
			{"$project",
				bson.D{
					{"_id", "$project._id"},
					{"name", "$project.project_name"},
					{"client_name", "$client.client_name"},
					{"logo", "$client.logo.storage_name"},
				},
			},
		},
	}

	response, err := helper.GetAggregateQueryResult(org.Id, "team_specification", pipeline)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	// fmt.Println(response)
	return shared.SuccessResponse(c, response)

}
