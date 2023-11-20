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
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// to  Get the User Details from Token
	userToken := utils.GetUserTokenValue(c)
	// // // //get the collection from model_config collection to find the model_name
	// collectionName, err := helper.CollectionNameGet(c.Params("model_name"), org.Id)
	// if err != nil {
	// 	shared.BadRequest("Invalid CollectionName")
	// }

	// // Validation the Insert Data from -- InsertValidateInDatamodel
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

	if inputData["_id"] != nil {
		inputData["_id"] = helper.GenerateSequence(inputData["_id"], org.Id)
	} else {
		inputData["_id"] = helper.Generateuniquekey()

	}

	// user collection is here that time only password validation
	if collectionName == "user" {
		// user collection only OnboadingProcessing for send the mail to activation --METHOD OnboardingProcessing
		err := OnboardingProcessing(org.Id, inputData["_id"].(string), "Onboarding", "user")
		if err != nil {
			return shared.BadRequest("invalid user Id")
		}
	} else if collectionName == "data_model" || collectionName == "model_config" {
		// else If conditon  Purpose for these collection only need for status field don't overwrite another collection
		inputData["status"] = "A"
	}

	inputData["created_on"] = time.Now()
	inputData["created_by"] = userToken.UserId

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
	// 	return shared.BadRequest("Invalid CollectionName")
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

func RequrimentObjectproject(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	filter :=
		bson.A{
			bson.D{{"$match", bson.D{{"project_id", c.Params("projectid")}}}},
			bson.D{{"$addFields", bson.D{{"_id", bson.D{{"$toString", "$_id"}}}}}},
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
			bson.D{{"$match", bson.D{{"taskresult.status", bson.D{{"$ne", "Completed"}}}}}},
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
				{"$addFields",
					bson.D{
						{"taskresult.employee_name",
							bson.D{
								{"$reduce",
									bson.D{
										{"input", "$employeeResult"},
										{"initialValue", ""},
										{"in",
											bson.D{
												{"$concat",
													bson.A{
														"$$value",
														bson.D{
															{"$cond",
																bson.A{
																	bson.D{
																		{"$eq",
																			bson.A{
																				"$$value",
																				"",
																			},
																		},
																	},
																	"",
																	" ",
																},
															},
														},
														"$$this.first_name",
														" ",
														"$$this.last_name",
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
			bson.D{{"$unset", "employeeResult"}},
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
	}
	response, err := helper.GetAggregateQueryResult(org.Id, "regression", filter)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, fiber.Map{
		"response": response,
	})
}
