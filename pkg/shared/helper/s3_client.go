package helper

import (
	"bytes"
	"fmt"
	"log"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"github.com/xuri/excelize/v2"
	"go.mongodb.org/mongo-driver/bson"
	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

func initS3() (*s3.S3, string) {
	var api_key = utils.GetenvStr("S3_API_KEY")
	var secret = utils.GetenvStr("S3_API_SECRET")
	var endpoint = utils.GetenvStr("S3_ENDPOINT")
	var region = utils.GetenvStr("S3_REGION")
	var bucket = utils.GetenvStr("S3_BUCKET")

	var s3Config = &aws.Config{
		Credentials: credentials.NewStaticCredentials(api_key, secret, ""),
		Endpoint:    aws.String(endpoint),
		Region:      aws.String(region),
	}

	// var newSession = session.New(s3Config)

	// Create a new session using NewSession
	var newSession = session.Must(session.NewSession(s3Config))
	var s3Client = s3.New(newSession)
	return s3Client, bucket
}

func UploadFile(fileIn *multipart.FileHeader, key string) (bool, string) {
	s3Client, bucket := initS3()
	var errContent string
	var isErrExist bool
	file, err := fileIn.Open()
	if err != nil {
		isErrExist = true
		errContent = err.Error()
		return isErrExist, errContent
	}
	defer file.Close()
	buf := bytes.NewBuffer(nil)
	_, err = buf.ReadFrom(file)
	if err != nil {
		isErrExist = true
		errContent = err.Error()
		return isErrExist, errContent
	}
	_, err = s3Client.PutObjectWithContext(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(buf.Bytes()),
		ACL:    aws.String("public-read"),
	})

	if err != nil {
		isErrExist = true
		errContent = err.Error()
		return isErrExist, errContent
	}
	return isErrExist, errContent
}

func FileUpload(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("folder") // c.Params("category")
	refId := c.Params("refId")
	request, err := c.MultipartForm()
	if err != nil {
		return c.Status(422).JSON(fiber.Map{"errors": err.Error()})
	}

	token := utils.GetUserTokenValue(c)
	// year := time.Now().Year()
	// currentYear := strconv.Itoa(year)
	// currentMonth := time.Now().Format("01")
	// currentDate := time.Now().Format("02")
	//check the user folder,
	// folderName := fileCategory + "/" + orgId + "/" + currentYear + "-" + currentMonth + "/" + currentDate + "/" + refId

	folderName := fileCategory + "/" + refId

	var result []interface{}
	for _, file := range request.File {

		fileList := file

		for _, pathOfFile := range fileList {
			fileExtn := filepath.Ext(pathOfFile.Filename)
			fileName := strings.TrimSuffix(pathOfFile.Filename, fileExtn)
			fileName = fileName + "__" + time.Now().Format("2006-01-02-15-04-05") + fileExtn
			isErrorExist, errContent := UploadFile(pathOfFile, folderName+"/"+fileName)
			if isErrorExist {
				log.Print(errContent)
				return c.Status(422).JSON(fiber.Map{"errors": errContent})
			}
			//Save file name to the DB
			// id := uuid.New().String()
			id := Generateuniquekey()
			storageName := folderName + "/" + fileName
			apiResponse := bson.M{"_id": id, "ref_id": refId, "uploaded_by": token.UserId, "folder": fileCategory, "file_name": pathOfFile.Filename, "storage_name": storageName, "size": pathOfFile.Size} // "extn": filepath.Ext(fileName),

			InsertData(c, orgId, "user_files", apiResponse)

			result = append(result, apiResponse)

		}

	}
	return shared.SuccessResponse(c, result)
}


//todo currently not use
// func GetAllFileDetails(c *fiber.Ctx) error {
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return shared.BadRequest("Organization Id missing")
// 	}
// 	fileCategory := c.Params("folder")
// 	//status := c.Params("status")

// 	page := c.Params("page")
// 	if page == "" {
// 		page = "0"
// 	}
// 	limit := c.Params("limit")
// 	if limit == "" {
// 		limit = "25"
// 	}
// 	query := bson.M{"folder": fileCategory}
// 	response, err := GetQueryResult(orgId, "user_files", query, Page(page), Limit(limit), nil)
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	return shared.SuccessResponse(c, response)
// }

func GetFileDetails(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return shared.BadRequest("Organization Id missing")
	}
	fileCategory := c.Params("folder")
	refId := c.Params("refId")
	//	token := GetUserTokenValue(c)
	query := bson.M{"ref_id": refId, "folder": fileCategory}
	response, err := GetQueryResult(orgId, "user_files", query, int64(0), int64(200), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return shared.SuccessResponse(c, response)
}

func DeleteFileIns3(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	// connect the S3 Sever
	s3Client, bucket := initS3()

	// params Id
	ID := c.Params("id")

	collectionName := c.Params("collectionName")
	// Delete the User_files collection filter
	filter := bson.M{"_id": ID}

	// Define a MongoDB aggregation pipeline to retrieve file storage_name
	pipeline := bson.A{
		bson.D{{"$match", bson.D{{"_id", ID}}}},
		bson.D{{"$unset", "_id"}},
		bson.D{{"$project", bson.D{{"storage_name", 1}}}},
	}

	// Retrieve file metadata from MongoDB
	res, err := GetAggregateQueryResult(org.Id, collectionName, pipeline)
	// GetQueryResult(orgId, "user_files", pipeline, int64(0), int64(200), nil)
	if err != nil {
		return shared.BadRequest(err.Error())
	}

	// Delete the file metadata from MongoDB
	_, err = database.GetConnection(org.Id).Collection(collectionName).DeleteOne(ctx, filter)
	if err != nil {

	}
	// to get he storage to delete the s3
	for _, obj := range res {
		storageName, found := obj["storage_name"].(string)
		if found {

			_, err := s3Client.DeleteObject(&s3.DeleteObjectInput{Bucket: aws.String(bucket), Key: aws.String(storageName)})
			if err != nil {

			}

			// Wait until the object is deleted in S3
			err = s3Client.WaitUntilObjectNotExists(&s3.HeadObjectInput{
				Bucket: aws.String(bucket),
				Key:    aws.String(storageName),
			})

			if err != nil {
			}
		}
	}

	return nil
}

func UploadbulkData(c *fiber.Ctx) error {

	f, err := excelize.OpenFile("Parthiban.xlsx")
	if err != nil {
		// fmt.Println(err)
		return nil
	}
	defer func() {
		// Close the spreadsheet.
		if err := f.Close(); err != nil {
			// fmt.Println(err)
		}
	}()

	rows, err := f.GetRows("Sheet1")
	if err != nil {
		// fmt.Println(err)
		return nil

	}
	for _, row := range rows {
		for _, colCell := range row {

			fmt.Print(colCell, "\t")
		}

	}

	return nil
}

func DeleteByDatamodel(c *fiber.Ctx) error {
	//Get the orgId from Header
	org, exists := GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}
	collectionName := c.Params("model_name")

	// Delete the User_files collection filter
	filter := bson.M{"model_name": collectionName}
	// Delete the file metadata from MongoDB
	_, err := database.GetConnection(org.Id).Collection("model_config").DeleteOne(ctx, filter)
	if err != nil {

	}

	// Delete the file metadata from MongoDB
	_, err = database.GetConnection(org.Id).Collection("data_model").DeleteMany(ctx, filter)
	if err != nil {

	}

	return shared.SuccessResponse(c, "Delete Successfully")
}
