package helper

import "time"

type PaginationRequest struct {
	Start            int               `json:"start,omitempty" bson:"start,omitempty" validate:"omitempty"`
	End              int               `json:"end,omitempty" bson:"end,omitempty" validate:"omitempty"`
	CreatedBy        string            `json:"createdby,omitempty"`
	CreatedOn        time.Time         `json:"createdon,omitempty"`
	FilterColumns    []FieldValuePair  `json:"filterColumns,omitempty" bson:"filterColumns,omitempty" validate:"omitempty"`
	Filter           []FilterCondition `json:"filter,omitempty" bson:"filter,omitempty" validate:"omitempty"`
	Sort             []SortCriteria    `json:"sort,omitempty" bson:"sort,omitempty" validate:"omitempty"`
	Status           string            `json:"status,omitempty" bson:"status,omitempty" validate:"omitempty"`
	Groupname        string            `json:"group_name,omitempty" bson:"group_nam,omitempty" validate:"omitempty"`
	GroupDescription string            `json:"groupDescription,omitempty" bson:"groupDescription,omitempty"`
	GroupType        string            `json:"grouptype,omitempty" bson:"grouptype,omitempty"`
}
type SortCriteria struct {
	Sort  string `json:"sort"`
	ColID string `json:"colId"`
}

type FieldValuePair struct {
	FieldName  string      `json:"fieldname" bson:"fieldname"`
	FieldValue interface{} `json:"fieldvalue" bson:"fieldvalue"`
}
type FilterCondition struct {
	Clause     string           `json:"clause,omitempty" bson:"clause,omitempty"`
	Conditions []ConditionGroup `json:"conditions,omitempty" bson:"condition,omitempty"`
}

type ConditionGroup struct {
	Type                 string           `json:"type,omitempty" bson:"type,omitempty"`
	Column               string           `json:"column,omitempty" bson:"column,omitempty"`
	Operator             string           `json:"operator,omitempty" bson:"operator,omitempty"`
	Value                interface{}      `json:"value,omitempty" bson:"value,omitempty"`
	Clause               string           `json:"clause,omitempty" bson:"clause,omitempty"`
	ValueType            interface{}      `json:"value_type,omitempty" bson:"value_type,omitempty"`
	ParentCollectionName string           `json:"parentCollectionName,omitempty" bson:"parentCollectionName,omitempty"`
	Conditions           []ConditionGroup `json:"conditions,omitempty" bson:"conditions,omitempty"`
}

type AggregationField struct {
	Name                 string `json:"name,omitempty" bson:"name,omitempty"`
	Field                string `json:"field_name,omitempty" bson:"field_name,omitempty"`
	ParentCollectionName string `json:"parentCollectionName,omitempty" bson:"parentCollectionName,omitempty"`
	Type                 string `json:"type,omitempty" bson:"type,omitempty"`
	Hide                 bool   `json:"hide,omitempty" bson:"hide,omitempty"`
}

type Aggregation struct {
	AggFieldName    AggregationField `json:"Agg_Field_Name,omitempty" bson:"Agg_Field_Name,omitempty"`
	AggFnName       string           `json:"Agg_Fn_Name,omitempty" bson:"Agg_Fn_Name,omitempty"`
	AggGroupByField AggregationField `json:"Agg_group_byField,omitempty" bson:"Agg_group_byField,omitempty"`
	ConvertToString bool             `json:"convert_To_String,omitempty" bson:"convert_To_String,omitempty"`
	AggColumnName   string           `json:"Agg_Column_Name,omitempty" bson:"Agg_Column_Name,omitempty"`
}
type CustomField struct {
	Name                 string `json:"name,omitempty" bson:"name,omitempty"`
	FieldName            string `json:"field_name,omitempty" bson:"field_name,omitempty"`
	ParentCollectionName string `json:"parentCollectionName,omitempty" bson:"parentCollectionName,omitempty"`
	Reference            bool   `json:"reference,omitempty" bson:"reference,omitempty"`
	Type                 string `json:"type,omitempty" bson:"type,omitempty"`
}
type CustomColumn struct {
	DataSetCustomLabelName       string        `json:"dataSetCustomLabelName,omitempty" bson:"dataSetCustomLabelName,omitempty"`
	DataSetCustomAggregateFnName string        `json:"dataSetCustomAggregateFnName,omitempty" bson:"dataSetCustomAggregateFnName,omitempty"`
	DataSetCustomField           []CustomField `json:"dataSetCustomField,omitempty" bson:"dataSetCustomField,omitempty"`
	ConvertToString              bool          `json:"convert_To_String,omitempty" bson:"convert_To_String,omitempty"`
	DataSetCustomColumnName      string        `json:"dataSetCustomColumnName,omitempty" bson:"dataSetCustomColumnName,omitempty"`
}

