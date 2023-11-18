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
	SetupTesting(app)
	app.Static("/image", fileUploadPath)
	SetupaccessUser(app)
}

// SetupaccessUser --METHOD  Onboarding Processing function without token use
func SetupaccessUser(app *fiber.App) {
	r := app.Group("/activation-api/")
	r.Put("/generate-pwd/:access_key", helper.UpdateUserPasswordAndremoveTempData)
	r.Get("/:access_key", helper.RetrieveTemporaryUserDataByAccessKey)
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
	r.Get("/filter/:collectionName/:projectid", getDocByIddHandler)        //remove
	r.Get("/filters/:collectionName/:clientname", getDocByClientIdHandler) //todo
}

// create a group
func SetupGroupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/group", "Data Lookup API")
	r.Get("/:groupname", helper.GroupDataBasedOnRules)

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

// SetupTesting -- METHOD testing function don't need for token
func SetupTesting(app *fiber.App) {

	r := app.Group("/testing")
	r.Delete("/:model_name", helper.DeleteByDatamodel)
	r.Get("/test/:modelName", helper.Testing)
}

// old pms code
func SetupLookupRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/lookup", "Data Lookup API")
	// r.Post("/", DataLookupDocsHandler)

	r.Get("/requriment/:projectid", RequrimentObjectproject)
	r.Get("/timesheet/:employee_id/:scheduledstartdate", TimeSheetByIdHandler)
	r.Put("/timesheet", postTimesheetDocHandler)
	r.Get("/unschedule/:employee_id/:date", getUnscheduleIdHandler)
	r.Get("/workedhour/:employee_id/:scheduledstartdate", TimeSheetByiiIdHandler)

}

func SetupDownloadRoutes(app *fiber.App) {
	r := helper.CreateRouteGroup(app, "/file", "Upload APIs")
	r.Post("/:folder/:refId", helper.FileUpload)
	r.Get("/all/:category/:status/:page?/:limit?", getAllFileDetails)
	r.Get("/:category/:refId", getFileDetails)
}
