package entities

import (
	"context"
	"time"
)

var ctx = context.Background()

type CreatedOnData struct {
	CreatedOn time.Time `json:"created_on" bson:"created_on"`
	CreatedBy string    `json:"created_by" bson:"created_by"`
}

type Leave struct {
	Type      string    `json:"type" bson:"type"`
	EmpId     string    `json:"emp_id" bson:"emp_id"`
	StartDate time.Time `json:"start_date" bson:"start_date"`
	EndDate   time.Time `json:"end_date" bson:"end_date"`
	Status    string    `json:"status" bson:"status"`
}
type ReportRequest struct {
	OrgId      string    `json:"org_id" bson:"org_id"`
	EmpId      string    `json:"emp_id" bson:"emp_id"`
	EmpIds     []string  `json:"emp_ids" bson:"emp_ids"`
	Type       string    `json:"type" bson:"type"`
	DateColumn string    `json:"date_column" bson:"date_column"`
	StartDate  time.Time `json:"start_date" bson:"start_date"`
	EndDate    time.Time `json:"end_date" bson:"end_date"`
	Status     string    `json:"status" bson:"status"`
}
type Condition struct {
	Column   string      `json:"column" bson:"column"`
	Operator string      `json:"operator" bson:"operator"`
	Value    interface{} `json:"value" bson:"value"`
}

type PreSignedUploadUrlRequest struct {
	FolderPath string             `json:"folder_path" bson:"folder_path"`
	FileKey    string             `json:"file_key" bson:"file_key"`
	MetaData   map[string]*string `json:"metadata" bson:"metadata"`
}

type Filter struct {
	Clause     string      `json:"clause" bson:"clause"`
	Conditions []Condition `json:"conditions" bson:"conditions"`
}
type Field struct {
	Heading    string  `json:"heading"`
	ColumnName string  `json:"column_name"`
	DataType   string  `json:"datatype"`
	Width      float64 `json:"width"`
}

type Config struct {
	PageHeading string  `json:"page_heading"`
	Fields      []Field `json:"fields"`
}
type RequestBody struct {
	Email bool `json:"email"`
	PDF   bool `json:"pdf"`
	
}
