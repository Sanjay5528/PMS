package helper

import (
	"context"
	"encoding/json"
	"fmt"
	"reflect"
	"strconv"
	"strings"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"

	"github.com/gofiber/fiber/v2"

	"go.mongodb.org/mongo-driver/mongo"

	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

var ctx = context.Background()

func Toint64(s string) int64 {
	if s == "" {
		return int64(0)
	}
	v, _ := strconv.ParseInt(s, 10, 64)
	return v
}

func Page(s string) int64 {
	return Toint64(s)
}

func Limit(s string) int64 {
	if s == "" {
		s = utils.GetenvStr("DEFAULT_FETCH_ROWS")
	}
	return Toint64(s)
}
func DocIdFilter(id string) bson.M {
	if id == "" {
		return bson.M{}
	}
	docId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return bson.M{"_id": id}
	} else {
		return bson.M{"_id": docId}
	}
}

func ObjectIdToString(id interface{}) string {
	return id.(primitive.ObjectID).Hex()
}

func sharedDBEntityHandler(c *fiber.Ctx) error {
	var collectionName = c.Params("collectionName")
	if collectionName == "db_config" {
		return shared.BadRequest("Access Denied")
	}
	cur, err := database.SharedDB.Collection(collectionName).Find(ctx, bson.D{})
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	var response []bson.M
	if err = cur.All(ctx, &response); err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

// func UpdateUserPasswordAndDeleteTempData(c *fiber.Ctx) error {

// 	var inputData map[string]interface{}
// 	err := c.BodyParser(&inputData)
// 	if err != nil {
// 		return BadRequest("Error parsing request body: " + err.Error())
// 	}
// 	access_key := c.Params("access_key")

// 	query := bson.M{"access_key": access_key}
// 	//var response []primitive.M
// 	response, err := FindDocs("amsort", "temporary_user", query)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to retrieve user", "error": err.Error()})
// 	}

// 	ID, idExists := response["_id"].(string)
// 	if !idExists {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Invalid response format"})
// 	}

// 	passwordHash, _ := GeneratePasswordHash(inputData["password"].(string))
// 	delete(inputData, "password")
// 	delete(inputData, "confirm_password")
// 	update := bson.M{"$set": bson.M{"pwd": passwordHash}}
// 	filter := bson.M{"_id": ID}

// 	result, err := ExecuteFindAndModifyQuery("amsort", "user", filter, update)
// 	if err != nil {
// 		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to update document", "error": err.Error()})
// 	}
// 	_, err = ExecuteDeleteManyByIds("amsort", "temporary_user", filter)
// 	if err != nil {
// 		return BadRequest("Failed to Delete data into the database: " + err.Error())

// 	}

// 	return SuccessResponse(c, result)
// }

func InsertValidateInDatamodel(collectionName, inputJsonString, orgId string) (map[string]interface{}, map[string]string) {
	var validationErrors = make(map[string]string)

	newStructValue, errorMessage := CreateInstanceForCollection(collectionName)
	if len(errorMessage) > 0 {
		return nil, errorMessage
	}

	err := json.Unmarshal([]byte(inputJsonString), newStructValue)
	if err != nil {
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
			expectedType := unmarshalErr.Type.String()
			dataType := strings.TrimPrefix(expectedType, "*")
			fieldName := unmarshalErr.Field
			return nil, map[string]string{
				"field":             fieldName,
				"Expected DataType": dataType,
			}
		}

		return nil, nil
	}

	// loop through pointer to get the actual struct
	rv := reflect.ValueOf(newStructValue)
	for rv.Kind() == reflect.Ptr || rv.Kind() == reflect.Interface {
		rv = rv.Elem()
	}

	var inputMap map[string]interface{}
	if err := json.Unmarshal([]byte(inputJsonString), &inputMap); err != nil {
		return nil, map[string]string{"error": "Invalid JSON data: " + err.Error()}
	}
	//Check the field any extra field is here
	// if err := vertifyInputStruct(rv, inputMap, validationErrors); err != nil {
	// 	return nil, validationErrors
	// }
	// fmt.Println(rv.Interface())
	validationErrors = ValidateStruct(rv.Interface())
	if len(validationErrors) > 0 {
		return nil, validationErrors
	}

	// fmt.Println(validationErrors)
	var cleanedData map[string]interface{}
	inputByte, _ := json.Marshal(rv.Interface())
	json.Unmarshal(inputByte, &cleanedData)

	return cleanedData, nil
}

