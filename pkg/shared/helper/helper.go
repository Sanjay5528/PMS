package helper

import (
	"context"
	"encoding/json"
	"errors"
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

func UpdateUserPasswordAndDeleteTempData(c *fiber.Ctx) error {

	var inputData map[string]interface{}
	err := c.BodyParser(&inputData)
	if err != nil {
		return shared.BadRequest("Error parsing request body: " + err.Error())
	}
	access_key := c.Params("access_key")

	query := bson.M{"access_key": access_key}
	//var response []primitive.M
	response, err := FindDocs("pms", "temporary_user", query)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to retrieve user", "error": err.Error()})
	}

	ID, idExists := response["_id"].(string)
	if !idExists {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Invalid response format"})
	}

	// passwordHash, _ := GeneratePasswordHash(inputData["password"].(string))
	// delete(inputData, "password")
	// delete(inputData, "confirm_password")

	// to compare the password and comfirm password is same only   Genrate the Hased password
	if inputData["password"].(string) != inputData["confirm_password"].(string) {
		shared.BadRequest("Verify that the password and confirm password are the same.")
	}

	// if password marched to create the Hash Password
	passwordHash, _ := GeneratePasswordHash(inputData["password"].(string))
	inputData["pwd"] = passwordHash
	// remove the password and confirm password
	delete(inputData, "password")
	delete(inputData, "confirm_password")

	update := bson.M{"$set": bson.M{"pwd": passwordHash}}
	filter := bson.M{"_id": ID}

	result, err := ExecuteFindAndModifyQuery("pms", "user", filter, update)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"message": "Failed to update document", "error": err.Error()})
	}
	_, err = ExecuteDeleteManyByIds("pms", "temporary_user", filter)
	if err != nil {
		return shared.BadRequest("Failed to Delete data into the database: " + err.Error())

	}

	return shared.SuccessResponse(c, result)
}

// Get the data without token
func GetTemporaryUserDataByAccessKey(c *fiber.Ctx) error {
	filter :=
		bson.M{"access_key": c.Params("access_key")}

	response, err := GetQueryResult("pms", "temporary_user", filter, int64(0), int64(2), nil)

	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)

}

func convertToMap(rv reflect.Value) (map[string]interface{}, error) {
	if rv.Kind() != reflect.Map {
		return nil, errors.New("value is not a map")
	}

	result := make(map[string]interface{})

	keys := rv.MapKeys()
	for _, key := range keys {
		keyString, ok := key.Interface().(string)
		if !ok {
			return nil, errors.New("map key is not a string")
		}

		value := rv.MapIndex(key).Interface()
		result[keyString] = value
	}

	return result, nil
}

func datatypeValidation(inputJsonString string) {
	var mapdata map[string]interface{}

	// marhasalData, _ := json.Marshal(inputJsonString)

	json.Unmarshal([]byte(inputJsonString), mapdata)
	fmt.Println(mapdata)
}

