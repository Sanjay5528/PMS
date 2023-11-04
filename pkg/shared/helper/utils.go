package helper

import (
	"fmt"
	"math/rand"
	"reflect"
	"strconv"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	//"go.mongodb.org/mongo-driver/mongo/options"
)

func GetNewInstallCode() string {
	min := 1
	max := 8
	rand.Seed(time.Now().UnixNano())
	fd := rand.Intn(max-min+1) + min
	sd := rand.Intn(max-min+1) + min
	c1 := string(rune(65 + fd))
	c2 := string(rune(65 + fd + sd))
	c5 := string(rune(65 + fd + sd + sd))
	c6 := string(rune(65 + sd + sd))
	return fmt.Sprintf("%s%s%d%d%s%s", c1, c2, fd, sd, c5, c6)
}

func IsValidInstallCode(code string) bool {
	chars := []rune(code)
	d1 := int(chars[2]) - 48
	d2 := int(chars[3]) - 48
	return int(chars[0])+d2 == int(chars[1]) && int(chars[0])+d2+d2 == int(chars[4]) && int(chars[4]) == int(chars[5])+d1
}

func GetNextSeqNumber(orgId string, collectionName string) int32 {

	filter := bson.D{{"_id", collectionName}}
    update := bson.D{{"$inc", bson.D{{"seq", 1}}}}
	result, _ := ExecuteFindAndModifyQuery(orgId, "sequence", filter, update)
    return result["seq"].(int32)
}
func UpdateDateObject(input map[string]interface{}) error {
	for k, v := range input {
		if v == nil {
			continue
		}
		ty := reflect.TypeOf(v).Kind().String()
		if ty == "string" {
			val := reflect.ValueOf(v).String()
			t, err := time.Parse(time.RFC3339, val)
			if err == nil {
				input[k] = t.UTC()
			}
		} else if ty == "map" {
			return UpdateDateObject(v.(map[string]interface{}))
		} else if ty == "slice" {
			for _, e := range v.([]interface{}) {
				if reflect.TypeOf(e).Kind().String() == "map" {
					return UpdateDateObject(e.(map[string]interface{}))
				}
			}
		}
	}
	return nil
}

func Toint64(s string) int64 {
	if s == "" {
		return int64(0)
	}
	v, _ := strconv.ParseInt(s, 10, 64)
	return v
}

func Page(s string) int64 {
	return Toint64(s)
}

func Limit(s string) int64 {
	if s == "" {
		s = GetenvStr("DEFAULT_FETCH_ROWS")
	}
	return Toint64(s)
}

func DocIdFilter(id string) bson.M {
	if id == "" {
		return bson.M{}
	}
	docId, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return bson.M{"_id": id}
	} else {
		return bson.M{"_id": docId}
	}
}