func UpdateValidateInDatamodel(collectionName string, inputJsonString, orgId string) (map[string]interface{}, map[string]string) {
	// newStructFields := DynamicallyBindStructOnDataModel(collectionName, orgId)
	newStructFields, errorMessage := CreateInstanceForCollection(collectionName)
	if len(errorMessage) > 0 {
		return nil, errorMessage
	}

	err := json.Unmarshal([]byte(inputJsonString), &newStructFields)
	if err != nil {
		if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
			expectedType := unmarshalErr.Type.String()
			dataType := strings.TrimPrefix(expectedType, "*")
			fieldName := unmarshalErr.Field
			return nil, map[string]string{
				"field":             fieldName,
				"Expected DataType": dataType,
			}
		}
		return nil, map[string]string{"error": "Failed to unmarshal input JSON"}
	}

	// loop through pointer to get the actual struct
	rv := reflect.ValueOf(newStructFields)
	for rv.Kind() == reflect.Ptr || rv.Kind() == reflect.Interface {
		rv = rv.Elem()
	}

	var inputMap map[string]interface{}
	if err := json.Unmarshal([]byte(inputJsonString), &inputMap); err != nil {
		return nil, map[string]string{"error": "Invalid JSON data: " + err.Error()}
	}

	matchedFields := FilterStructFieldsByJSON(rv, inputMap)
	newStructType := reflect.StructOf(matchedFields)

	// Create a new struct instance with the matched fields
	newStruct := reflect.New(newStructType).Interface()

	err = json.Unmarshal([]byte(inputJsonString), &newStruct)
	if err != nil {
		// return nil, map[string]string{"error": "Failed to unmarshal input JSON"}
	}

	validationErrors := ValidateStruct(newStruct)
	if len(validationErrors) > 0 {
		return nil, validationErrors
	}

	var cleanedData map[string]interface{}
	inputByte, _ := json.Marshal(newStruct)
	json.Unmarshal(inputByte, &cleanedData)

	return cleanedData, nil
}

func MasterAggregationPipeline(request PaginationRequest, c *fiber.Ctx) []bson.M {
	Pipeline := []bson.M{}

	if len(request.Filter) > 0 {
		FilterConditions, err := BuildAggregationPipeline(request.Filter, "")
		if err != nil {
			shared.BadRequest("Invalid operator")
		}
		Pipeline = append(Pipeline, FilterConditions)
	}

	if len(request.Sort) > 0 {
		sortConditions := buildSortConditions(request.Sort)
		Pipeline = append(Pipeline, sortConditions)
	}

	if request.Start == 0 && request.End == 0 {
		request.Start = 0
		request.End = 5000
	}

	pagination := bson.M{
		"$facet": bson.D{
			{"response",
				bson.A{
					bson.D{{"$skip", request.Start}},
					bson.D{{"$limit", request.End - request.Start}},
				},
			},
			{"pagination",
				bson.A{
					bson.D{{"$count", "totalDocs"}},
				},
			},
		},
	}

	Pipeline = append(Pipeline, pagination)
	return Pipeline
}

func GroupDataBasedOnRules(c *fiber.Ctx) error {
	OrgId := c.Get("OrgId")
	if OrgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	filter := bson.M{"group_name": c.Params("groupname")}

	// var response map[string]interface{}
	response, err := FindDocs(OrgId, "group", filter)
	if err != nil {
		return err
	}

	delete(response, "_id")
	delete(response, "group_name")
	delete(response, "grouptype")
	delete(response, "ref_collection")
	delete(response, "status")

	fmt.Println(response["filter"])
	// responses := response["filter"].(Primitive.A)
	// result := PaginationRequest{
	// 	Filter: responses,
	// }
	var result PaginationRequest
	hello, _ := json.Marshal(response)

	if err := json.Unmarshal(hello, &result); err != nil {
		fmt.Println("Error:", err)
		// return
	}

	return c.JSON(result)
}

func DatasetsConfig(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	var inputData DataSetConfiguration
	if err := c.BodyParser(&inputData); err != nil {
		if cmdErr, ok := err.(mongo.CommandError); ok {
			return shared.BadRequest(cmdErr.Message)
		}

	}

	var Response fiber.Map

	Data, Response, err := BuildPipeline(orgId, inputData)

	if err != nil {
		return shared.BadRequest(err.Error())
	}

	if c.Params("options") == "Insert" {
		Response, err = InsertDatasetConfig(orgId, Data)
		if err != nil {
			return shared.BadRequest("Failed to insert data into the database")

		}
	}

	return c.JSON(Response)

}

