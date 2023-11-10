package database

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"

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

var ctx = context.Background()
var MongoClient *mongo.Client
var DBError error

var DBConnections = make(map[string]*mongo.Database)

// By default create shared db connection
var SharedDB *mongo.Database

func Init() {

	SharedDB = CreateDBConnection(GetenvStr("MONGO_SHAREDDB_HOST"), GetenvInt("MONGO_SHAREDDB_PORT"), GetenvStr("MONGO_SHAREDDB_NAME"), GetenvStr("MONGO_SHAREDDB_USER"), GetenvStr("MONGO_SHAREDDB_PASSWORD"))
}

func GetConnection(orgId string) *mongo.Database {
	if connection, exists := DBConnections[orgId]; exists {
		return connection
	}
	//Connection not exist, so we need to create new connection
	var config ConnObject
	err := SharedDB.Collection("db_config").FindOne(ctx, bson.M{"org_id": orgId}).Decode(&config)

	if err != nil {
		//if there is any problem or specific org config missing, by defualt return shared db
		return SharedDB
	}
	DBConnections[orgId] = CreateDBConnection(config.Host, config.Port, config.DbName, config.UserId, config.Pwd) //

	return DBConnections[orgId]
}

func CreateDBConnection(host string, port int, dbName string, userid string, pwd string) *mongo.Database {
	dbUrl := fmt.Sprintf("mongodb+srv://%s:%s@%s", userid, pwd, host)

	credential := options.Credential{
		Username: userid,
		Password: pwd,
	}

	MongoClient, DBError = mongo.Connect(
		ctx,
		options.Client().ApplyURI(dbUrl).SetAuth(credential),
	)

	if DBError != nil {
		log.Fatal(DBError)
		return nil
	}
	// Check the connection
	if !Ping() {
		return nil
	}
	// fmt.Println(dwbName)
	return MongoClient.Database(dbName)

}

func Ping() bool {
	DBError = MongoClient.Ping(context.TODO(), nil)
	if DBError != nil {
		return false
	}
	return true
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
