package entities

import (
	"bytes"
	"context"
	"fmt"
	"mime/multipart"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)

func initS3() (*s3.S3, string) {
	var api_key = GetenvStr("TPZ_S3_API_KEY")
	var secret = GetenvStr("TPZ_S3_API_SECRET")
	var endpoint = GetenvStr("TPZ_S3_ENDPOINT")
	var region = "sgp1"
	//GetenvStr("TPZ_S3_REGION")
	var bucket = "pms"
	//GetenvStr("TPZ_S3_BUCKET")

	var s3Config = &aws.Config{
		Credentials: credentials.NewStaticCredentials(api_key, secret, ""),
		Endpoint:    aws.String(endpoint),
		Region:      aws.String(region),
	}
	var newSession = session.New(s3Config)
	var s3Client = s3.New(newSession)
	return s3Client, bucket
}

func GetenvStr(param string) string {
	return os.Getenv(param)
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
	_, err = s3Client.PutObjectWithContext(context.Background(), &s3.PutObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(key),
		Body:   bytes.NewReader(buf.Bytes()),
	})
	if err != nil {
		isErrExist = true
		errContent = err.Error()
		fmt.Println(err)
		return isErrExist, errContent
	}
	return isErrExist, errContent
}
