package main

import (
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/helper"

	"kriyatec.com/pms-api/server"
)

var OrgID = []string{"pms"}

func main() {

	// Server initialization
	app := server.Create()
	database.Init()
	helper.ServerInitstruct(OrgID)

	app.Listen(":7070")
}
