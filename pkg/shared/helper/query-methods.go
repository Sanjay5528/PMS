package helper

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"kriyatec.com/go-api/pkg/shared/database"
)

var updateOpts = options.Update().SetUpsert(true)
var findUpdateOpts = options.FindOneAndUpdate().SetUpsert(true).SetReturnDocument(options.After)
var ctx = context.Background()

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

func ExecuteDeleteManyByIds(orgId string, collectionName string, filter bson.M, deleteOption *options.DeleteOptions) (*mongo.DeleteResult, error) {
	result, err := database.GetConnection(orgId).Collection(collectionName).DeleteMany(ctx, filter, deleteOption)
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
	//response, err := database.GetConnection(orgId).Collection(collectionName).Find(ctx, query, pageOptions)
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

func GetReportQueryResult(orgId string, collectioinName string, req ReportRequest) ([]bson.M, error) {
	//build filter query
	query := make(map[string]interface{})
	//Check emp id
	if req.EmpId != "" {
		query["eid"] = req.EmpId
	}

	//check emp id
	if len(req.EmpIds) > 0 {
		query["eid"] = bson.M{"$in": req.EmpIds}
	}
	//if date filter presented or not
	if req.DateColumn == "" { // start & end filter
		if !req.StartDate.IsZero() && !req.EndDate.IsZero() {
			query["start_date"] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
			query["end_date"] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
		} else if !req.StartDate.IsZero() && req.EndDate.IsZero() {
			query["start_date"] = bson.M{"$gte": req.StartDate}
		} else if req.StartDate.IsZero() && !req.EndDate.IsZero() {
			query["end_date"] = bson.M{"$lte": req.EndDate}
		}
	} else { // in between date filter
		if !req.StartDate.IsZero() && !req.EndDate.IsZero() {
			query[req.DateColumn] = bson.M{"$gte": req.StartDate, "$lte": req.EndDate}
		} else if !req.StartDate.IsZero() && req.EndDate.IsZero() {
			query[req.DateColumn] = bson.M{"$gte": req.StartDate}
		} else if req.StartDate.IsZero() && !req.EndDate.IsZero() {
			query[req.DateColumn] = bson.M{"$lte": req.EndDate}
		}
	}
	if req.Type != "" {
		query["type"] = req.Type
	}
	if req.Status != "" {
		query["status"] = req.Status
	}
	return GetQueryResult(orgId, collectioinName, query, int64(0), int64(200), nil)
}

func generateSearchQuery(filters []Filter) interface{} {
	if len(filters) == 0 {
		return nil
	}
	//build query
	var finalQuery interface{}
	var queryArray [](map[string][]bson.M)
	for _, filter := range filters {
		filterQuery := make(map[string][]bson.M)
		var con []bson.M
		conditions := filter.Conditions
		for _, condition := range conditions {
			var f bson.M
			if condition.Type == "date" {
				date, _ := time.Parse(time.RFC3339, condition.Value)
				f = bson.M{condition.Column: bson.M{condition.Operator: date}}
			} else {
				f = bson.M{condition.Column: bson.M{condition.Operator: condition.Value}}
			}
			con = append(con, f)
		}
		filterQuery[filter.Clause] = con
		queryArray = append(queryArray, filterQuery)
	}
	if len(filters) == 1 {
		finalQuery = queryArray[0]
	} else {
		finalQuery = bson.M{"$and": queryArray}
	}
	//fmt.Println(finalQuery)
	//query, _ := json.Marshal(finalQuery)
	//fmt.Println(string(query))
	return finalQuery
}

func GetSearchQueryResult(orgId string, collectionName string, filters []Filter, page int64, limit int64) ([]bson.M, error) {
	query := generateSearchQuery(filters)
	return GetQueryResult(orgId, collectionName, query, page, limit, nil)
}

func GetSearchQueryWithChildCount(orgId string, collectionName string, keyColumn string, childCollectionName string, lookupColumn string, filters []Filter) ([]bson.M, error) {
	matchQuery := generateSearchQuery(filters)
	pipeline := []bson.M{
		{"$lookup": bson.M{
			"from":         childCollectionName,
			"localField":   keyColumn,
			"foreignField": lookupColumn,
			"as":           "details",
		}},
		{"$addFields": bson.M{"count": bson.M{"$size": "$details"}}},
		{"$unset": "details"},
	}
	if matchQuery != nil {
		pipeline = append([]bson.M{{"$match": matchQuery}}, pipeline...)
	}
	//fmt.Println(pipeline)
	return GetAggregateQueryResult(orgId, collectionName, pipeline)
}

func ExecuteLookupQuery(orgId string, query LookupQuery) ([]bson.M, error) {
	matchQuery := generateSearchQuery(query.ParentRef.Filter)
	pipeline := []bson.M{
		{"$lookup": bson.M{
			"from":         query.ChildRef.Name,
			"localField":   query.ParentRef.Key,
			"foreignField": query.ChildRef.Key,
			"as":           "details",
		},
		},
	}
	if query.Operation == "child_count" {
		pipeline = append(pipeline, bson.M{"$addFields": bson.M{"count": bson.M{"$size": "$details"}}})
		pipeline = append(pipeline, bson.M{"$unset": "details"})
	} else if query.Operation == "parent_child_detail" {
		pipeline = append(pipeline, bson.M{"$project": bson.M{"_id": 1, "name": 1, "details": 1}})
	} else if query.Operation == "child_detail" {
		pipeline = append(pipeline, bson.M{"$project": bson.M{"_id": 0, "details": 1}})
		pipeline = append(pipeline, bson.M{"$unionWith": "details"})
	}
	if matchQuery != nil {
		pipeline = append([]bson.M{{"$match": matchQuery}}, pipeline...)
	}
	//fmt.Println(pipeline)
	return GetAggregateQueryResult(orgId, query.ParentRef.Name, pipeline)
}

func getCondition(field string, value string) bson.M {
	condition := []string{"$" + field, value}
	return bson.M{
		"$sum": bson.M{
			"$cond": []interface{}{bson.M{"$eq": condition}, 1, 0},
		},
	}
}

func ExecuteGroupQuery(orgId string, request GroupSumRequest) ([]bson.M, error) {
	groupQuery := bson.M{
		"_id": bson.M{
			request.DateColumn: bson.M{
				"$dateToString": bson.M{"format": request.DateFormat, "date": "$" + request.DateColumn},
			},
		},
	}
	projectQuery := bson.M{
		"_id":              0,
		request.DateColumn: "$_id." + request.DateColumn,
	}
	for _, f := range request.OutputColumns {
		groupQuery[f] = getCondition(request.GroupBy, f)
		projectQuery[f] = "$" + f
	}
	pipeline := []bson.M{
		{
			"$group": groupQuery,
		}, {
			"$project": projectQuery,
		},
	}
	//fmt.Println(request.Filter)
	if len(request.Filter) > 0 {
		matchQuery := generateSearchQuery(request.Filter)
		pipeline = append([]bson.M{{"$match": matchQuery}}, pipeline...)
	}
	//fmt.Println(pipeline)
	return GetAggregateQueryResult(orgId, request.CollectionName, pipeline)
}

func ExecuteGroupReportQuery(orgId string, request GroupSumRequest) ([]bson.M, error) {
	groupQuery := bson.M{
		"_id": bson.M{
			request.DateColumn: bson.M{
				"$dateToString": bson.M{"format": request.DateFormat, "date": "$" + request.DateColumn},
			},
		},
	}
	projectQuery := bson.M{
		"_id":              0,
		request.DateColumn: "$_id." + request.DateColumn,
	}
	for _, f := range request.OutputColumns {
		groupQuery[f] = getCondition(request.GroupBy, f)
		projectQuery[f] = "$" + f
	}
	pipeline := []bson.M{
		{
			"$group": groupQuery,
		}, {
			"$project": projectQuery,
		},
	}
	//fmt.Println(request.Filter)
	if len(request.Filter) > 0 {
		matchQuery := generateSearchQuery(request.Filter)
		pipeline = append([]bson.M{{"$match": matchQuery}}, pipeline...)
	}
	//fmt.Println(pipeline)
	return GetAggregateQueryResult(orgId, request.CollectionName, pipeline)
}

// {
//   '$group': {

//     'im': {
//       '$sum': {
//         '$cond': {
//           'if': {
//             '$eq': [
//               '$txn', 'im'
//             ]
//           },
//           'then': 1,
//           'else': 0
//         }
//       }
//     },
//     'ptp': {
//       '$sum': {
//         '$cond': {
//           'if': {
//             '$eq': [
//               '$txn', 'ptp'
//             ]
//           },
//           'then': 1,
//           'else': 0
//         }
//       }
//     },
//     'drs': {
//       '$sum': {
//         '$cond': {
//           'if': {
//             '$eq': [
//               '$txn', 'drs'
//             ]
//           },
//           'then': 1,
//           'else': 0
//         }
//       }
//     },
//     'empty': {
//       '$sum': {
//         '$cond': [
//           {
//             '$ifNull': [
//               '$txn', true
//             ]
//           }, 1, 0
//         ]
//       }
//     }
//   }
// }
