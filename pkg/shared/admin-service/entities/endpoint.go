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
	SetupUtilRoutes(app)
	app.Static("/image", fileUploadPath)
	SetupaccessUser(app)
}

// Without token access
func SetupaccessUser(app *fiber.App) {
	r := app.Group("/activation-api/")
	r.Put("/generate-pwd/:access_key", helper.UpdateUserPasswordAndDeleteTempData)
	r.Get("/:access_key", helper.GetTemporaryUserDataByAccessKey)
}

func SetupCRUDRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/entities/", "REST API")
	r.Post("/:model_name", PostDocHandler)
	r.Put("/:model_name/:id?/", putDocByIDHandlers)
	r.Get("/:collectionName/:id", GetDocByIdHandler)
	r.Delete("/:collectionName/:id", DeleteById)
	r.Delete("/:collectionName", DeleteByAll)
	r.Post("/filter/:collectionName", getDocsHandler)

	//Old pms code above the endpoint
	r.Get("/clients/:name", ActiveClientHandler)                           //todo
	r.Get("/filter/:collectionName/:projectid", getDocByIddHandler)        //todod
	r.Get("/filters/:collectionName/:clientname", getDocByClientIdHandler) //todo
}

// create a group
func SetupGroupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/group", "Data Lookup API")
	r.Get("/:groupname", helper.GroupDataBasedOnRules)
	r.Get("/testing/:modelName", helper.Testing)
}

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

// old pms code endpoint
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

// old pms code
func SetupLookupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/lookup", "Data Lookup API")
	// r.Post("/", DataLookupDocsHandler)
	r.Get("/timesheet/:employee_id/:scheduledstartdate", TimeSheetByIdHandler)
	r.Get("/task/:employee_id", taskHandler)
	r.Put("/timesheet", postTimesheetDocHandler)
	r.Get("/unschedule/:employee_id/:date", getUnscheduleIdHandler)
	r.Get("/workedhour/:employee_id/:scheduledstartdate", TimeSheetByiiIdHandler)
	//r.Get("/:id",BlockidHandler)
	//r.Get("/task/:employee_id/:scheduledstartdate",TimeSeetByIdHandler)
}

func SetupDownloadRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/file", "Upload APIs")
	r.Post("/:folder/:refId", helper.FileUpload)
	r.Get("/all/:category/:status/:page?/:limit?", getAllFileDetails)
	r.Get("/:category/:refId", getFileDetails)
}

func SetupSharedDBRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/shared", "Shared DB API")
	// r.Get("/:collectionName", sharedDBEntityHandler)
	r.Post("/:teamid", TeamRoleHandler) //todo pending
}

func SetupUtilRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/util", "util APIs")
	r.Get("/nextseq/:key", getNextSeqNumberHandler)
	r.Get("/totalcount/:collectionName", helper.Sequencecount)
	//email send
	// r.Post("/send-simple-email", SendSimpleEmailHandler)
	//// r.Post("/send-sms", sendSMS)
}
