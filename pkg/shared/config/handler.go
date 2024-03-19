package config

import (
	"context"
	"fmt"
	"os"
	"strconv"

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
	return shared.SuccessResponse(c, res)

}

func GetsharedDBDefaultHandler(c *fiber.Ctx) error {

	pipeline := bson.A{
		bson.D{
			{"$group",
				bson.D{
					{"_id", "null"},
					{"datamodel_config",
						bson.D{
							{"$addToSet",
								bson.D{
									{"_id", "$_id"},
									{"model_name", "$model_name"},
									{"collection_name", "$collection_name"},
									{"is_collection", "$is_collection"},
									{"status", "$status"},
								},
							},
						},
					},
				},
			},
		},
		bson.D{{"$unset", "_id"}},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "data_set"},
					{"localField", "field"},
					{"foreignField", "field"},
					{"as", "dataset_config"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "screen"},
					{"localField", "field"},
					{"foreignField", "field"},
					{"as", "screen_config"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "menu"},
					{"localField", "field"},
					{"foreignField", "field"},
					{"as", "menu_config"},
				},
			},
		},
	}

	if c.Params("type") == "default" {

		cur, err := database.SharedDB.Collection("model_config").Aggregate(ctx, pipeline)
		if err != nil {
			return shared.BadRequest("invalid db name")
		}
		var res []bson.M
		if err = cur.All(ctx, &res); err != nil {
			return nil
		}
		return shared.SuccessResponse(c, res)

	} else {
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

		cur1, err := database.GetConnection(orgid).Collection("model_config").Aggregate(ctx, pipeline)
		if err != nil {
			return shared.BadRequest("invalid db name")
		}
		var res []bson.M
		if err = cur1.All(ctx, &res); err != nil {
			return nil
		}
		return shared.SuccessResponse(c, res)
	}

}

