package authentication

import (
	"github.com/gofiber/fiber/v2"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

func SetupRoutes(app *fiber.App) {
	//without JWT Token validation (without auth)
	auth := app.Group("/auth")
	auth.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Auth APIs")
	})

	auth.Post("/login", LoginHandler)
	auth.Get("/config", OrgConfigHandler)

	auth.Use(utils.JWTMiddleware())
	// Restricted Routes
	auth.Post("/resetpassword", postResetPasswordHandler)

}
