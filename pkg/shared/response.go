package shared

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

type Error struct {
	Status  int    `json:"status"`
	Code    string `json:"code"`
	Message string `json:"message"`
}
type Response struct {
	Status   int         `json:"status"`
	Data     interface{} `json:"data"`
	ErrorMsg string      `json:"error_msg"`
}
type Success struct {
	Status   int         `json:"status"`
	Data     interface{} `json:"data"`
	ErrorMsg string      `json:"error_msg"`
}

// type GlobalErrorHandlerResp struct {
// 	Status  int         `json:"status"`
// 	Message interface{} `json:"message"`
// }

func (e *Error) Error() string {
	return e.Message
}

// func EntityNotFound(m string) *Error {
// 	return &Error{Status: 404, Code: "entity-not-found", Message: m}
// }

func BadRequest(m interface{}) error {
	return fiber.NewError(fiber.StatusInternalServerError, m.(string))
}

// func Unexpected(m string) *Error {
// 	return &Error{Status: 500, Code: "internal-server", Message: m}
// }

func SuccessResponse(c *fiber.Ctx, data interface{}) error {
	return c.JSON(&Success{Status: 200, Data: data})
}

func SuccessResponses(c *fiber.Ctx, data interface{}) error {

	return c.Status(fiber.StatusOK).JSON(data)

}

func InternalServerError(m string) error {
	return fiber.NewError(fiber.StatusInternalServerError, m)

}

func SendErrorResponse(c *fiber.Ctx, errMsg interface{}) error {
	response := make(map[string]interface{})
	response["status"] = 0
	response["data"] = map[string]interface{}{}
	response["error_msg"] = errMsg

	jsonRes, err := json.Marshal(response)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Unable to Marshal JSON")

	}

	c.Type("json")
	_, err = c.Write(jsonRes)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).SendString("Unable to Write JSON Response")

	}
	return nil
}
