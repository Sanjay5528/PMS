package helper

import (
	"strings"

	"go.mongodb.org/mongo-driver/bson"
)

// buildSortConditions -- METHOD Build sort conditions for a filter
func buildSortConditions(sortCriteria []SortCriteria) bson.M {
	sortConditions := bson.M{}

	if len(sortCriteria) > 0 {
		sortCriteriaMap := bson.M{}
		for _, sort := range sortCriteria {
			order := 1 // Default to ascending order
			if sort.Sort == "desc" {
				order = -1 // Change to descending order
			}
			sortCriteriaMap[sort.ColID] = order
		}

		sortConditions["$sort"] = sortCriteriaMap
	}

	return sortConditions
}

// ExecuteLookupQueryData  --METHOD create a lookup aggreation and lookup filter
func ExecuteLookupQueryData(Data []DataSetJoinCollection, basecollectionName string) []bson.M {
	var lookupDataPipeline []bson.M
	var previousAs string
	currentCollection := basecollectionName

	for _, LookupData := range Data {
		if LookupData.FromCollection == currentCollection {
			localField := LookupData.FromCollectionField

			if LookupData.FromCollection == previousAs {
				localField = previousAs + "." + LookupData.FromCollectionField
			}

			// build the lookup
			lookupStage := bson.M{
				"$lookup": bson.M{
					"from":         LookupData.ToCollection,
					"localField":   localField,
					"foreignField": LookupData.ToCollectionField,
					"as":           LookupData.ToCollection,
				},
			}
			// to append the Lookup
			lookupDataPipeline = append(lookupDataPipeline, lookupStage)
			// unwind the array from lookup data as
			unwindStage := bson.M{
				"$unwind": "$" + LookupData.ToCollection,
			}

			lookupDataPipeline = append(lookupDataPipeline, unwindStage)

			previousAs = LookupData.ToCollection

			if LookupData.FromCollection != basecollectionName {
				currentCollection = LookupData.ToCollection

			}  

			// lookup Filter
			if len(LookupData.Filter) > 0 {
				filterPipeline := BuildAggregationPipeline(LookupData.Filter, basecollectionName)
				lookupDataPipeline = append(lookupDataPipeline, filterPipeline)
			}
		}
	}

	return lookupDataPipeline
}

// CreateAggregationStage  --METHOD create aggregation stage
func CreateAggregationStage(column CustomColumn, Basecollection string) bson.M {
	var Pipeline bson.M

	if column.DataSetCustomAggregateFnName == "CONCAT" {
		Pipeline = addFieldsStage(column.DataSetCustomColumnName, bson.M{
			"$concat": generateConcat(column.DataSetCustomField, Basecollection)})

	} else if column.DataSetCustomAggregateFnName == "SUBTRACT" {
		Pipeline = addFieldsStage(column.DataSetCustomColumnName, bson.M{
			"$subtract": generateSub(column.DataSetCustomField, Basecollection),
		})
	} else if column.DataSetCustomAggregateFnName == "DIVIDE" {
		return addFieldsStage(column.DataSetCustomColumnName, bson.M{
			"$divide": generateSub(column.DataSetCustomField, Basecollection),
		})
	} else if column.DataSetCustomAggregateFnName == "MULTIPLY" {
		return addFieldsStage(column.DataSetCustomColumnName, bson.M{
			"$multiply": generateSub(column.DataSetCustomField, Basecollection),
		})
	} else if column.DataSetCustomAggregateFnName == "ADDITION" {
		return addFieldsStage(column.DataSetCustomColumnName, bson.M{
			"$add": generateSub(column.DataSetCustomField, Basecollection),
		})
	}

	return Pipeline
}

