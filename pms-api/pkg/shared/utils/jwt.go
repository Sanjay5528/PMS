package utils

import (
	"time"

	"github.com/gofiber/fiber/v2"
	jwtware "github.com/gofiber/jwt/v2"
	"github.com/golang-jwt/jwt/v4"
)

func GenerateJWTToken(claims jwt.MapClaims, ExpiryMinutes time.Duration) string {
	// Set Issued at and token expiry
	claims["iat"] = time.Now().Unix() // Issued at Time
	claims["exp"] = time.Now().Add(ExpiryMinutes * time.Minute).Unix()

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	// TODO: Set some string Keys and read from config securely instead of hard code (same as above)
	signedKey := getSignedKey()
	if signedKey == nil {
		return ""
	}

	s, err := token.SignedString(signedKey)
	if err != nil {
		return ""
	}

	return s
}

func GetUserTokenValue(c *fiber.Ctx) UserToken {
	var claim = GetUserClaims(c)
	return UserToken{
		UserId:   claim["id"].(string),
		UserRole: claim["role"].(string),
		OrgId:    claim["uo_id"].(string),
	}
}

func GetUserClaims(c *fiber.Ctx) jwt.MapClaims {
	user := c.Locals("user").(*jwt.Token)
	return user.Claims.(jwt.MapClaims)
}

// Protected protect routes
func JWTMiddleware() func(*fiber.Ctx) error {
	return jwtware.New(jwtware.Config{
		SigningKey:   getSignedKey(),
		ErrorHandler: jwtError,
	})
}

func jwtError(c *fiber.Ctx, err error) error {
	if err.Error() == "Missing or malformed JWT" {
		c.Status(fiber.StatusBadRequest)
		return c.JSON(fiber.Map{"status": "error", "message": "Auth Token Missing", "data": nil})
	} else {
		c.Status(fiber.StatusUnauthorized)
		return c.JSON(fiber.Map{"status": "error", "message": "Request Unauthorized", "data": nil})
	}
}

func GetNewJWTClaim() jwt.MapClaims {
	return jwt.MapClaims{}
}

func getSignedKey() []byte {
	return []byte(GetenvStr("KriyaTec@2023@pms$%ˆ"))
}
