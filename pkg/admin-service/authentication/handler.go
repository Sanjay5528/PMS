package authentication

import (
	"context"
	"fmt"
	//"fmt"
	//"fmt"
	"log"
	//"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"kriyatec.com/go-api/pkg/shared/database"
	"kriyatec.com/go-api/pkg/shared/helper"
)

var ctx = context.Background()


func LoginHandler(c *fiber.Ctx) error {
	
	org, exists := helper.GetOrg(c)
	if !exists {
		//send error
		return helper.BadRequest("Invalid Org Id")
	}
	
	ctx := context.Background()
	loginRequest := new(LoginRequest)
	if err := c.BodyParser(loginRequest); err != nil {
		return helper.BadRequest("Invalid params")
	}
fmt.Println(loginRequest,"loginRequest")
	
	fmt.Println(loginRequest.Id)
	result := database.GetConnection("aces").Collection("user").FindOne(ctx, bson.M{
		"_id": loginRequest.Id,
	})
	var user bson.M
	err := result.Decode(&user)
	fmt.Println(user,"user")
	if user["accessright"]==false{
		return helper.BadRequest("you don't have access to login")
	}
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("Invalid User Id / Password")
	}
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	
	if !helper.ValidatePassword(loginRequest.Password, user["pwd"].(string)) {
		return helper.BadRequest("Invalid ID / Password")
	}

	claims := helper.GetNewJWTClaim()
	claims["id"] = user["_id"]
	claims["role"] = user["role"]
	claims["uo_id"] = org.Id
	claims["uo_group"] = org.Group
	userName := user["name"]
	if userName == nil {
		userName = user["f_name"]
	}

	token := helper.GenerateJWTToken(claims, 365*10)
	response := &LoginResponse{
		Name:        userName.(string),
		UserRole:    user["role"].(string),
		UserOrg:     org,
		UserProfile: user,
		Token:       token,
	}
	return c.JSON(response)
}

func MobileOtpGenerate(c *fiber.Ctx) error {
	var req bson.M
	otpInfo := make(map[string]interface{})
	resp := make(map[string]string)
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	err := c.BodyParser(&req)
	_, isMobileNumExist := req["mobile"]
	if !isMobileNumExist {
		return helper.BadRequest("Invalid request, Unable to parse Mobile number")
	}
	mobile := req["mobile"].(string)
	result := database.GetConnection(orgId).Collection("user").FindOne(ctx,
		bson.M{
			"mobile":        req["mobile"].(string),
			"mobile_access": "Y",
			"status":        "A",
		})
	var user bson.M
	err = result.Decode(&user)
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("User Id not available")
	}
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	id := uuid.New().String()
	otp := helper.GetOTPValue()
	helper.SmsInitOTP(req["mobile"].(string), otp)
	otpInfo["_id"] = id
	otpInfo["otp"] = otp
	otpInfo["otp_expired"] = false
	otpInfo["otp_verified"] = false
	if req["device_info"] != nil {
		otpInfo["device_info"] = req["device_info"]
	}
	otpInfo["created_by"] = req["mobile"].(string)
	otpInfo["created_on"] = time.Now()
	_, err = database.GetConnection(orgId).Collection("user").UpdateOne(
		ctx,
		bson.M{"mobile": mobile},
		bson.M{
			"$addToSet": bson.M{
				"otp_info": otpInfo,
			},
			//"$set": res,
		}, options.Update().SetUpsert(false))
	if err != nil {
		log.Print(err.Error())
	}
	//_, err = database.GetConnection(orgId).Collection("user_device").InsertOne(ctx, req)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	//resp = OTP{AuthKey: id, Otp: otp}
	resp["auth_key"] = id
	return helper.SuccessResponse(c, resp)
}

func SetPIN(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)
	pin := c.Params("pin")

	_, err := database.GetConnection(orgId).Collection("user").UpdateOne(
		ctx,
		bson.M{"_id": token.UserId},
		bson.M{
			"$set": bson.M{
				"pin": pin,
			},
			//"$set": res,
		}, options.Update().SetUpsert(false))
	if err != nil {
		log.Print(err.Error())
	}
	//_, err = database.GetConnection(orgId).Collection("user_device").InsertOne(ctx, req)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return helper.SuccessResponse(c, "PIN has been updated successfully")
}

func ValidateUser(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	token := helper.GetUserTokenValue(c)

	result := database.GetConnection(orgId).Collection("user").FindOne(ctx, bson.M{
		"_id": token.UserId,
	})
	var user bson.M
	err := result.Decode(&user)
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("Invalid User Id / Password")
	}
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	if user["mobile_access"] == "Y" && user["status"] == "A" {
		return helper.SuccessResponse(c, "Active User")
	}
	return helper.BadRequest("Access Denied")
}