func PostHandler(c *fiber.Ctx) error {
	var data map[string]interface{}
	c.BodyParser(&data)

	var dbconfig bson.M
	database.SharedDB.Collection("db_config").FindOne(ctx, bson.D{{"db_name", data["db_name"].(string)}}).Decode(&dbconfig)
	if dbconfig != nil {
		return shared.BadRequest("Already Exist in DB Name")
	}

	var bsonscreenConfig bson.A
	for _, menu := range data["screen_config"].([]interface{}) {
		if menuStr, ok := menu.(string); ok {
			bsonscreenConfig = append(bsonscreenConfig, menuStr)
		}
	}

	screen_filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"_id",
						bson.D{
							{"$in",
								bsonscreenConfig,
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id", primitive.Null{}},
					{"screen_config",
						bson.D{
							{"$addToSet",
								bson.D{
									{"_id", "$_id"},
									{"type", "$type"},
									{"config", "$config"},
									{"status", "$status"},
									{"name", "$name"},
								},
							},
						},
					},
				},
			},
		},
	}

	screens, err := database.SharedDB.Collection("screen").Aggregate(ctx, screen_filter)

	var screen []bson.M
	if err = screens.All(ctx, &screen); err != nil {
		return shared.BadRequest("invalid db name")
	}

	menuConfigRaw := data["menu_config"].([]interface{})
	var bsonMenuConfig bson.A
	for _, menu := range menuConfigRaw {
		if menuStr, ok := menu.(string); ok {
			bsonMenuConfig = append(bsonMenuConfig, menuStr)
		}
	}

	menu_filter :=
		bson.A{
			bson.D{
				{"$match",
					bson.D{
						{"_id",
							bson.D{
								{"$in",
									bsonMenuConfig,
								},
							},
						},
					},
				},
			},
			bson.D{
				{"$group",
					bson.D{
						{"_id", primitive.Null{}},
						{"menu_config",
							bson.D{
								{"$addToSet",
									bson.D{
										{"_id", "$_id"},
										{"type", "$type"},
										{"config", "$config"},
										{"status", "$status"},
										{"name", "$name"},
									},
								},
							},
						},
					},
				},
			},
		}
	menus, err := database.SharedDB.Collection("menu").Aggregate(ctx, menu_filter)

	var menu []bson.M
	if err = menus.All(ctx, &menu); err != nil {
		return shared.BadRequest("invalid db name")
	}

	var bsondatasetConfig bson.A
	for _, menu := range data["dataset_config"].([]interface{}) {
		if menuStr, ok := menu.(string); ok {
			bsondatasetConfig = append(bsondatasetConfig, menuStr)
		}
	}

	data_set_filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"_id",
						bson.D{
							{"$in",
								bsondatasetConfig,
							},
						},
					},
				},
			},
		},
		bson.D{
			{"$group",
				bson.D{
					{"_id", primitive.Null{}},
					{"dataset_config",
						bson.D{
							{"$addToSet",
								bson.D{
									{"_id", "$_id"},
									{"dataSetName", "$dataSetName"},
									{"dataSetDescription", "$dataSetDescription"},
									{"dataSetJoinCollection", "$dataSetJoinCollection"},
									{"CustomColumn", "$CustomColumn"},
									{"FilterParams", "$FilterParams"},
									{"Aggregation", "$Aggregation"},
									{"dataSetBaseCollection", "$dataSetBaseCollection"},
									{"datasetbasecollectionfilter", "$datasetbasecollectionfilter"},
									{"Reference_pipeline", "$Reference_pipeline"},
									{"pipeline", "$pipeline"},
								},
							},
						},
					},
				},
			},
		},
	}
	data_sets, err := database.SharedDB.Collection("data_set").Aggregate(ctx, data_set_filter)

	var data_set []bson.M
	if err = data_sets.All(ctx, &data_set); err != nil {
		return shared.BadRequest("invalid db name")
	}

	var bsonmodelConfig bson.A
	for _, menu := range data["datamodel_config"].([]interface{}) {
		if menuStr, ok := menu.(string); ok {
			bsonmodelConfig = append(bsonmodelConfig, menuStr)
		}
	}

	modelconfigFilter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"model_name",
						bson.D{
							{"$in",
								bsonmodelConfig,
							},
						},
					},
				},
			},
		},
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
		bson.D{{"$unwind", "$data_model"}},
		bson.D{
			{"$group",
				bson.D{
					{"_id", primitive.Null{}},
					{"model_config",
						bson.D{
							{"$addToSet",
								bson.D{
									{"_id", "$_id"},
									{"model_name", "$model_name"},
									{"collection_name", "$collection_name"},
									{"is_collection", "$is_collection"},
									{"status", "$status"},
								},
							},
						},
					},
					{"data_model", bson.D{{"$addToSet", "$data_model"}}},
				},
			},
		},
	}

	modelconfigs, err := database.SharedDB.Collection("model_config").Aggregate(ctx, modelconfigFilter)

	var modelconfig []bson.M
	if err = modelconfigs.All(ctx, &modelconfig); err != nil {
		return shared.BadRequest("invalid db name")
	}

	db := database.CreateDb(GetenvStr("MONGO_SHAREDDB_HOST"), GetenvInt("MONGO_SHAREDDB_PORT"), data["db_name"].(string), GetenvStr("MONGO_SHAREDDB_USER"), GetenvStr("MONGO_SHAREDDB_PASSWORD"), "user")
	if len(menu) > 0 {
		for _, data := range menu[0]["menu_config"].(primitive.A) {
			go db.Collection("menu").InsertOne(ctx, data)
		}
	}

	if len(data_set) > 0 {
		for _, data := range data_set[0]["dataset_config"].(primitive.A) {
			go db.Collection("data_set").InsertOne(ctx, data)
		}
	}

	if len(screen) > 0 {
		for _, data := range screen[0]["screen_config"].(primitive.A) {
			go db.Collection("screen").InsertOne(ctx, data)
		}

	}
	if len(modelconfig) > 0 {

		for _, data := range modelconfig[0]["data_model"].(primitive.A) {
			go db.Collection("data_model").InsertOne(ctx, data)
		}
		for _, data := range modelconfig[0]["model_config"].(primitive.A) {
			go db.Collection("model_config").InsertOne(ctx, data)
		}
	}

	var DbConfig map[string]interface{}

	orgId := data["db_name"].(string) + helper.Generateuniquekey()
	fmt.Println(orgId)
	DbConfig["_id"] = helper.Generateuniquekey()
	DbConfig["org_id"] = orgId
	DbConfig["host"] = GetenvStr("MONGO_SHAREDDB_HOST")
	DbConfig["pwd"] = GetenvStr("MONGO_SHAREDDB_PASSWORD")
	DbConfig["user_id"] = GetenvStr("MONGO_SHAREDDB_USER")
	DbConfig["db_name"] = data["db_name"].(string)

	var Organization map[string]interface{}

	Organization["_id"] = orgId
	Organization["name"] = data["name"].(string)
	Organization["url"] = data["url"].(string)

	logoPath := data["logo"].(map[string]interface{})["storage_name"].(string)
	if logoPath != "" {
		Organization["logo"] = GetenvStr("S3_ENDPOINT") + logoPath
	}
	if data["group"] != "" || data["group"] != nil {
		Organization["group"] = data["group"].(string)
	}

	go SendEmail()

	// helper.SendEmail("organization", email_template, Organization)
	return shared.SuccessResponse(c, fiber.Map{
		"message":          "Insert Successfully",
		"datamodel_config": modelconfig,
		"dataset_config":   data_set,
		"screen_config":    screen,
		"menu_config":      menu,
	})
}

func GetenvStr(key string) string {
	return os.Getenv(key)
}

func GetenvInt(key string) int {
	s := GetenvStr(key)
	v, err := strconv.Atoi(s)
	if err != nil {
		return 0
	}
	return v
}
func SendEmail() error {
	var email_template bson.M
	err := database.SharedDB.Collection("email_template").FindOne(ctx, bson.D{{"title", "organization"}}).Decode(&email_template)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	return nil
}

// {
// 	"_id": {
// 	  "$oid": "6545c57e0fa0da031b66fc78"
// 	},
// 	"org_id": "pms",
// 	"host": "dataset.tf3gxwl.mongodb.net/",
// 	"user_id": "sanjay",
// 	"pwd": "mecwym4256hOdi3L",
// 	"db_name": "pms"
//   }

// fmt.Println(screen[0])
// fmt.Println("......>")
// fmt.Println(menu_filter[0])
// fmt.Println("......>")

// fmt.Println(data_set[0])
// fmt.Println("......>")

// fmt.Println(data["dataset_config"])
// fmt.Println(data["db_name"])

// return nil
// return shared.SuccessResponse(c, fiber.Map{
// 	"message":   "Insert Successfully",
// 	"insert ID": res.InsertedID,
// })