func BuildPipeline(orgId string, inputData DataSetConfiguration) (DataSetConfiguration, fiber.Map, error) {

	Pipeline := []bson.M{}

	if len(inputData.DataSetBaseCollectionFilter) > 0 {
		Pipelines, err := BuildAggregationPipeline(inputData.DataSetBaseCollectionFilter, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, Pipelines)
		if err != nil {
			shared.BadRequest("Invaild operator")
		}
	}

	if len(inputData.DataSetJoinCollection) > 0 {
		lookupData := ExecuteLookupQueryData(inputData, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, lookupData...)
	}

	if len(inputData.CustomColumn) > 0 {
		createCustomColumns := CreateCusotmColumns(Pipeline, inputData.CustomColumn, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, createCustomColumns...)
	}

	if len(inputData.Aggregation) > 0 {
		AggregationData := buildDynamicAggregationPipeline(inputData.Aggregation)
		Pipeline = append(Pipeline, AggregationData...)
	}
	if len(inputData.Filter) > 0 {
		filterPipelines, err := BuildAggregationPipeline(inputData.Filter, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, filterPipelines)
		if err != nil {
			shared.BadRequest("Invaild operator")
		}
	}

	if len(inputData.SelectedList) > 0 {
		selectedColumns := CreateSelectedColumn(inputData.SelectedList, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, selectedColumns...)
	}

	marshaldata, err := json.Marshal(Pipeline)
	if err != nil {
		return DataSetConfiguration{}, nil, err
	}

	pipelinestring := string(marshaldata)
	inputData.Pipeline = pipelinestring

	inputData.Id = inputData.DataSetName

	if len(inputData.FilterParams) > 0 {
		pipelinestring := createFilterParams(inputData.FilterParams, pipelinestring)
		inputData.Pipeline = pipelinestring

		err := bson.UnmarshalExtJSON([]byte(pipelinestring), true, &Pipeline)
		if err != nil {
			fmt.Println("Error parsing pipeline:", err)

		}

	}

	Response, err := GetAggregateQueryResult(orgId, inputData.DataSetBaseCollection, Pipeline)
	if err != nil {
		return DataSetConfiguration{}, nil, err
	}
	PreviewResponse := fiber.Map{
		"status":    "success",
		"data":      Response,
		"Body_Data": inputData,
		"Pipeline":  Pipeline,
	}

	return inputData, PreviewResponse, nil

}

func InsertDatasetConfig(orgId string, inputData DataSetConfiguration) (fiber.Map, error) {

	res, err := database.GetConnection(orgId).Collection("dataset_config").InsertOne(ctx, inputData)
	InsertResponse := fiber.Map{
		"status":  "success",
		"message": "Data Added Successfully",
		"data": fiber.Map{
			"InsertedID": res.InsertedID,
		},
	}
	return InsertResponse, err
}

func DatasetsRetrieve(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	datasetname := c.Params("datasetname")
	filter := bson.M{"dataSetName": datasetname}

	response, err := FindDocs(orgId, "dataset_config", filter)
	if err != nil {
		return err
	}

	var ResponseData map[string]interface{}

	marshaldata, _ := json.Marshal(response)

	if err := json.Unmarshal(marshaldata, &ResponseData); err != nil {

	}

	PipeleData := ResponseData["pipeline"].(string)
	CollectionName := ResponseData["dataSetBaseCollection"].(string)

	var pipeline []map[string]interface{}
	if err := json.Unmarshal([]byte(PipeleData), &pipeline); err != nil {
		// if cmdErr, ok := err.(mongo.CommandError); ok {
		// 	return BadRequest(cmdErr.Message)
		// }

	}

	Response, err := GetAggregateQueryResult(orgId, CollectionName, pipeline)

	if err != nil {
		shared.InternalServerError(err.Error())
	}

	return shared.SuccessResponse(c, Response)
}

func UpdateDataset(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	datasetname := c.Params("datasetname")

	filter := bson.M{"dataSetName": datasetname}

	var inputData DataSetConfiguration
	if err := c.BodyParser(&inputData); err != nil {

		return shared.BadRequest("Invalid Body Content")
	}

	var Response fiber.Map

	Data, Response, err := BuildPipeline(orgId, inputData)
	if err != nil {
		return shared.InternalServerError("err.Error()")
	}

	Response, err = UpdateDatasetConfig(orgId, filter, Data)
	if err != nil {
		return shared.BadRequest("Failed to insert data into the database")

	}
	return c.JSON(Response)
}

func UpdateDatasetConfig(orgId string, filter interface{}, inputData DataSetConfiguration) (fiber.Map, error) {
	res, err := database.GetConnection(orgId).Collection("dataset_config").UpdateOne(ctx, filter, inputData)
	if err != nil {
		return nil, shared.InternalServerError(err.Error())
	}
	UpdatetResponse := fiber.Map{
		"status":  "success",
		"message": "Update Successfully",
		"Data":    res.UpsertedID,
	}

	return UpdatetResponse, err
}
