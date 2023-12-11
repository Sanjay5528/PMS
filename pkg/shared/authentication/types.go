package authentication

import (
	"github.com/sirupsen/logrus"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

var loggerName string = "authentication"
var log *logrus.Entry = utils.GetLogEntry(loggerName)

// LoginRequest
type LoginRequest struct {
	Id       string `json:"id" bson:"id" validate:"required"`
	Password string `json:"password" bson:"password" validate:"required"`
}

// LoginResponse - for Login Response
type LoginResponse struct {
	Name       string             `json:"name"`
	UserRole   interface{}        `json:"role"`
	UserOrg    utils.Organization `json:"org" bson:"org"`
	Token      string             `json:"token"`
	EmployeeID interface{}             `json:"employee_id,omitempty"`
}

// ResetPasswordRequestDto - Dto for reset password Request
type ResetPasswordRequest struct {
	Id     string `json:"id" bson:"id" validate:"required,id"`
	OldPwd string `json:"old_pwd" bson:"old_pwd" validate:"required"`
	NewPwd string `json:"new_pwd" bson:"new_pwd" validate:"required"`
}
