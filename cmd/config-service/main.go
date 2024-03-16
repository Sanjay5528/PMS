package main

import (
	"log"
	"os"

	"github.com/joho/godotenv"
	"kriyatec.com/pms-api/pkg/shared/config"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/server"
)

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
	config.SetupAllRoutes(app)
	if err := server.Listen(app, os.Getenv("CONFIG_SERVER_LISTEN_URL")); err != nil {
		log.Panic(err)
	}

}
