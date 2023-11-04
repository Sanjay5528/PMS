package database

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ConnObject struct {
	OrgId  string `json:"org_id" bson:"org_id"`
	Host   string `json:"host"`
	Port   int    `json:"port"`
	DbName string `json:"db_name" bson:"db_name"`
	UserId string `json:"user_id" bson:"user_id"`
	Pwd    string `json:"pwd"`
}

var DBConnections = make(map[string]*mongo.Database)

// By default create shared db connection
var SharedDB *mongo.Database

// Loading Pick-up center details
var PCDetails []map[string]interface{}

// Loading SMS-Delivery Status
var Non_Delivery []string

// Loading SMS-Delivery Status Description
var DeliveryStatusDescription = make(map[string]string)

func Init() {
	SharedDB = CreateDBConnection(GetenvStr("MONGO_SHAREDDB_HOST"), GetenvInt("MONGO_SHAREDDB_PORT"), GetenvStr("MONGO_SHAREDDB_NAME"), GetenvStr("MONGO_SHAREDDB_USER"), GetenvStr("MONGO_SHAREDDB_PASSWORD"))
	//Non_Delivery = LoadSendSMSDetails()

}

func GetConnection(orgId string) *mongo.Database {
	//Check whether organization specific connection available or not
	//if available return the same
	if connection, exists := DBConnections[orgId]; exists {
		return connection
	}

	//Connection not exist, so we need to create new connection
	var config ConnObject
	err := SharedDB.Collection("config").FindOne(context.Background(), bson.M{"org_id": orgId}).Decode(&config)

	if err != nil {
		//if there is any problem or specific org config missing, by defualt return shared db
		return SharedDB
	}
	DBConnections[orgId] = CreateDBConnection(config.Host, config.Port, config.DbName, config.UserId, config.Pwd)
	log.Printf("New DB Connection created for %s", orgId)
	//fmt.Println("DBConnections[orgId]")
	return DBConnections[orgId]
}

func CreateDBConnection(host string, port int, dbName string, userid string, pwd string) *mongo.Database {
	//dbUrl := fmt.Sprintf("mongodb://%s:%s@%s:%d/%s?retryWrites=true&authSource=admin&w=majority&authMechanism=SCRAM-SHA-256", userid, pwd, host, port, dbName)
	//dbUrl := fmt.Sprintf("mongodb://%s:%s@%s:%d/%s?retryWrites=true&w=majority&authMechanism=SCRAM-SHA-256", userid, pwd, host, port, dbName)
	dbUrl := fmt.Sprintf("mongodb+srv://%s:%s@%s", userid, pwd, host)

	//fmt.Println(dbUrl)
	// credential := options.Credential{
	// 	AuthMechanism: "SCRAM-SHA-256",
	// 	AuthSource:    "admin",
	// 	Username:      userid,
	// 	Password:      pwd,
	// }
	client, err := mongo.Connect(
		context.Background(),
		options.Client().ApplyURI(dbUrl),
		//.SetAuth(credential),
	)
	if err != nil {
		log.Fatal(err)
		return nil
	}
	// Check the connection
	err = client.Ping(context.TODO(), nil)
	if err != nil {
		log.Printf("DB Ping Error")
		fmt.Println(err)
		log.Fatal(err)
		return nil
	}
	return client.Database(dbName)
}

func LoadSendSMSDetails() []string {
	var NonDelSMS []string
	filter := bson.M{"send_sms": "Yes"}
	database := GetConnection("tpctrz")
	response, err := database.Collection("delivery_status_code").Find(context.Background(), filter)
	if err != nil {
		log.Println("Error : ", err.Error())
	}
	for response.Next(context.Background()) {
		var res map[string]interface{}
		_ = response.Decode(&res)
		NonDelSMS = append(NonDelSMS, res["_id"].(string))
		id := res["_id"].(string)
		DeliveryStatusDescription[id] = res["desc"].(string)
	}
	if len(NonDelSMS) == 0 {
		log.Println("Unable to load SMS Code details. Message service will not work")
	} else {
		log.Println("SMS Code details loaded successfully")
	}
	return NonDelSMS
}

func GetPickupCenterDetails(input string) string {
	var res string
	for _, pcdetails := range PCDetails {
		if pcdetails["_id"].(string) == input {
			res = pcdetails["mobile"].(string)
			return res
		}
	}
	return res
}

func GetSMSDeliverableDetails(status string) bool {
	var isMessageDeliverable bool
	for _, smsDetails := range Non_Delivery {
		if smsDetails == status {
			isMessageDeliverable = true
		}
	}
	return isMessageDeliverable
}

func GetDeliveryStatusDescription(statusId string) string {
	val, ok := DeliveryStatusDescription[statusId]
	// If the key exists
	if ok {
		return val
	}
	return ""
}
