package main

import (
	//"kriyatec.com/go-api/pkg/shared/helper"
	//"fmt"
	"log"

	"github.com/joho/godotenv"

	"kriyatec.com/go-api/pkg/admin-service/authentication"
	"kriyatec.com/go-api/pkg/admin-service/entities"
	"kriyatec.com/go-api/pkg/shared/database"
	"kriyatec.com/go-api/server"
	//"kriyatec.com/go-api/pkg/shared/helper"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	//fmt.Println(os.Getenv("APP_NAME") + " Service Loading")

	// Server initialization
	app := server.Create()

	//By Default try to connect shared db
	database.Init()
	//helper.LoadSMSConfig()
	authentication.SetupRoutes(app)
	entities.SetupAllRoutes(app)

	


	// Migrations
	//database.DB.AutoMigrate(&books.Book{})

	// Api routes
	//api.Setup(app)

	if err := server.Listen(app); err != nil {
		log.Panic(err)
	}
}
