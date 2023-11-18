package helper

import (
	"fmt"
	"log"
	"os"
	"reflect"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"

	// "go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
)

var updateOpts = options.Update().SetUpsert(true)
var findUpdateOpts = options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)

func GetAggregateQueryResult(orgId string, collectionName string, query interface{}) ([]bson.M, error) {
	response, err := ExecuteAggregateQuery(orgId, collectionName, query)
	if err != nil {
		return nil, err
	}
	var result []bson.M
	//var result map[string][]Config
	if err = response.All(ctx, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func ExecuteAggregateQuery(orgId string, collectionName string, query interface{}) (*mongo.Cursor, error) {
	cur, err := database.GetConnection(orgId).Collection(collectionName).Aggregate(ctx, query)
	if err != nil {
		return nil, err
	}
	return cur, nil
}

func GetQueryResult(orgId string, collectionName string, query interface{}, page int64, limit int64, sort interface{}) ([]bson.M, error) {
	response, err := ExecuteQuery(orgId, collectionName, query, page, limit, sort)
	if err != nil {
		return nil, err
	}

	var result []bson.M
	//var result map[string][]Config
	if err = response.All(ctx, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func GetQueryInBetweenId(orgId string, collectionName string, options *options.FindOptions, startId string, endId string) ([]bson.M, error) {
	var result []bson.M
	// Construct a filter to find documents with IDs between abc123 and xyz789
	filter := bson.M{
		"_id": bson.M{
			"$gte": startId,
			"$lte": endId,
		},
	}
	cur, err := database.GetConnection(orgId).Collection(collectionName).Find(ctx, filter, options)
	if err != nil {
		return nil, err
	}
	if err = cur.All(ctx, &result); err != nil {
		return nil, err
	}
	return result, nil
}

func ExecuteHistoryInsertMany(orgId string, collectionName string, docs []interface{}) (*mongo.InsertManyResult, error) {
	result, err := database.GetConnection(orgId).Collection(collectionName+"_history").InsertMany(ctx, docs)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func ExecuteDeleteManyByIds(orgId string, collectionName string, filter bson.M) (*mongo.DeleteResult, error) {
	result, err := database.GetConnection(orgId).Collection(collectionName).DeleteMany(ctx, filter)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func ExecuteQuery(orgId string, collectionName string, query interface{}, page int64, limit int64, sort interface{}) (*mongo.Cursor, error) {
	pageOptions := options.Find()
	pageOptions.SetSkip(page)   //0-i
	pageOptions.SetLimit(limit) // number of records to return
	if sort != nil {
		pageOptions.SetSort(sort)
	}
	response, err := database.GetConnection(orgId).Collection(collectionName).Find(ctx, query, pageOptions)
	if err != nil {
		return nil, err
	}
	return response, nil
}

func ExecuteFindAndModifyQuery(orgId string, collectionName string, filter interface{}, data interface{}) (bson.M, error) {
	var result bson.M

	err := database.GetConnection(orgId).Collection(collectionName).FindOneAndUpdate(ctx, filter, data, findUpdateOpts).Decode(&result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

//?  delete
// func GetReportQueryResult(orgId string, collectioinName string, req ReportRequest) ([]bson.M, error) {
// 	//build filter query
// 	query := make(map[string]interface{})
// 	//Check emp id
// 	if req.EmpId != "" {
// 		query["eid"] = req.EmpId
// 	}

// 	//check emp id
// 	if len(req.EmpIds) > 0 {
// 		query["eid"] = bson.M{"$in": req.EmpIds}
// 	}
// 	//if date filter presented or not
// 	if req.DateColumn == "" { // start & end filter
// 		if !req.StartDate.IsZero() && !req.EndDate.IsZero() {
// 			query["start_date"] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
// 			query["end_date"] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
// 		} else if !req.StartDate.IsZero() && req.EndDate.IsZero() {
// 			query["start_date"] = bson.M{"$gte": req.StartDate}
// 		} else if req.StartDate.IsZero() && !req.EndDate.IsZero() {
// 			query["end_date"] = bson.M{"$lte": req.EndDate}
// 		}
// 	} else { // in between date filter
// 		if !req.StartDate.IsZero() && !req.EndDate.IsZero() {
// 			query[req.DateColumn] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
// 		} else if !req.StartDate.IsZero() && req.EndDate.IsZero() {
// 			query[req.DateColumn] = bson.M{"$gte": req.StartDate}
// 		} else if req.StartDate.IsZero() && !req.EndDate.IsZero() {
// 			query[req.DateColumn] = bson.M{"$lte": req.EndDate}
// 		}
// 	}
// 	if req.Type != "" {
// 		query["type"] = req.Type
// 	}
// 	if req.Status != "" {
// 		query["status"] = req.Status
// 	}
// 	return GetQueryResult(orgId, collectioinName, query, int64(0), int64(200), nil)
// }
//?
// func getCondition(field string, value string) bson.M {
// 	condition := []string{"$" + field, value}
// 	return bson.M{
// 		"$sum": bson.M{
// 			"$cond": []interface{}{bson.M{"$eq": condition}, 1, 0},
// 		},
// 	}
// }

func Updateformodel(c *fiber.Ctx) error {

	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}

	collectionName := c.Params("collectionName")

	// If the ID is not a valid ObjectID, search using the ID as a string
	filter := DocIdFilter(c.Params("id"))

	var inputData map[string]interface{}
	if err := c.BodyParser(&inputData); err != nil {
		log.Println(err)
		return c.Status(fiber.StatusBadRequest).JSON(shared.Response{
			Status:   fiber.StatusBadRequest,
			ErrorMsg: "Error parsing request body",
		})
	}
	update := bson.M{
		"$set": inputData,
	}
	// Update data in the collection
	_, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(ctx, filter, update)
	if err != nil {
		response := shared.Response{
			Status:   fiber.StatusInternalServerError,
			ErrorMsg: err.Error(),
		}
		return c.Status(fiber.StatusInternalServerError).JSON(response)
	}

	response := fiber.Map{
		"status":    200,
		"data":      []map[string]interface{}{inputData},
		"error_msg": "",
	}
	return c.Status(fiber.StatusOK).JSON(response)
}

func FindDocs(orgId, collection string, filter interface{}) (map[string]interface{}, error) {

	var result map[string]interface{}
	err := database.GetConnection(orgId).Collection(collection).FindOne(ctx, filter).Decode(&result)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			// Handle case when no document matches the filter
			// return nil, fmt.Errorf("No document found")
		}
		 
		return nil, err
	}

	return result, nil
}

func BuildAggregationPipeline(inputData []FilterCondition, BasecollectionName string) bson.M {
	var matchConditions []bson.M

	for _, filter := range inputData {
		for _, condition := range filter.Conditions {
			Finals := GenerateAggregationPipeline(condition, BasecollectionName)
			matchConditions = append(matchConditions, Finals...)
		}
	}

	var clause bson.M
	if len(matchConditions) > 0 {
		if inputData[0].Clause == "OR" {
			clause = bson.M{"$or": matchConditions}
		} else if inputData[0].Clause == "AND" {
			clause = bson.M{"$and": matchConditions}
		}
	}

	return bson.M{"$match": clause}
}

func GenerateAggregationPipeline(condition ConditionGroup, basecollection string) []bson.M {
	conditions := []bson.M{}

	// //* If Nested Conditions Here that time Recursively load the filter
	if len(condition.Conditions) > 0 {
		// nestedConditions := []bson.M{}
		for _, nestedCondition := range condition.Conditions {
			Nested := GenerateAggregationPipeline(nestedCondition, basecollection)

			conditions = append(conditions, Nested...)
		}

	}

	column := condition.Column
	value := condition.Value

	reference := condition.ParentCollectionName

	//if basecollection is empty we use directly use columnName
	if basecollection == "" {
		column = condition.Column
	} else if condition.ParentCollectionName == "" { //If ParentCollectioName is  empty we use directly use columnName
		column = condition.Column
	} else if basecollection != condition.ParentCollectionName { //If basecollection and ParentCollectionName is not equal that time suse refence variable for DOT
		column = reference + "." + fmt.Sprint(column)
	}

	//What are the Opertor is here mention that  map
	operatorMap := map[string]string{
		"EQUALS":             "$eq",
		"NOTEQUAL":           "$ne",
		"CONTAINS":           "$regex",
		"NOTCONTAINS":        "$regex",
		"STARTSWITH":         "$regex",
		"ENDSWITH":           "$regex",
		"LESSTHAN":           "$lt",
		"GREATERTHAN":        "$gt",
		"LESSTHANOREQUAL":    "$lte",
		"GREATERTHANOREQUAL": "$gte",
		"INRANGE":            "$gte",
		"BLANK":              "$exists",
		"NOTBLANK":           "$exists",
		"EXISTS":             "$exists",
		"IN":                 "$in",
	}

	//OpertorMap check we Sended In body to map
	if operator, exists := operatorMap[condition.Operator]; exists {
		conditionValue := ConvertToDataType(value, condition.Type)

		if condition.Operator == "INRANGE" || condition.Operator == "IN_BETWEEN" {
			if condition.Type == "date" || condition.Type == "time.Time" {
				dateValues, isDate := value.([]interface{})
				if isDate && len(dateValues) == 2 {
					startDateValue, startOK := dateValues[0].(string)
					endDateValue, endOK := dateValues[1].(string)
					if startOK && endOK {
						startDate, startErr := time.Parse(time.RFC3339, startDateValue)
						endDate, endErr := time.Parse(time.RFC3339, endDateValue)
						if startErr == nil && endErr == nil {
							startOfDay := time.Date(startDate.Year(), startDate.Month(), startDate.Day(), 0, 0, 0, 0, time.UTC)
							endOfDay := time.Date(endDate.Year(), endDate.Month(), endDate.Day(), 23, 59, 59, 999999999, time.UTC)
							conditions = append(conditions, bson.M{column: bson.M{
								"$gte": startOfDay,
								"$lte": endOfDay,
							}})
						}
					}
				}
			} else {
				rangeValues, ok := value.([]interface{})
				if ok && len(rangeValues) == 2 {
					minValue := rangeValues[0]
					maxValue := rangeValues[1]
					conditions = append(conditions, bson.M{column: bson.M{"$gte": minValue, "$lte": maxValue}})
				}
			}
		}

		if condition.Operator == "BLANK" {
			conditions = append(conditions, bson.M{column: bson.M{operator: false}})
		} else if condition.Operator == "EXISTS" {
			conditions = append(conditions, bson.M{column: bson.M{operator: conditionValue}})
		} else if condition.Operator == "NOTCONTAINS" {
			pattern := fmt.Sprintf("^(?!.*%s)", condition.Value)
			// conditions = append(conditions, bson.M{condition.Column: bson.M{"$regex": pattern}})
			conditions = append(conditions, bson.M{condition.Column: bson.M{operator: pattern}})
		} else if condition.Operator == "NOTBLANK" {
			conditions = append(conditions, bson.M{column: bson.M{operator: true, "$ne": nil}})
		} else if condition.Operator == "IN" {

			conditions = append(conditions, bson.M{column: bson.M{operator: value.([]interface{})}})

		} else if condition.Operator == "EQUALS" && condition.Type == "time.Time" {

			t, _ := conditionValue.(time.Time)
			StartedDay := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
			endDate := time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, time.UTC)

			filter := bson.M{
				column: bson.M{
					"$gte": StartedDay,
					"$lte": endDate,
				},
			}

			conditions = append(conditions, filter)

		} else {

			conditions = append(conditions, bson.M{column: bson.M{operator: conditionValue}})
		}
	}

	// //Caluse Binding
	if condition.Clause == "AND" {
		conditions = append(conditions, bson.M{"$and": conditions})
	} else if condition.Clause == "OR" {
		conditions = append(conditions, bson.M{"$or": conditions})
	}

	return conditions
}

// PagiantionPipeline -- METHOD Pagination return set of Limit data return
func PagiantionPipeline(start, end int) bson.M {
	// Get the Default value from env file
	startValue, _ := strconv.Atoi(os.Getenv("DEFAULT_START_VALUE"))
	endValue, _ := strconv.Atoi(os.Getenv("DEFAULT_LIMIT_VALUE"))

	//param is empty set the Default value
	if start == 0 || end == 0 {
		start = startValue
		end = endValue
	}

	// return the bson for pagination
	return bson.M{
		"$facet": bson.D{
			{"response",
				bson.A{
					bson.D{{"$skip", start}},
					bson.D{{"$limit", end - start}},
				},
			},
			{"pagination",
				bson.A{
					bson.D{{"$count", "totalDocs"}},
				},
			},
		},
	}
}

// ConvertToDataType --METHOD Build the Datatype from Paramters
func ConvertToDataType(value interface{}, DataType string) interface{} {

	if DataType == "time.Time" {
		if valStr, ok := value.(string); ok {
			t, err := time.Parse(time.RFC3339, valStr)
			if err == nil {
				StartedDay := time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second(), 0, time.UTC)
				return StartedDay
			}
		}
	} else if DataType == "string" || DataType == "text" {

		if valStr, ok := value.(string); ok {
			t, err := time.Parse(time.RFC3339, valStr)
			//if err is nil that time only convert the string to time.Time format
			if err == nil {
				StartedDay := time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second(), 0, time.UTC)
				return StartedDay
			} else {
				// Default retrun the value string after convert string
				return valStr
			}
		}
	} else if DataType == "boolean" || DataType == "bool" {

		if boolValue, ok := value.(bool); ok {
			return boolValue
		}
	}

	return value
}

// UpdateDatasetConfig -- METHOD update the Data  to Db from filter and Data and collectionName from Param
func UpdateDataToDb(orgId string, filter interface{}, Data interface{}, collectionName string) (fiber.Map, error) {
	res, err := database.GetConnection(orgId).Collection(collectionName).UpdateOne(ctx, filter, Data)
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

func UpdateDateObject(input map[string]interface{}) error {
	for k, v := range input {
		if v == nil {
			continue
		}
		ty := reflect.TypeOf(v).Kind().String()
		if ty == "string" {
			val := reflect.ValueOf(v).String()
			t, err := time.Parse(time.RFC3339, val)
			if err == nil {
				input[k] = t.UTC()
			}
		} else if ty == "map" {
			return UpdateDateObject(v.(map[string]interface{}))
		} else if ty == "slice" {
			for _, e := range v.([]interface{}) {
				if reflect.TypeOf(e).Kind().String() == "map" {
					return UpdateDateObject(e.(map[string]interface{}))
				}
			}
		}
	}
	return nil
}

// else if (condition.Operator == "EQUALS" || condition.Type == "time.Time") || (condition.Operator == "EQUALS" || condition.Type == "date") {

// if valStr, ok := conditionValue.(string); ok {
// 	t, _ := time.Parse(time.RFC3339, valStr)
// 	StartedDay := time.Date(t.Year(), t.Month(), t.Day(), 0, 0, 0, 0, time.UTC)
// 	endDate := time.Date(t.Year(), t.Month(), t.Day(), 23, 59, 59, 999999999, time.UTC)
// 	filter := bson.M{
// 		"$gte": StartedDay,
// 		"$lte": endDate,
// 	}
// 	conditions = append(conditions, bson.M{column: filter})
// }

// }
