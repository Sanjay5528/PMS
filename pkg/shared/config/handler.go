package config

import (
	"context"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

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

	var Organization = make(map[string]interface{})

	Organization["_id"] = ""
	Organization["name"] = "Kriyatec"
	Organization["url"] = "admin"

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
	var data map[string]interface{}
	_, err := database.SharedDB.Collection(c.Params("model_name")).InsertOne(ctx, data)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			return shared.BadRequest(err.Error())
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

	if c.Params("type") == "shared" {

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
		fmt.Println(c.Params("dbname"))
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
		fmt.Println(orgid)
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

	var screen []bson.M
	if data["screen_config"] != nil {
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

		if err = screens.All(ctx, &screen); err != nil {
			return shared.BadRequest("invalid db name")
		}
	}

	var menu []bson.M
	if data["menu_config"] != nil {
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

		if err = menus.All(ctx, &menu); err != nil {
			return shared.BadRequest("invalid db name")
		}
	}

	var data_set []bson.M
	if data["dataset_config"] != nil {
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

		if err = data_sets.All(ctx, &data_set); err != nil {
			return shared.BadRequest("invalid db name")
		}
	}

	var modelconfig []bson.M
	if data["datamodel_config"] != nil {

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

		if err = modelconfigs.All(ctx, &modelconfig); err != nil {
			return shared.BadRequest("invalid db name")
		}
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

	var DbConfig = make(map[string]interface{})

	orgId := data["db_name"].(string) + helper.Generateuniquekey()
	DbConfig["_id"] = helper.Generateuniquekey()
	DbConfig["org_id"] = orgId
	DbConfig["host"] = GetenvStr("MONGO_SHAREDDB_HOST")
	DbConfig["pwd"] = GetenvStr("MONGO_SHAREDDB_PASSWORD")
	dbconfig["port"] = GetenvInt("MONGO_SHAREDDB_PORT")
	DbConfig["user_id"] = GetenvStr("MONGO_SHAREDDB_USER")
	DbConfig["db_name"] = data["db_name"].(string)

	go database.SharedDB.Collection("db_config").InsertOne(ctx, DbConfig)

	var Organization = make(map[string]interface{})
	Organization["_id"] = orgId
	Organization["name"] = data["name"].(string)
	Organization["url"] = data["url"].(string)
	Organization["email"] = data["email"].(string)
	if data["logo"] != nil {

		logoPath := data["logo"].(map[string]interface{})["storage_name"].(string)
		if logoPath != "" {
			Organization["logo"] = GetenvStr("S3_ENDPOINT") + logoPath
		}
	}
	data["_id"] = orgId
	data["status"] = "A"
	go database.SharedDB.Collection("organization").InsertOne(ctx, data)

	go SendEmail(data, db)
	return shared.SuccessResponse(c, fiber.Map{
		"message": "Insert Successfully",
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

func replacestring(original, placeholder, replacement string) string {
	return strings.Replace(original, placeholder, replacement, -1)
}

func SendEmail(Data map[string]interface{}, db *mongo.Database) error {
	var email_template bson.M
	err := database.SharedDB.Collection("email_template").FindOne(ctx, bson.D{{"title", "organization"}}).Decode(&email_template)
	if err != nil {
		return shared.BadRequest(err.Error())
	}
	templates := email_template["template"].(string)
	link := email_template["link"].(string)
	password := generatePassword()
	passwordHash, _ := helper.GeneratePasswordHash(password)
	final := strings.ReplaceAll(templates, "{{username}}", Data["email"].(string))
	final = strings.ReplaceAll(final, "{{password}}", password)
	final = strings.ReplaceAll(final, "{{link}}", fmt.Sprintf(link, Data["db_name"].(string)))

	var user = make(map[string]interface{})
	user["_id"] = Data["email"].(string)
	user["email"] = Data["email"].(string)
	user["pwd"] = passwordHash
	user["name"] = Data["name"].(string)
	user["role"] = "admin"
	email, ok := Data["email"].(string)

	if ok == false {
		return shared.BadRequest("check your Email")
	}
	db.Collection("user").InsertOne(ctx, user)
	go helper.SimpleEmailHandler(email, os.Getenv("CLIENT_EMAIL"), "Welcome to Kriyatec", final)

	return nil
}
func generatePassword() string {
	rand.Seed(time.Now().UnixNano())

	// Define the character set for the password
	charSet := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

	// Initialize a variable to store the password
	password := make([]byte, 6)

	// Generate the password
	for i := range password {
		password[i] = charSet[rand.Intn(len(charSet))]
	}
	return string(password)
}
