package helper

import (
	"context"
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/log"
	"go.mongodb.org/mongo-driver/bson"
	"kriyatec.com/pms-api/pkg/shared/database"
)

func GetOrg(c *fiber.Ctx) (Organization, bool) {
	orgId := c.Get("OrgId")

	if orgId == "" || orgId == "null" {
		org := GetOrgIdFromDomainName(c.Get("origin"))
		orgId = org.Id
	}

	if orgId == "" {
		return Organization{}, false
	}
	// s := organizations
	fmt.Println(orgId)
	if org, exists := OrgList[orgId]; exists {
		return org, true
	}

	LoadOrgConfig()
	if _, exists := OrgList[orgId]; !exists {
		return Organization{}, false
	}
	return OrgList[orgId], true
}

func GetOrgIdFromDomainName(host string) Organization {
	host = strings.ReplaceAll(host, "www.", "")
	domainParts := strings.Split(host, ".")
	if len(domainParts) < 3 {
		// return nil
	}
	domainName := domainParts[0]
	if strings.Index(domainParts[0], "//") > 0 {
		domainName = strings.Split(domainParts[0], "//")[1]
	}
	ctx := context.Background()
	var org Organization
	database.SharedDB.Collection("organization").FindOne(ctx, bson.M{"url": domainName}).Decode(&org)
	return org
}

func GetOrgIdFromHeader(c *fiber.Ctx) string {
	return c.Get("OrgId")
}

func LoadOrgConfig() {
	ctx := context.Background()
	cur, err := database.SharedDB.Collection("organization").Find(ctx, bson.D{})
	if err != nil {
		log.Errorf("Organization Configuration Error %s", err.Error())
		defer cur.Close(ctx)
		return
	}
	var result []Organization
	if err = cur.All(ctx, &result); err != nil {
		return
	}
	for _, o := range result {
		OrgList[o.Id] = o
	}
}