type SelectedListItem struct {
	Name                 string `json:"name,omitempty" bson:"name,omitempty"`
	FieldName            string `json:"field_name,omitempty" bson:"field_name,omitempty"`
	ParentCollectionName string `json:"parentCollectionName,omitempty" bson:"parentCollectionName,omitempty"`
	Type                 string `json:"type,omitempty" bson:"type,omitempty"`
	Hide                 bool   `json:"hide,omitempty" bson:"hide,omitempty"`
}

type FilterParam struct {
	ConvertToString bool   `json:"convert_To_String,omitempty" bson:"convert_To_String,omitempty"`
	ParamsName      string `json:"parmasName,omitempty" bson:"parmasName,omitempty"`
	ParamsDataType  string `json:"parmsDataType,omitempty" bson:"parmsDataType,omitempty"`
	DefaultValue    string `json:"defaultValue,omitempty" bson:"defaultValue,omitempty"`
}

type DataSetConfiguration struct {
	Id                          string                  `json:"_id,omitempty" bson:"_id,omitempty"`
	DataSetName                 string                  `json:"dataSetName,omitempty" bson:"dataSetName,omitempty"`
	DataSetDescription          string                  `json:"dataSetDescription,omitempty" bson:"dataSetDescription,omitempty"`
	DataSetJoinCollection       []DataSetJoinCollection `json:"dataSetJoinCollection,omitempty" bson:"dataSetJoinCollection,omitempty"`
	CustomColumn                []CustomColumn          `json:"CustomColumn,omitempty" bson:"CustomColumn,omitempty"`
	SelectedList                []SelectedListItem      `json:"SelectedList,omitempty" bson:"SelectedList,omitempty"`
	FilterParams                []FilterParam           `json:"FilterParams,omitempty" bson:"FilterParams,omitempty"`
	DataSetBaseCollection       string                  `json:"dataSetBaseCollection,omitempty" bson:"dataSetBaseCollection,omitempty"`
	Aggregation                 []Aggregation           `json:"Aggregation,omitempty" bson:"Aggregation,omitempty"`
	Filter                      []FilterCondition       `json:"Filter,omitempty" bson:"Filter,omitempty"`
	DataSetBaseCollectionFilter []FilterCondition       `json:"dataSetBaseCollectionFilter,omitempty, bson:"dataSetBaseCollectionFilter,omitempty"`
	Pipeline                    string                  `json:"pipeline,omitempty" bson:"pipeline,omitempty"`
	Reference_pipeline          string                  `json:"Reference_pipeline,omitempty" bson:"Reference_pipeline,omitempty"`
	Start                       int                     `json:"start,omitempty" bson:"start,omitempty"`
	End                         int                     `json:"end,omitempty" bson:"end,omitempty"`
}

type DataSetJoinCollection struct {
	ToCollection        string            `json:"toCollection,omitempty" bson:"toCollection,omitempty"`
	ToCollectionField   string            `json:"toCollectionField,omitempty" bson:"toCollectionField,omitempty"`
	Filter              []FilterCondition `json:"Filter,omitempty" bson:"Filter,omitempty"`
	ConvertToString     bool              `json:"convert_To_String,omitempty" bson:"convert_To_String,omitempty"`
	FromCollection      string            `json:"fromCollection,omitempty" bson:"fromCollection,omitempty"`
	FromCollectionField string            `json:"fromCollectionField,omitempty" bson:"fromCollectionField,omitempty"`
}

type Filter struct {
	Clause     string      `json:"clause" bson:"clause"`
	Conditions []Condition `json:"conditions" bson:"conditions"`
}

type Condition struct {
	Column   string `json:"column" bson:"column"`
	Operator string `json:"operator" bson:"operator"`
	Type     string `json:"type" bson:"type"`
	Value    string `json:"value" bson:"value"`
}

type LookupQuery struct {
	Operation string        `json:"operation" bson:"operation"`
	ParentRef CollectionRef `json:"parent_collection" bson:"parent_collection"`
	ChildRef  CollectionRef `json:"child_collection" bson:"child_collection"`
}

type CollectionRef struct {
	Name    string   `json:"name" bson:"name"`
	Key     string   `json:"key" bson:"key"`
	Columns []string `json:"columns,omitempty" bson:"columns,omitempty"`
	Filter  []Filter `json:"filter,omitempty" bson:"filter,omitempty"`
}

type EmailServerConfig struct {
	OrgId    string `json:"org_id" bson:"org_id"`
	Host     string `json:"host"`
	Port     int    `json:"port"`
	UserName string `json:"user_name" bson:"user_name"`
	Password string `json:"password" bson:"password"`
}