// BuildDynamicAggregationPipelineFromSpecifications --METHOD Create a aggreation constructs a dynamic MongoDB aggregation pipeline based on the provided aggregations.
// Each Aggregation specifies how to group and aggregate data in the pipeline.
func BuildDynamicAggregationPipelineFromSpecifications(Aggregation []Aggregation) []bson.M {
	// Initialize an empty array to store the MongoDB aggregation pipeline stages.
	pipeline := []bson.M{}
	// If there are no aggregations, return an empty pipeline
	if len(Aggregation) == 0 {
		return pipeline
	}
	// Iterate over each Aggregation in the input slice.
	for _, aggregation_column := range Aggregation {
		// Extract relevant information from the Aggregation structure.
		GroupID := "$" + aggregation_column.AggGroupByField.Field
		group := bson.M{"_id": GroupID}
		AggColumnName := aggregation_column.AggColumnName
		FieldsName := "$" + aggregation_column.AggFieldName.Field
		AggFnName := aggregation_column.AggFnName
		// Construct the $group stage based on the specified aggregation function
		if AggFnName == "SUM" {
			group[AggColumnName] = bson.M{"$sum": 1}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "MIN" {
			group[AggColumnName] = bson.M{"$min": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "MAX" {
			group[AggColumnName] = bson.M{"$max": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "PUSH" {
			group[AggColumnName] = bson.M{"$push": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "FIRST" {
			group[AggColumnName] = bson.M{"$first": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "LAST" {
			group[AggColumnName] = bson.M{"$last": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "COUNT" {
			group[AggColumnName] = bson.M{"$sum": 1}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		} else if AggFnName == "AVG" {
			group[AggColumnName] = bson.M{"$avg": FieldsName}
			group["doc"] = bson.M{"$first": "$$ROOT"}
		}

		// Append the $group stage to the pipeline.
		pipeline = append(pipeline, bson.M{"$group": group})
		// Construct the $replaceRoot stage to merge the aggregated results back into the main document structure.
		replaceRoot := bson.M{
			"$replaceRoot": bson.M{
				"newRoot": bson.M{
					"$mergeObjects": bson.A{
						bson.M{AggColumnName: "$" + AggColumnName},
						"$doc",
					},
				},
			},
		}

		pipeline = append(pipeline, replaceRoot)

	}
	// Return the fully constructed MongoDB aggregation pipeline.
	return pipeline
}

// generateSub   -- METHOD  generates expressions for the $subtract operator in MongoDB aggregation.
func generateSub(fields []CustomField, Basecollection string) bson.A {
	expressions := bson.A{}

	for _, field := range fields {
		fieldName := field.FieldName
		fieldName = "$" + field.FieldName
		if Basecollection != field.ParentCollectionName {
			fieldName = "$" + field.ParentCollectionName + "." + field.FieldName
		}

		expressions = append(expressions, fieldName)
	}
	return expressions
}

// generateConcat  -- METHOD  generates expressions for the $concat operator in MongoDB aggregation.
func generateConcat(fields []CustomField, Basecollection string) bson.A {
	expressions := bson.A{}

	for i, field := range fields {
		FieldsName := field.FieldName
		FieldsName = "$" + field.FieldName
		if Basecollection != field.ParentCollectionName {
			FieldsName = "$" + field.ParentCollectionName + "." + field.FieldName
		}

		if i > 0 {
			expressions = append(expressions, " ")
		}
		expressions = append(expressions, FieldsName)
	}
	return expressions
}

// CreateCusotmColumns -- METHOD creates custom columns in a MongoDB aggregation pipeline based on the provided CustomColumns.
func CreateCusotmColumns(Data []bson.M, CustomColumns []CustomColumn, Basecollection string) []bson.M {
	if len(CustomColumns) == 0 {
		return Data
	}

	aggregation := make([]bson.M, len(CustomColumns))
	for i, column := range CustomColumns {
		aggregation[i] = CreateAggregationStage(column, Basecollection)
	}

	return aggregation
}

// CreateSelectedColumn --METHOD creates a $project stage in a MongoDB aggregation pipeline to select specific columns.
func CreateSelectedColumn(CustomColumns []SelectedListItem, BaseCollection string) []bson.M {
	fieldsToProject := bson.M{}

	for _, field := range CustomColumns {
		fieldsToProject[field.Field] = 1
	}

	expressions := []bson.M{
		{
			"$project": fieldsToProject,
		},
	}

	return expressions
}

// addFieldsStage --METHOD adds fields to a MongoDB aggregation pipeline using the $addFields stage.
func addFieldsStage(dataSetCustomColumnName string, Fields bson.M) bson.M {
	return bson.M{
		"$addFields": bson.M{
			dataSetCustomColumnName: Fields,
		},
	}
}

// createFilterParams --METHOD replaces filter parameters in a given pipeline with their default values.
func createFilterParams(FilterParams []FilterParam, Pipeline string) string {
	filterPipeline := Pipeline

	for _, Filter := range FilterParams {
		FindString := `{"ParamsName":"` + Filter.ParamsName + `","parmsDataType":"` + Filter.ParamsDataType + `"}`
		Replacement := `"` + Filter.DefaultValue + `"`
		filterPipeline = strings.ReplaceAll(filterPipeline, FindString, Replacement)
	}

	return filterPipeline
}