func InsertValidateInDatamodel(collectionName, inputJsonString, orgId string) (map[string]interface{}, map[string]string) {
	var validationErrors = make(map[string]string)

	newStructValue, errorMessage := CreateInstanceForCollection(collectionName)
	if len(errorMessage) > 0 {
		return nil, errorMessage
	}

	err := json.Unmarshal([]byte(inputJsonString), newStructValue)
	if err != nil {
		// datatypeValidation(inputJsonString)
		// if unmarshalErr, ok := err.(*json.UnmarshalTypeError); ok {
		// 	expectedType := unmarshalErr.Type.String()
		// 	dataType := strings.TrimPrefix(expectedType, "*")
		// 	fieldName := unmarshalErr.Field
		// 	return nil, map[string]string{
		// 		"field":             fieldName,
		// 		"Expected DataType": dataType,
		// 	}
		// }
		//
		// return nil, nil
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
	if err := verifyInputStruct(rv, inputMap, validationErrors); err != nil {
		return nil, validationErrors
	}

	validationErr := validate.Struct(rv.Interface())
	if validationErr != nil { // validation failed
		_, errorFields := GetSchemValidationError(validationErr)
		return nil, errorFields
	}

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

// !pending
func ProjectColumn(projectColumn []ProjectData, BaseCollection string) []bson.M {
	fieldsToProject := bson.M{}

	// for _, field := range projectColumn {

	// 	// fieldsToProject[field.Field] = 1

	// }

	expressions := []bson.M{
		{
			"$project": fieldsToProject,
		},
	}

	return expressions
}

func MasterAggregationPipeline(request PaginationRequest, c *fiber.Ctx) []bson.M {
	Pipeline := []bson.M{}

	if len(request.Filter) > 0 {
		FilterConditions := BuildAggregationPipeline(request.Filter, "")
		Pipeline = append(Pipeline, FilterConditions)
	}
	if len(request.ProjectData) > 0 {

	}
	if len(request.Sort) > 0 {
		sortConditions := buildSortConditions(request.Sort)
		Pipeline = append(Pipeline, sortConditions)
	}

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

// DatasetsConfig -- METHOD PURPOSE handle requests related to dataset configuration, including building aggregation pipelines
func DatasetsConfig(c *fiber.Ctx) error {
	//Get the OrgId from Header
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	//TO Bind the Value from Body
	var inputData DataSetConfiguration
	if err := c.BodyParser(&inputData); err != nil {
		if cmdErr, ok := err.(mongo.CommandError); ok {
			return shared.BadRequest(cmdErr.Message)
		}

	}

	var Response fiber.Map
	// BuildPipeline -- Create a Filter Pipeline from Body Content
	Data, Response := BuildPipeline(orgId, inputData)
	// Set the DatasetName to _id for unique
	Data.Id = inputData.DataSetName
	// Params options -- options is  insert the data to Db
	// if options empty is preview the data
	if c.Params("options") == "Insert" {
		var err error
		Response, err = InsertDataDb(orgId, Data, "dataset_config")
		if err != nil {
			return shared.BadRequest("Failed to insert data into the database")

		}
	}
	return c.JSON(Response)

}

// BuildPipeline    -- METHOD PURPOSE  build a comprehensive MongoDB aggregation pipeline for querying and aggregating data
func BuildPipeline(orgId string, inputData DataSetConfiguration) (DataSetConfiguration, fiber.Map) {
	//append the pipelien from child Pipeline
	Pipeline := []bson.M{}
	//Every If condtion for if Data is here that time only that func work
	if len(inputData.DataSetBaseCollectionFilter) > 0 {
		Pipelines := BuildAggregationPipeline(inputData.DataSetBaseCollectionFilter, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, Pipelines)

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
		filterPipelines := BuildAggregationPipeline(inputData.Filter, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, filterPipelines)

	}

	//Project the pipeline
	if len(inputData.SelectedList) > 0 {
		selectedColumns := CreateSelectedColumn(inputData.SelectedList, inputData.DataSetBaseCollection)
		Pipeline = append(Pipeline, selectedColumns...)
	}

	// filter pipeline convert the byte
	marshaldata, err := json.Marshal(Pipeline)
	if err != nil {
		return DataSetConfiguration{}, nil
	}
	// marshaldata  variable -- filter byte  convert the string
	pipelinestring := string(marshaldata)
	// set the inputData.Pipeline  -- store the data form converted string pipeine
	inputData.Pipeline = pipelinestring

	// Filter Params for to replace the string to convert to pipeline again
	//!pending
	if len(inputData.FilterParams) > 0 {
		inputData.Reference_pipeline = pipelinestring
		pipelinestring := createFilterParams(inputData.FilterParams, pipelinestring)
		// if filter params here that time to replace the old pipeline
		inputData.Pipeline = pipelinestring

		// convert the pipeline
		err := bson.UnmarshalExtJSON([]byte(pipelinestring), true, &Pipeline)
		if err != nil {
			fmt.Println("Error parsing pipeline:", err)

		}

		// := Datatypechanging(Pipeline)
	}

	// if len(inputData.FilterParams) > 0 {
	// 	inputData.Reference_pipeline = pipelinestring
	// 	pipelinestring := createFilterParams(inputData.FilterParams, pipelinestring)
	// 	// if filter params here that time to replace the old pipeline
	// 	// inputData.Pipeline = pipelinestring
	// 	// convert the pipeline
	// 	// newpipeline := []bson.M{}
	// 	err := json.Unmarshal([]byte(pipelinestring), &Pipeline)
	// 	if err != nil {
	// 		fmt.Println("Error parsing pipeline:", err)

	// 	}

	// 	// // Datatypechanging -- To build the Pipeline from pipeline variable
	// 	// Datas := Datatypechanging(newpipeline)

	// 	// // Clear the Pipeline
	// 	// Pipeline = nil
	// 	// // if filter params here that time to replace the old pipeline
	// 	// Pipeline = append(Pipeline, Datas)

	// 	inputData.Pipeline = pipelinestring

	// }

	// //final pagination TO add the Filter
	// PagiantionPipeline := PagiantionPipeline(inputData.Start, inputData.End)
	// Pipeline = append(Pipeline, PagiantionPipeline)
	// Get the Data form Db
	fmt.Println(Pipeline)
	Response, err := GetAggregateQueryResult(orgId, inputData.DataSetBaseCollection, Pipeline)
	if err != nil {
		fmt.Println("Err",
			err.Error(),
		)
		return DataSetConfiguration{}, nil
	}

	// this PreviewResponse
	PreviewResponse := fiber.Map{
		"status":   "success",
		"data":     Response,
		"pipeline": Pipeline,
	}

	return inputData, PreviewResponse

}

// Insert the Data and return map
func InsertDataDb(orgId string, inputData interface{}, collectionName string) (fiber.Map, error) {

	res, err := database.GetConnection(orgId).Collection(collectionName).InsertOne(ctx, inputData)
	InsertResponse := fiber.Map{
		"status":  "success",
		"message": "Data Added Successfully",
		"data": fiber.Map{
			"InsertedID": res.InsertedID,
		},
	}
	return InsertResponse, err
}

func Datatypechanging(Data []bson.M) bson.M {
	// output := []bson.M{}
	var Datareturn bson.M
	for _, stage := range Data {
		if matchStage, ok := stage["$match"].(bson.M); ok {
			matchedPipeline := processMatchStage(matchStage)
			Datareturn = bson.M{"$match": matchedPipeline}
		}
	}
	return Datareturn
}

func processMatchStage(matchStage bson.M) interface{} {
	var outputData interface{}
	for key, value := range matchStage {
		opertorevalues := processAndOrValue(key, value)
		outputData = opertorevalues

	}

	return outputData
}

func processAndOrValue(key string, value interface{}) interface{} {
	Finaloutput := []bson.M{}
	switch key {
	case "$and", "$or":
		if array, ok := value.(primitive.A); ok {
			// processedArray := make([]interface{}, len(array))
			for _, item := range array {
				switch dataType := item.(type) {

				case primitive.M:

					for keys, value := range dataType {

						valuebroken := valuebroken(value)
						// fmt.Println(keys, valuebroken)
						fmt.Println(keys)
						Finaloutput = append(Finaloutput, bson.M{keys: valuebroken})
					}

				}

			}
			// return processedArray
		} else {
			return value
		}

	}
	return Finaloutput
}
func valuebroken(data interface{}) interface{} {
	keyoutput := bson.M{}

	switch dataType := data.(type) {

	case primitive.M:

		for key, value := range dataType {
			// return createQueryPipeline(value)
			pipeline := createQueryPipeline(value)
			keyoutput[key] = pipeline
		}

	case primitive.A:

		for key, value := range dataType {
			// // return createQueryPipeline(value)
			// pipeline := createQueryPipeline(value)
			// keyoutput[key] = pipeline
			fmt.Println(key, value)
		}
	}

	return keyoutput
}

// for key, value := range data.(bson.M) {
// 	// return createQueryPipeline(value)
// 	pipeline := createQueryPipeline(value)
// 	values := bson.M{key: pipeline}
// 	keyoutput = values
// }
// func processValue(value interface{}) interface{} {
// 	switch v := value.(type) {
// 	case int:
// 		return v
// 	case float64:
// 		return v
// 	case string:
// 		// Check if it's a date and time string
// 		if t, err := time.Parse(time.RFC3339, v); err == nil {
// 			return t
// 		} else {
// 			return v
// 		}
// 	case map[string]interface{}:
// 		processedMap := make(map[string]interface{})
// 		for key, val := range v {
// 			processedMap[key] = processValue(val)
// 		}
// 		return processedMap
// 	case []interface{}:
// 		processedArray := make([]interface{}, len(v))
// 		for i, item := range v {
// 			processedArray[i] = processValue(item)
// 		}
// 		return processedArray
// 	default:
// 		return v
// 	}
// }

// DatasetsRetrieve  -- METHOD PURPOSE Get the Filter pipeline in Db to show the data
func DatasetsRetrieve(c *fiber.Ctx) error {
	//OrgId oming from Header
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	//Params
	datasetname := c.Params("datasetname")

	filter := bson.M{"dataSetName": datasetname}
	// Find the Data from Db
	response, err := FindDocs(orgId, "dataset_config", filter)
	if err != nil {
		return shared.BadRequest("Invalid  Params value")
	}

	var ResponseData map[string]interface{}
	//Marshal the data from find the Document
	marshaldata, err := json.Marshal(response)
	if err != nil {
		return shared.BadRequest("Failed to Marshal ")
	}

	// Unmarshal -- after Unmarshal to map[string]interface{} convert
	if err := json.Unmarshal(marshaldata, &ResponseData); err != nil {
		return shared.BadRequest("Invalid Body Content from MarshalData")

	}

	PipeleData := ResponseData["pipeline"].(string)
	//Get the Collection Name in Database
	CollectionName := ResponseData["dataSetBaseCollection"].(string)
	//Body Filter storing to struct
	var requestBody PaginationRequest
	if err := c.BodyParser(&requestBody); err != nil {
		return shared.BadRequest("Invalid Body")
	}
	// Parse the provided string into a slice of BSON documents for the pipeline.
	pipeline := []primitive.M{}
	err = json.Unmarshal([]byte(PipeleData), &pipeline)
	if err != nil {
		return shared.BadRequest("Cannot Find the String")

	}

	//finalpipeline -- Build the Final append filter pipeline
	var finalpipeline []bson.M
	//UpdateDatatypes -- To build the Pipeline from pipeline variable
	Updatedpipeline := UpdateDatatypes(pipeline)

	finalpipeline = append(finalpipeline, Updatedpipeline...)

	//Body Filter Pipeline making
	filterpipeline := MasterAggregationPipeline(requestBody, c)
	//To combine the pipeline filter and basefilter
	finalpipeline = append(finalpipeline, filterpipeline...)

	//final pagination TO add the Filter
	PagiantionPipeline := PagiantionPipeline(requestBody.Start, requestBody.End)
	finalpipeline = append(finalpipeline, PagiantionPipeline)

	// To Get the Data from Db
	Response, err := GetAggregateQueryResult(orgId, CollectionName, finalpipeline)
	if err != nil {
		shared.InternalServerError(err.Error())
	}

	return shared.SuccessResponse(c, Response)
}

// UpdateDatatypes    --METHOD  Get the match object and to build the mongo Query
func UpdateDatatypes(pipeline []bson.M) []bson.M {
	output := []bson.M{}
	for _, stage := range pipeline {
		if matchStage, ok := stage["$match"]; ok {
			// To Pass the interface{} to $match data for datatype convertion
			matchedPipeline := createQueryPipeline(matchStage)
			output = append(output, bson.M{"$match": matchedPipeline})
		} else {
			output = append(output, stage)
		}
	}

	return output
}

/*
	createQueryPipeline -- METHOD To change the value Datatype and return the pipeline format

Recusively call the  Method for Datatype converntiuon
*/

func createQueryPipeline(data interface{}) interface{} {
	// Check the Every DataType to incoming
	switch dataType := data.(type) {
	case map[string][]interface{}:
		var outputArray []interface{}
		for _, value := range dataType {
			for _, item := range value {
				outputArray = append(outputArray, createQueryPipeline(item))
			}
		}
		return outputArray
	case map[string]interface{}:
		valueMap := dataType
		for k := range valueMap {
			valueMap[k] = createQueryPipeline(valueMap[k])
		}
		return valueMap
	case []interface{}:
		var outputArray []interface{}
		for _, i := range dataType {
			outputArray = append(outputArray, createQueryPipeline(i))
		}
		return outputArray
	default:

		// if return final interface{} to ge the convert the data type to  ConvertToDataType
		return ConvertToDataType(data, reflect.TypeOf(data).String())
	}
}

// UpdateDataset  --METHOD Update the Dataset_config collection to store the data with pipeline
func UpdateDataset(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	datasetname := c.Params("datasetname")
	//Params
	filter := bson.M{"dataSetName": datasetname}
	//Update body to bind the  DataSetConfiguration
	var inputData DataSetConfiguration
	if err := c.BodyParser(&inputData); err != nil {
		return shared.BadRequest("Invalid Body Content")
	}
	// Global Variable set the For response
	var Response fiber.Map
	//Build the Pipeline
	Data, Response := BuildPipeline(orgId, inputData)

	Response, err := UpdateDataToDb(orgId, filter, Data, "dataset_config")
	if err != nil {
		return shared.BadRequest("Failed to insert data into the database")

	}

	return shared.SuccessResponse(c, Response)
}

func Sequenceordercreate(OrgId, collectionName, name string) string {

	res, err := database.GetConnection(OrgId).Collection(collectionName).CountDocuments(ctx, bson.M{})
	if err != nil {

		fmt.Println("Error counting documents:", err)

	}

	concatenated := fmt.Sprintf("%s%s%d", "T", name[:3], res)

	return concatenated
}
