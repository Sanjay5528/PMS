package main

import (
	"log"

	"github.com/joho/godotenv"

	"kriyatec.com/pms-api/pkg/shared/admin-service/entities"
	"kriyatec.com/pms-api/pkg/shared/authentication"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/helper"
	"kriyatec.com/pms-api/server"
)

var OrgID = "pms"

func main() {
	// Load environment variables from the .env file.
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Server initialization
	app := server.Create()

	// By Default try to connect shared db
	database.Init()

	// Set up authentication routes for routes that do not require a token.
	authentication.SetupRoutes(app)

	// Set up all routes for the application.
	entities.SetupAllRoutes(app)

	// Initialize custom validators for data validation.
	helper.InitCustomValidator() //testing

	go func() {
		helper.ServerInitstruct(OrgID)
	}()
	if err := server.Listen(app); err != nil {
		log.Panic(err)
	}

}