func MobileOtpValidation(c *fiber.Ctx) error {
	var req OTP
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	//ctx := context.Background()
	err := c.BodyParser(&req)
	if err != nil || req.Otp == 0 || req.AuthKey == "" {
		return helper.BadRequest("Invalid request, Unable to parse OTP or Auth Key")
	}
	filter := bson.M{
		"otp_info": bson.M{
			"$elemMatch": bson.M{
				"otp_expired":  false,
				"otp_verified": false,
				"_id":          req.AuthKey,
				"otp":          req.Otp,
				"created_on": bson.M{
					"$gte": time.Now().Add(-5 * time.Minute),
					"$lt":  time.Now(),
				},
			},
		},
	}

	// Run the query and retrieve the matching document
	var result bson.M
	err = database.GetConnection(orgId).Collection("user").FindOne(context.Background(), filter).Decode(&result)
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("Invalid OTP")
	}
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	updateDoc := bson.M{
		"$set": bson.M{
			"otp_info.$[].otp_expired":      true,
			"otp_info.$[elem].otp_verified": true,
			"otp_info.$[elem].updated_by":   result["mobile"].(string),
			"otp_info.$[elem].updated_on":   time.Now(),
		},
	}

	// Define the filter to match the document containing the array
	updateFilter := bson.M{"_id": result["_id"].(string)}

	// Define the array element positional operator
	arrayFilters := options.Update().SetArrayFilters(options.ArrayFilters{
		Filters: []interface{}{bson.M{"elem._id": req.AuthKey}},
	})
	_, err = database.GetConnection(orgId).Collection("user").UpdateOne(context.Background(), updateFilter, updateDoc, arrayFilters)
	if err != nil {
		log.Print(err.Error())
	}
	claims := helper.GetNewJWTClaim()
	claims["id"] = result["_id"]
	claims["role"] = result["role"]
	claims["uo_id"] = orgId
	claims["uo_group"] = orgId
	userName := result["email"]
	if userName == nil {
		userName = result["name"]
	}
	token := helper.GenerateJWTToken(claims, 365*10)
	response := OTPResponse{token, result["_id"].(string)}
	return helper.SuccessResponse(c, response)
}

func ResetPasswordHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	userToken := helper.GetUserTokenValue(c)
	ctx := context.Background()
	req := new(ResetPasswordRequest)
	err := c.BodyParser(req)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	if req.Id == "" {
		req.Id = userToken.UserId
	}

	result := database.GetConnection(orgId).Collection("user").FindOne(ctx, bson.M{
		"_id": req.Id,
	})
	
	var user bson.M
	err = result.Decode(&user)
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("User Id not available")
	}
	
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	if userToken.UserRole == "SA" {
		//Check the old password
		if !helper.CheckPasswordHash(req.OldPwd, user["pwd"].(primitive.Binary)) {
			return helper.BadRequest("Given user id and old password mismated")
		}
	}
	// TODO set random string - hard coded for now
	passwordHash, _ := helper.GeneratePasswordHash(req.NewPwd)

	_, err = database.GetConnection(orgId).Collection("user").UpdateByID(ctx,
		req.Id,
		bson.M{"$set": bson.M{"pwd": passwordHash, "password_hash": passwordHash}},
	)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return c.JSON("Password Updated")
	// automatically return 200 success (http.StatusOK) - no need to send explictly
}

func ChangePasswordHandler(c *fiber.Ctx) error {
	orgId := c.Get("OrgId")
	if orgId == "" {
		return helper.BadRequest("Organization Id missing")
	}
	userToken := helper.GetUserTokenValue(c)
	ctx := context.Background()
	var req ResetPasswordRequest
	err := c.BodyParser(&req)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	if req.Id == "" {
		req.Id = userToken.UserId
	}
	var user bson.M
	err = database.GetConnection(orgId).Collection("user").FindOne(ctx, bson.M{
		"_id": req.Id,
	}).Decode(&user)
	if err == mongo.ErrNoDocuments {
		return helper.BadRequest("User Id not available")
	}
	if err != nil {
		return helper.BadRequest("Internal server Error")
	}
	//Check given old password is right or not?
	if req.OldPwd != "" {
		if !helper.ValidatePassword(req.OldPwd, user["pwd"].(string)) {
			return helper.BadRequest("Your Old password is Wrong!")
		}
	}
	//update new password hash to the table
	passwordHash := helper.PasswordHash(req.NewPwd)
	_, err = database.GetConnection(orgId).Collection("user").UpdateByID(ctx,
		req.Id,
		bson.M{"$set": bson.M{"pwd": passwordHash}},
	)
	if err != nil {
		return helper.BadRequest(err.Error())
	}
	return c.JSON("Password Updated")
	// automatically return 200 success (http.StatusOK) - no need to send explictly
}

func OrgConfigHandler(c *fiber.Ctx) error {
	org, exists := helper.GetOrg(c)
	if !exists {
		//send error
		return helper.BadRequest("Org not found")
	}
	return helper.SuccessResponse(c, org)
}
