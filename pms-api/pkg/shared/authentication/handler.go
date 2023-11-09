package authentication

import (
	"context"
	"net/http"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"

	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/helper"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

// To get the ctx for Global
var ctx = context.Background()

// LoginHandler - Method to Valid the user id and password Auth
func LoginHandler(c *fiber.Ctx) error {

	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	loginRequest := new(LoginRequest)
	if err := c.BodyParser(loginRequest); err != nil {
		return shared.BadRequest("Invalid params")
	}
	
	if loginRequest.Id == "" {
		shared.BadRequest("Invalid User ID")
	}

	filter := bson.M{
		"_id": loginRequest.Id,
	}

	user, err := helper.FindDocs(org.Id, "user", filter)
	if err != nil {

		return shared.BadRequest("Invalid user ID")
	}

	if !helper.CheckPassword(loginRequest.Password, primitive.Binary(user["pwd"].(primitive.Binary)).Data) {
		return shared.BadRequest("Invalid User Password")
	}

	// If the password is valid, generate a JWT token
	claims := utils.GetNewJWTClaim()
	claims["id"] = user["_id"]
	claims["role"] = user["role"]
	claims["uo_id"] = org.Id
	claims["uo_type"] = org.Type

	userName := user["name"]
	if userName == nil {
		userName = user["first_name"]
	}

	token := utils.GenerateJWTToken(claims, 24*60) //24*60

	response := &LoginResponse{
		Name:     userName.(string),
		UserRole: user["role"].(string),
		UserOrg:  org,
		Token:    token,
	}

	return shared.SuccessResponse(c, fiber.Map{
		"Message":       "Login Successfully",
		"LoginResponse": response,
	})
}

func postResetPasswordHandler(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {

		return shared.BadRequest("Invalid Org Id")
	}

	userToken := utils.GetUserTokenValue(c)
	ctx := context.Background()
	var req ResetPasswordRequest

	err := c.BodyParser(req)
	if err != nil {
		shared.BadRequest("Invalid")
	}
	if req.Id == "" {
		req.Id = userToken.UserId
	}

	result := database.GetConnection(org.Id).Collection("user").FindOne(ctx, bson.M{
		"_id": req.Id,
	})
	var user bson.M
	err = result.Decode(&user)
	if err == mongo.ErrNoDocuments {
		shared.InternalServerError("User Id not available")

	}
	if err != nil {
		log.Errorf("Error getting user :%s error:%s", req.Id, err.Error())

		shared.InternalServerError("Internal server Error")

	}

	if userToken.UserRole == "" {
		//Check the old password
		if !helper.CheckPassword(req.OldPwd, primitive.Binary(user["pwd"].(primitive.Binary)).Data) {

			shared.BadRequest("Given user id and old password mismated")
		}
	}

	// TODO set random string - hard coded for now
	passwordHash, _ := helper.GeneratePasswordHash(req.NewPwd)
	_, err = database.GetConnection(org.Id).Collection("user").UpdateByID(ctx,
		req.Id,
		bson.M{"$set": bson.M{"pwd": bson.M{"$binary": passwordHash, "$type": "0"}}},
	)
	if err != nil {
		log.Errorf("Error Reset password for :%s error:%s", req.Id, err.Error())
		shared.SendErrorResponse(c, http.StatusInternalServerError)

	}
	shared.SuccessResponse(c, "Password Updated")
	// automatically return 200 success (http.StatusOK) - no need to send explictly
	return nil
}

//todo Currently not use
// func MobileOtpGenerate(c *fiber.Ctx) error {
// 	var req bson.M
// 	otpInfo := make(map[string]interface{})
// 	resp := make(map[string]string)
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return helper.BadRequest("Organization Id missing")
// 	}
// 	err := c.BodyParser(&req)
// 	_, isMobileNumExist := req["mobile"]
// 	if !isMobileNumExist {
// 		return helper.BadRequest("Invalid request, Unable to parse Mobile number")
// 	}
// 	mobile := req["mobile"].(string)
// 	result := database.GetConnection(orgId).Collection("user").FindOne(ctx,
// 		bson.M{
// 			"mobile":        req["mobile"].(string),
// 			"mobile_access": "Y",
// 			"status":        "A",
// 		})
// 	var user bson.M
// 	err = result.Decode(&user)
// 	if err == mongo.ErrNoDocuments {
// 		return helper.BadRequest("User Id not available")
// 	}
// 	if err != nil {
// 		return helper.BadRequest("Internal server Error")
// 	}
// 	id := uuid.New().String()
// 	otp := helper.GetOTPValue()
// 	helper.SmsInitOTP(req["mobile"].(string), otp)
// 	otpInfo["_id"] = id
// 	otpInfo["otp"] = otp
// 	otpInfo["otp_expired"] = false
// 	otpInfo["otp_verified"] = false
// 	if req["device_info"] != nil {
// 		otpInfo["device_info"] = req["device_info"]
// 	}
// 	otpInfo["created_by"] = req["mobile"].(string)
// 	otpInfo["created_on"] = time.Now()
// 	_, err = database.GetConnection(orgId).Collection("user").UpdateOne(
// 		ctx,
// 		bson.M{"mobile": mobile},
// 		bson.M{
// 			"$addToSet": bson.M{
// 				"otp_info": otpInfo,
// 			},
// 			//"$set": res,
// 		}, options.Update().SetUpsert(false))
// 	if err != nil {
// 		log.Print(err.Error())
// 	}
// 	//_, err = database.GetConnection(orgId).Collection("user_device").InsertOne(ctx, req)
// 	if err != nil {
// 		return helper.BadRequest(err.Error())
// 	}
// 	//resp = OTP{AuthKey: id, Otp: otp}
// 	resp["auth_key"] = id
// 	return helper.SuccessResponse(c, resp)
// }

//todo Currently not use

// func MobileOtpValidation(c *fiber.Ctx) error {
// 	var req OTP
// 	orgId := c.Get("OrgId")
// 	if orgId == "" {
// 		return helper.BadRequest("Organization Id missing")
// 	}
// 	//ctx := context.Background()
// 	err := c.BodyParser(&req)
// 	if err != nil || req.Otp == 0 || req.AuthKey == "" {
// 		return helper.BadRequest("Invalid request, Unable to parse OTP or Auth Key")
// 	}
// 	filter := bson.M{
// 		"otp_info": bson.M{
// 			"$elemMatch": bson.M{
// 				"otp_expired":  false,
// 				"otp_verified": false,
// 				"_id":          req.AuthKey,
// 				"otp":          req.Otp,
// 				"created_on": bson.M{
// 					"$gte": time.Now().Add(-5 * time.Minute),
// 					"$lt":  time.Now(),
// 				},
// 			},
// 		},
// 	}

// 	// Run the query and retrieve the matching document
// 	var result bson.M
// 	err = database.GetConnection(orgId).Collection("user").FindOne(ctx, filter).Decode(&result)
// 	if err == mongo.ErrNoDocuments {
// 		return helper.BadRequest("Invalid OTP")
// 	}
// 	if err != nil {
// 		return helper.BadRequest("Internal server Error")
// 	}
// 	updateDoc := bson.M{
// 		"$set": bson.M{
// 			"otp_info.$[].otp_expired":      true,
// 			"otp_info.$[elem].otp_verified": true,
// 			"otp_info.$[elem].updated_by":   result["mobile"].(string),
// 			"otp_info.$[elem].updated_on":   time.Now(),
// 		},
// 	}

// 	// Define the filter to match the document containing the array
// 	updateFilter := bson.M{"_id": result["_id"].(string)}

// 	// Define the array element positional operator
// 	arrayFilters := options.Update().SetArrayFilters(options.ArrayFilters{
// 		Filters: []interface{}{bson.M{"elem._id": req.AuthKey}},
// 	})
// 	_, err = database.GetConnection(orgId).Collection("user").UpdateOne(ctx, updateFilter, updateDoc, arrayFilters)
// 	if err != nil {
// 		log.Print(err.Error())
// 	}
// 	claims := helper.GetNewJWTClaim()
// 	claims["id"] = result["_id"]
// 	claims["role"] = result["role"]
// 	claims["org_id"] = orgId
// 	// claims["org_group"] = orgId
// 	userName := result["email"]
// 	if userName == nil {
// 		userName = result["name"]
// 	}
// 	token := helper.GenerateJWTToken(claims, 365*10)
// 	response := OTPResponse{token, result["_id"].(string)}
// 	return helper.SuccessResponse(c, response)
// }

func OrgConfigHandler(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {
		//send error
		return shared.BadRequest("Org not found")
	}
	return shared.SuccessResponse(c, org)
}
