package config

import (
	"github.com/gofiber/fiber/v2"
	//"kriyatec.com/pms-api/pkg/shared/helper"
)

func SetupAllRoutes(app *fiber.App) {

	app.Static("/image", "")
	SetupConfig(app)
	modelConfigListBasedOnDB(app)
}

// SetupConfig --METHOD To access only super Admin this api
func SetupConfig(app *fiber.App) {
	r := app.Group("/api")
	r.Post("user", postConfigHandler)
	r.Post("auth/login", postLoginHandler)

	// r.Use(utils.JWTMiddleware())
	r.Post("/:model_name", postCollectionsHandler)
	r.Get("/shared", GetsharedDBHandler)
	r.Get("/default", GetsharedDBDefaultHandler)
}

func modelConfigListBasedOnDB(app *fiber.App) {
	r := app.Group("/model_config")
	r.Get("/shared/:dbname", SharedDbCOnfig)

}
