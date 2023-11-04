package authentication

import (
	"kriyatec.com/go-api/pkg/shared/helper"
)

// LoginRequest
type LoginRequest struct {
	Id       string `json:"id" validate:"required"`
	Password string `json:"password" validate:"required"`
}

// LoginResponse - for Login Response
type LoginResponse struct {
	Name        string              `json:"name"`
	UserRole    string              `json:"role"`
	UserOrg     helper.Organization `json:"org" bson:"org"`
	UserProfile interface{}         `json:"profile" bson:"profile"`
	Token       string              `json:"token"`
}

// ResetPasswordRequestDto - Dto for reset password Request
type ResetPasswordRequest struct {
	Id     string `json:"id,omitempty"`
	OldPwd string `json:"old_pwd,omitempty" bson:"old_pwd,omitempty"`
	NewPwd string `json:"new_pwd" bson:"new_pwd" validate:"required"`
}

// OTPGenerateResponse - To return AuthKey
type OTP struct {
	AuthKey string `json:"auth_key"`
	Otp     int    `json:"otp"`
}

type OTPResponse struct {
	Token  string `json:"token"`
	UserId string `json:"user_id"`
}
