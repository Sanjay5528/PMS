package entities

import (
	"github.com/gofiber/fiber/v2"

	"kriyatec.com/go-api/pkg/shared/helper"
)

func SetupAllRoutes(app *fiber.App) {
	GetFileUploadPath()
	//uploadPath := helper.GetEnvStr("FILE_UPLOAD_PATH", "./uploads")
	SetupCRUDRoutes(app)
	SetupSearchRoutes(app)
	SetupLookupRoutes(app)
	SetupQueryRoutes(app) //raw query
	SetupSharedDBRoutes(app)
	SetupUtilRoutes(app)
	SetupUploadRoutes(app)
	SetupDownloadRoutes(app)
	app.Static("/image", fileUploadPath)
}

func SetupCRUDRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/entities/", "REST API")
	r.Post("/:collectionName", postDocHandler)
	r.Get("/:collectionName", getDocsHandler)     
	r.Get("/clients/:name",ActiveClientHandler)   
	r.Get("/:collectionName/:id", getDocByIdHandler) 
	r.Get("filter/:collectionName/:projectid", getDocByIddHandler)
	r.Get("filters/:collectionName/:clientname", getDocByClientIdHandler)
	//r.Get("filtering/:collectionName/:companyname", getDocBycolonynameHandler) ///:id/:value
	r.Put("/:collectionName/:id", putDocByIDHandler)                     
	r.Get("/:collectionName/filter/:key/:value/:page?/:limit?", getDocsByKeyValueHandler)
	r.Post("/:collectionName/search/:page?/:limit?", searchDocsHandler)
	r.Post("/:collectionName/increment/columnName/value", updateIncrementalValue)
	r.Delete("/:collectionName/:colName/:value", deleteDocumentByIDHandler)
}

func SetupSearchRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/search", "Search API")
	r.Post("/:collectionName/:page/:limit?", searchDocsHandler)
	r.Post("/:parent_collection/:key_column/:child_collection/:lookup_column", searchEntityWithChildCountHandler)
}

func SetupLookupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/lookup", "Data Lookup API")
	r.Post("/", DataLookupDocsHandler)
	r.Get("/timesheet/:employee_id/:scheduledstartdate",TimeSheetByIdHandler ) //TimeSheetByIdHandler
	r.Get("/task/:employee_id",taskHandler)
	r.Put("/timesheet",postTimesheetDocHandler)
	r.Get("/unschedule/:employee_id/:date",getUnscheduleIdHandler)
	r.Get("/workedhour/:employee_id/:scheduledstartdate",TimeSheetByiiIdHandler)	
	//r.Get("/:id",BlockidHandler)
	//r.Get("/task/:employee_id/:scheduledstartdate",TimeSeetByIdHandler)
}	

func SetupQueryRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/query", "Raw Query API")
	r.Post("/:type/:collectionName", rawQueryHandler)
	r.Get("/:collectionName/:colvalue/:key", ColvalHandler)
	r.Get("/task/:assignedto", EmployeeTaskHandler)//
	r.Get("/timesheet/:timesheet_id", TimeSheetHandler)//
	r.Get("/project/:projectid", ModuleTaskHandler)
	r.Get("/projectname/:projectname", TeamMemberHandler)//
	r.Get("/statename/:country", StateHandler)
	r.Get("/:collectionName/:moduleid", getModuleByIdHandler)//
	
}

func SetupSharedDBRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/shared", "Shared DB API")
	r.Get("/:collectionName", sharedDBEntityHandler)
	r.Post("/:teamid",TeamRoleHandler)
}
func SetupUtilRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/util", "util APIs")
	r.Get("/nextseq/:key", getNextSeqNumberHandler)
	r.Post("/getuploadurl", getPreSignedUploadUrlHandler)
	r.Post("/send-simple-email", sendSimpleEmailHandler)
	//// r.Post("/send-sms", sendSMS)
}

func SetupUploadRoutes(app *fiber.App) {
	//without JWT Token validation (without auth)
	upload := helper.CreateRouteGroup(app, "/upload", "Upload APIs")
	upload.Post("/S3", handleFileUpload)
}

func SetupDownloadRoutes(app *fiber.App) {
	//without JWT Token validation (without auth)
	r := helper.CreateRouteGroup(app, "/file", "Upload APIs")
	r.Get("/all/:category/:status/:page?/:limit?", getAllFileDetails)
	r.Get("/:category/:refId", getFileDetails)
	// r.Get("/:category/:refId/:fileName", fileDownload)
}
