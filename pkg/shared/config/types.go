package config

type User struct {
	Email         string `json:"email" bson:"email"`
	First_name    string `json:"first_name" bson:"first_name"`
	Last_name     string `json:"last_name" bson:"last_name"`
	User_role     string `json:"user_role" bson:"user_role"`
	User_type     string `json:"user_type" bson:"user_type"`
	password_hash string `json:"password_hash" bson:"password_hash"`
}

type LoginRequest struct {
	Id       string `json:"id" bson:"id" validate:"required"`
	Password string `json:"password" bson:"password" validate:"required"`
}

// LoginResponse - for Login Response
type LoginResponse struct {
	Name       string      `json:"name"`
	UserRole   interface{} `json:"role"`
	Token      string      `json:"token"`
	EmployeeID interface{} `json:"employee_id,omitempty"`
}
