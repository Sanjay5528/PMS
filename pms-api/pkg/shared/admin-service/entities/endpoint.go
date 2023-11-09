package entities

import (
	"github.com/gofiber/fiber/v2"

	"kriyatec.com/pms-api/pkg/shared/helper"
)

func SetupAllRoutes(app *fiber.App) {

	SetupCRUDRoutes(app)
	SetupLookupRoutes(app)
	SetupDownloadRoutes(app)
	SetupBulkUploadRoutes(app)
	SetupDatasets(app)
	Setuptokenfree(app)
	app.Static("/image", fileUploadPath)
}

// Basic Crud
func SetupCRUDRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/entities/", "REST API")
	r.Post("/:model_name", PostDocHandler)
	r.Put("/:collectionName/:id?/", putDocByIDHandlers)
	r.Get("/:collectionName/:id", GetDocByIdHandler)
	r.Delete("/:collectionName/:id", DeleteById)
	r.Delete("/:collectionName", DeleteByAll)
	r.Post("/filter/:collectionName", getDocsHandler)
	// r.Get("/clients/:name", ActiveClientHandler)                          //todo
	r.Get("filter/:collectionName/:projectid", getDocByIddHandler) //todod
	// r.Get("filters/:collectionName/:clientname", getDocByClientIdHandler) //todo
	// r.Post("/:collectionName/increment/columnName/value", updateIncrementalValue)
}

// temp
func Setuptokenfree(app *fiber.App) {
	r := app.Group("/user/")
	r.Post("/register", UserRegister)
}

//	func SetupGroupRoutes(app *fiber.App) {
//		r := helper.CreateRouteGroup(app, "/group", "Data Lookup API")
//		r.Get("/:groupname", helper.GroupDataBasedOnRules)
//		r.Get("/testing/:modelName", helper.Testing)
//	}
//
// Data set
func SetupDatasets(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/dataset", "Data Sets")
	r.Post("/config/:options?", helper.DatasetsConfig)
	r.Post("/data/:datasetname", helper.DatasetsRetrieve)
	r.Put("/:datasetname", helper.UpdateDataset)
}
func SetupBulkUploadRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/upload_bulk", "Bulk Api")
	r.Get("/", helper.UploadbulkData)
}

// todo remove
func SetupQueryRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/query", "Raw Query API")
	// r.Post("/:type/:collectionName", rawQueryHandler)
	r.Get("/:collectionName/:colvalue/:key", ColvalHandler)
	r.Get("/task/:assignedto", EmployeeTaskHandler)     //
	r.Get("/timesheet/:timesheet_id", TimeSheetHandler) //
	r.Get("/project/:projectid", ModuleTaskHandler)
	r.Get("/projectname/:projectname", TeamMemberHandler) //
	r.Get("/statename/:country", StateHandler)
	r.Get("/:collectionName/:moduleid", getModuleByIdHandler) //

}

func SetupLookupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/lookup", "Data Lookup API")
	// r.Post("/", DataLookupDocsHandler)
	r.Get("/timesheet/:employee_id/:scheduledstartdate", TimeSheetByIdHandler)    //todo pending
	r.Get("/task/:employee_id", taskHandler)                                      // todo pending
	r.Put("/timesheet", postTimesheetDocHandler)                                  // todo pending
	r.Get("/unschedule/:employee_id/:date", getUnscheduleIdHandler)               // todo pending
	r.Get("/workedhour/:employee_id/:scheduledstartdate", TimeSheetByiiIdHandler) // todo pending
	//r.Get("/:id",BlockidHandler)
	//r.Get("/task/:employee_id/:scheduledstartdate",TimeSeetByIdHandler)
}

func SetupDownloadRoutes(app *fiber.App) {
	//without JWT Token validation (without auth)
	r := helper.CreateRouteGroup(app, "/file", "Upload APIs")
	r.Post("/:folder/:refId", helper.FileUpload)
	r.Get("/all/:category/:status/:page?/:limit?", getAllFileDetails)
	r.Get("/:category/:refId", getFileDetails)
	// r.Get("/:category/:refId/:fileName", fileDownload)
}

func SetupSharedDBRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/shared", "Shared DB API")
	// r.Get("/:collectionName", sharedDBEntityHandler)
	r.Post("/:teamid", TeamRoleHandler) //todo pending
}

func SetupUtilRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/util", "util APIs")
	r.Get("/nextseq/:key", getNextSeqNumberHandler)
	// r.Post("/getuploadurl", getPreSignedUploadUrlHandler)
	r.Post("/send-simple-email", sendSimpleEmailHandler)
	//// r.Post("/send-sms", sendSMS)
}
