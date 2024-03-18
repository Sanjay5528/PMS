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
					{"as", "data_set"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "screen"},
					{"localField", "field"},
					{"foreignField", "field"},
					{"as", "screen"},
				},
			},
		},
		bson.D{
			{"$lookup",
				bson.D{
					{"from", "menu"},
					{"localField", "field"},
					{"foreignField", "field"},
					{"as", "menu"},
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

func generatePipeline(fieldName string, values []interface{}, fields ...string) bson.A {
	matchStage := bson.D{
		{"$match", bson.D{
			{fieldName, bson.D{{"$in", values}}},
		}},
	}

	groupFields := bson.D{{"_id", primitive.Null{}}}
	for _, field := range fields {
		groupFields = append(groupFields, bson.E{field, bson.D{{"$addToSet", bson.D{{field, "$" + field}}}}})
	}

	groupStage := bson.D{{"$group", groupFields}}

	return bson.A{matchStage, groupStage}
}

func aggregateCollection(ctx context.Context, collectionName string, pipeline bson.A, result interface{}) error {
	cursor, err := database.SharedDB.Collection(collectionName).Aggregate(ctx, pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(ctx)
	return cursor.All(ctx, result)
}

// func PostHandler(c *fiber.Ctx) error {
// 	var data map[string]interface{}
// 	c.BodyParser(&data)
// 	data["_id"] = helper.Generateuniquekey()

// 	ctx := c.Context()

// 	screenPipeline := generatePipeline("_id", data["screen_config"].([]interface{}), "screen_config")
// 	menuPipeline := generatePipeline("_id", data["menu_config"].([]interface{}), "menu_config")
// 	dataSetPipeline := generatePipeline("_id", data["dataset_config"].([]interface{}), "dataset_config")

// 	var screen, menu, dataSet []bson.M
// 	errChan := make(chan error)

// 	go func() {
// 		errChan <- aggregateCollection(ctx, "screen", screenPipeline, &screen)
// 	}()
// 	go func() {
// 		errChan <- aggregateCollection(ctx, "menu", menuPipeline, &menu)
// 	}()
// 	go func() {
// 		errChan <- aggregateCollection(ctx, "data_set", dataSetPipeline, &dataSet)
// 	}()

// 	for i := 0; i < 3; i++ {
// 		if err := <-errChan; err != nil {
// 			return shared.BadRequest("invalid db name")
// 		}
// 	}

// 	return shared.SuccessResponse(c, fiber.Map{
// 		"dataset":     dataSet,
// 		"screen":      screen,
// 		"menu_filter": menu,
// 	})
// }

func PostHandler(c *fiber.Ctx) error {
	var data map[string]interface{}
	c.BodyParser(&data)
	data["_id"] = helper.Generateuniquekey()

	// cur, err := database.SharedDB.Collection("db_config").Aggregate(ctx, db_config_filter)

	// var result []bson.M
	// if err = cur.All(ctx, &result); err != nil {
	// 	return shared.BadRequest("invalid db name")
	// }

	// screen_filter := bson.A{
	// 	bson.D{
	// 		{"$match",
	// 			bson.D{
	// 				{"_id",
	// 					bson.D{
	// 						{"$in",
	// 							bson.A{
	// 								data["screen_config"],
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$group",
	// 			bson.D{
	// 				{"_id", primitive.Null{}},
	// 				{"screen_config",
	// 					bson.D{
	// 						{"$addToSet",
	// 							bson.D{
	// 								{"_id", "$_id"},
	// 								{"type", "$type"},
	// 								{"config", "$config"},
	// 								{"status", "$status"},
	// 								{"name", "$name"},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// }

	screen_filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"_id",
						bson.D{
							{"$in"},
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

	// menu_filter := bson.A{
	// 	bson.D{
	// 		{"$match",
	// 			bson.D{
	// 				{"_id",
	// 					bson.D{
	// 						{"$in",
	// 							bson.A{
	// 								data["menu_config"],
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// 	bson.D{
	// 		{"$group",
	// 			bson.D{
	// 				{"_id", primitive.Null{}},
	// 				{"menu_config",
	// 					bson.D{
	// 						{"$addToSet",
	// 							bson.D{
	// 								{"_id", "$_id"},
	// 								{"type", "$type"},
	// 								{"config", "$config"},
	// 								{"status", "$status"},
	// 								{"name", "$name"},
	// 							},
	// 						},
	// 					},
	// 				},
	// 			},
	// 		},
	// 	},
	// }

	menuConfigRaw := data["menu_config"].([]interface{})
	var bsonMenuConfig bson.A
	for _, menu := range menuConfigRaw {
		if menuStr, ok := menu.(string); ok {
			bsonMenuConfig = append(bsonMenuConfig, menuStr)
		}
	}

	fmt.Println(bsonMenuConfig)

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

	data_set_filter := bson.A{
		bson.D{
			{"$match",
				bson.D{
					{"_id",
						bson.D{
							{"$in",
								bson.A{
									"journal",
									"journal1",
								},
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

	// if c.Params("model_name") == "organization" {
	// 	fmt.Println(data["datamodel_config"])

	// }
	// res, err := database.SharedDB.Collection(c.Params("model_name")).InsertOne(ctx, data)
	// if err != nil {
	// 	if err == mongo.ErrNoDocuments {
	// 		return shared.BadRequest(err.Error())
	// 	}

	// }

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
	return shared.SuccessResponse(c, fiber.Map{
		// "message":     "Insert Successfully",
		"dataset":     data_set,
		"screen":      screen,
		"menu_filter": menu,
	})
}

func RefenceCollectionDum() {

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

// db := database.CreateDb(GetenvStr("MONGO_SHAREDDB_HOST"), GetenvInt("MONGO_SHAREDDB_PORT"), data["db_name"].(string), GetenvStr("MONGO_SHAREDDB_USER"), GetenvStr("MONGO_SHAREDDB_PASSWORD"), "user")
// 	fmt.Println(menu)
// 	res, err := db.Collection("menu").InsertOne(ctx, menu[0])
// 	if err != nil {
// 		return shared.BadRequest(err.Error())
// 	}
// 	fmt.Println(res)
