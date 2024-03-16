package config

import (
	"context"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"kriyatec.com/pms-api/pkg/shared"
	"kriyatec.com/pms-api/pkg/shared/database"
	"kriyatec.com/pms-api/pkg/shared/helper"
	"kriyatec.com/pms-api/pkg/shared/utils"
)

var ctx = context.Background()

func ConfigHandler(c *fiber.Ctx) error {

	fmt.Println("Hello World")
	var result interface{}

	// err := database.GetConnection("pms").Collection("user").FindOne(ctx, bson.D{}).Decode(&result)
	// if err != nil {
	// 	log.Errorf("Collection:%s Error: %s", "user", err.Error())
	// }
	database.SharedDB.Collection("organization").FindOne(ctx, bson.M{}).Decode(&result)
	// cur, err := database.SharedDB.Collection("organization").Find(ctx, bson.D{})
	// if err != nil {
	// 	log.Errorf("Organization Configuration Error %s", err.Error())
	// 	defer cur.Close(ctx)

	// }
	// if err = cur.All(ctx, &result); err != nil {

	// }
	return shared.SuccessResponse(c, result)
}

func postConfigHandler(c *fiber.Ctx) error {

	var data map[string]interface{}
	c.BodyParser(&data)

	passwordHash, _ := helper.GeneratePasswordHash(data["password"].(string))
	data["pwd"] = passwordHash
	data["_id"] = data["email"]
	data["role"] = "SA"
	delete(data, "password")
	_, err := database.SharedDB.Collection("user").InsertOne(ctx, data)
	if err != nil {
		return shared.BadRequest(err.Error())
	}

	return shared.SuccessResponse(c, "successfully created ")
}

// THis Api only for Super Admin
func postLoginHandler(c *fiber.Ctx) error {

	loginRequest := new(LoginRequest)
	if err := c.BodyParser(loginRequest); err != nil {
		return shared.BadRequest("Invalid params")
	}

	if loginRequest.Id == "" {
		return shared.BadRequest("Invalid User ID") // Added return statement
	}

	var user map[string]interface{}

	err := database.SharedDB.Collection("user").FindOne(ctx, bson.D{{"_id", loginRequest.Id}}).Decode(&user)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return shared.BadRequest(err.Error())
		}

	}
	if !helper.CheckPassword(loginRequest.Password, primitive.Binary(user["pwd"].(primitive.Binary)).Data) {
		return shared.BadRequest("Invalid User Password")
	}

	// If the password is valid, generate a JWT token
	claims := utils.GetNewJWTClaim()
	claims["id"] = user["_id"]
	claims["role"] = user["role"]
	userName := user["name"]
	if userName == nil {
		userName = user["first_name"]
	}

	token := utils.GenerateJWTToken(claims, 24*60)
	response := LoginResponse{
		Name:     userName.(string),
		UserRole: user["role"].(string),
		Token:    token,
	}

	return shared.SuccessResponse(c, fiber.Map{
		"Message":       "Login Successfully",
		"LoginResponse": response,
	})
}

func postCollectionsHandler(c *fiber.Ctx) error {
	// claim := utils.GetUserClaims(c)
	// role, ok := claim["role"].(string)
	// fmt.Println("Ss", claim)

	// userToken := utils.GetUserTokenValue(c)
	// fmt.Println(userToken)
	if c.Params("model_name") == "organization" {
		var data map[string]interface{}
		_, err := database.SharedDB.Collection("organization").InsertOne(ctx, data)
		if err != nil {
			if err == mongo.ErrNoDocuments {
				return shared.BadRequest(err.Error())
			}

		}
	}
	return nil
}

func GetsharedDBHandler(c *fiber.Ctx) error {

	filter := bson.A{
		bson.D{{"$project", bson.D{{"name", 1}}}},
	}

	cur, err := database.SharedDB.Collection("organization").Aggregate(ctx, filter)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return shared.BadRequest(err.Error())
		}

	}

	var result []bson.M
	if err = cur.All(ctx, &result); err != nil {
		return nil
	}

	return shared.SuccessResponse(c, result)
}

func SharedDbCOnfig(c *fiber.Ctx) error {

	filter := bson.A{
		bson.D{{"$match", bson.D{{"db_name", c.Params("dbname")}}}},
	}

	cur, err := database.SharedDB.Collection("db_config").Aggregate(ctx, filter)

	var result []bson.M
	if err = cur.All(ctx, &result); err != nil {
		return shared.BadRequest("invalid db name")
	}
	if result == nil {
		return shared.BadRequest(err.Error())
	}
	orgid := result[0]["org_id"].(string)

	pipeline := bson.A{
		bson.D{{"$match", bson.D{{"status", "A"}}}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "data_model"},
					{"localField", "collection_name"},
					{"foreignField", "model_name"},
					{"as", "data_model"},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id", "$_id"},
					{"model_config",
						bson.D{
							{"$first",
								bson.D{
									{"collection_name", "$collection_name"},
									{"is_collection", "$is_collection"},
									{"model_name", "$model_name"},
									{"_id", "$_id"},
								},
							},
						},
					},
					{"data_model", bson.D{{"$first", "$data_model"}}},
				},
			},
		},
		bson.D{{"$unset", "_id"}},
	}

	cur, err = database.GetConnection(orgid).Collection("model_config").Aggregate(ctx, pipeline)
	if err != nil {
		return shared.BadRequest("invalid db name")
	}

	var res []bson.M
	if err = cur.All(ctx, &res); err != nil {
		return nil
	}

	fmt.Println(res)
	return shared.SuccessResponse(c, res)

}

func GetsharedDBDefaultHandler(c *fiber.Ctx) error {

	cur, err := database.SharedDB.Collection("model_config").Find(ctx, bson.D{})
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return shared.BadRequest(err.Error())
		}

	}

	var result []bson.M
	if err = cur.All(ctx, &result); err != nil {
		return nil
	}

	return shared.SuccessResponse(c, result)
}
