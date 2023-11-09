package entities

//package helper

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	//"time"

	// "path/filepath"
	// "time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
)
var s3Client *s3.S3
func InitS3Client() {

	var api_key = os.Getenv("S3_API_KEY")
	var secret = "ydkG746Bw1ZOpBJrue6eJha9ns1h6QbFZoKx3GzZNGw"
	//os.Getenv("S3_API_SECRET")
	var endpoint = os.Getenv("S3_ENDPOINT")
	var region = os.Getenv("S3_REGION")
	fmt.Println("API Key:", api_key)
    fmt.Println("Secret:", secret)
    fmt.Println("Endpoint:", endpoint)
    fmt.Println("Region:", region)
	var s3Config = &aws.Config{
		Credentials:      credentials.NewStaticCredentials(api_key, secret, ""),
		Endpoint:         aws.String(endpoint),
		Region:           aws.String(region),
		S3ForcePathStyle: aws.Bool(false),
	}
	var newSession = session.New(s3Config)
	s3Client = s3.New(newSession)
	fmt.Println(s3Client)
}

// func S3PdfFileUpload(s3Client *s3.S3, filePath string, fileName string) (string, error) {
// 	fmt.Println(filePath)
// 	fmt.Println(fileName)
// 	year := time.Now().Format("2006")
// 	month := time.Now().Format("01")

// 	pdfFolderPath := os.Getenv("PDF_FOLDER_PATH")
// 	FolderKey := pdfFolderPath + "/" + year + "/" + month

// 	// Create the folder in S3
// 	object := &s3.PutObjectInput{
// 		Bucket: aws.String("tpctrz"), // Replace with your S3 bucket name
// 		Key:    aws.String(FolderKey + "/"),
// 		ACL:    aws.String("public-read"),
// 	}

// 	_, err := s3Client.PutObject(object)
// 	if err != nil {
// 		fmt.Printf("Failed to create folder or upload file: %v\n", err)
// 		return "", err
// 	}
// 	// Open the PDF file
// 	file, err := os.Open(filePath)
// 	if err != nil {
// 		fmt.Printf("Failed to open file: %v", err)
// 		return "", err
// 	}
// 	defer file.Close()
// 	fileKey := FolderKey + "/" + filepath.Base(fileName)
// 	// Upload the file to the created folder in S3
// 	object = &s3.PutObjectInput{
// 		Bucket:      aws.String("pms"), // Replace with your S3 bucket name
// 		Key:         aws.String(fileKey),
// 		Body:        file, // Pass the opened file as the Body parameter
// 		ACL:         aws.String("public-read"),
// 		ContentType: aws.String("application/pdf"), // Set the content type to PDF
// 	}

// 	_, err = s3Client.PutObject(object)
// 	if err != nil {
// 		fmt.Printf("Failed to upload file: %v", err)
// 		return "", err
// 	}
// 	return fileKey, nil
// }




// func S3PdfFileUpload(s3Client *s3.S3, filePath string, employeeID string) (string, string) {
// 	// Generate folder paths
// 	dateFolder := time.Now().Format("2006-01-02")
// 	employeeFolder := employeeID

// 	// Create the S3 object key with the folder structure
// 	fileKey := filepath.Join("PDF", dateFolder, employeeFolder, filepath.Base(filePath))

// 	// Open the PDF file
// 	file, err := os.Open(filePath)
// 	if err != nil {
// 		fmt.Printf("Failed to open file: %v", err)
// 		return "", "err"
// 	}
// 	defer file.Close()

// 	// Upload the file to S3
// 	object := &s3.PutObjectInput{
// 		Bucket:      aws.String("seekers"), // Replace with your S3 bucket name
// 		Key:         aws.String(fileKey),
// 		Body:        file,
// 		ACL:         aws.String("public-read"),
// 		//ContentType: aws.String("application/pdf"),
// 	}

// 	_, err = s3Client.PutObject(object)
// 	if err != nil {
// 		fmt.Printf("Failed to upload file: %v", err)
// 		return "", ""
// 	}
// 	//https://seekers.sgp1.digitaloceanspaces.com/PDF/2023-07-20/E001/aggregations.txt/aggregations.txt
	
// 	fileURL := fmt.Sprintf("https://seekers.sgp1.digitaloceanspaces.com/%s",  fileKey)
// 	return fileKey, fileURL
// }



func S3PdfFileUpload(s3Client *s3.S3, filePath string, employeeID string,default_path1 ,default_path2 string) (string, string) {

	employeeFolder := employeeID

	// Create the S3 object key with the folder structure
	fileKey := filepath.Join(default_path1, employeeFolder,default_path2 ,filepath.Base(filePath))

	// Open the file
	file, err := os.Open(filePath)
	if err != nil {
		fmt.Printf("Failed to open file: %v", err)
		return "", "err"
	}
	defer file.Close()

	// Determine the Content-Type based on the file extension
	contentType := http.DetectContentType(nil) 
	_, err = file.Read(nil)
	if err != nil {
		fmt.Printf("Failed to read file: %v", err)
		return "", "err"
	}
	file.Seek(0, 0) // Reset file read position

	// Upload the file to S3
	object := &s3.PutObjectInput{
		Bucket:      aws.String("seekers"), // Replace with your S3 bucket name
		Key:         aws.String(fileKey),
		Body:        file,
		ACL:         aws.String("public-read"),
		ContentType: aws.String(contentType), // Set the determined content type
	}

	_, err = s3Client.PutObject(object)
	if err != nil {
		fmt.Printf("Failed to upload file: %v", err)
		return "", ""
	}

	fileURL := fmt.Sprintf("https://seekers.sgp1.digitaloceanspaces.com/%s", fileKey)
	return fileKey, fileURL
}
