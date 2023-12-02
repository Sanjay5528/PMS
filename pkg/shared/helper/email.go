package helper

import (
	"context"
	"crypto/tls"

	"github.com/toorop/go-dkim"
	mail "github.com/xhit/go-simple-mail/v2"
	"go.mongodb.org/mongo-driver/bson"

	"kriyatec.com/pms-api/pkg/shared/database"
)

var ServerConfig map[string]EmailServerConfig

func Init(orgId string) EmailServerConfig {
	var config EmailServerConfig
	err := database.SharedDB.Collection("email_config").FindOne(context.Background(), bson.M{"org_id": orgId}).Decode(&config)
	if err != nil {
		println(err)
	}
	return config
}

func SendEmail(orgId string, to []string, cc []string, subject string, htmlBody string) bool {
	config := ServerConfig[orgId]
	if config.Host == "" {
		config = Init(orgId)
	}

	server := mail.NewSMTPClient()
	// SMTP Server
	server.Host = config.Host
	server.Port = config.Port
	server.Username = config.UserName
	server.Password = config.Password
	server.Encryption = mail.EncryptionSTARTTLS
	// serv/er.Encryption = mail.Encryption(mail.AuthNone)

	// Since v2.3.0 you can specified authentication type:
	// - PLAIN (default)
	// - LOGIN
	// - CRAM-MD5
	// - None

	server.Authentication = mail.AuthPlain

	// Variable to keep alive connection
	server.KeepAlive = false

	// Timeout for connect to SMTP Server
	// server.ConnectTimeout = 10 * time.Second

	// Timeout for send the data and wait respond
	// server.SendTimeout = 10 * time.Second

	// Set TLSConfig to provide custom TLS configuration. For example,
	// to skip TLS verification (useful for testing):
	server.TLSConfig = &tls.Config{
		InsecureSkipVerify: true,
	}

	// SMTP client

	smtpClient, err := server.Connect()
	if err != nil {
		println(err.Error())
		return false
	}

	// New email simple html with inline and CC
	email := mail.NewMSG()
	email.SetFrom(config.UserName).
		SetReplyTo(config.UserName).
		AddTo(to...).
		AddCc(cc...).
		SetSubject(subject).
		SetBody(mail.TextHTML, htmlBody)

	// also you can add body from []byte with SetBodyData, example:
	email.SetBodyData(mail.TextHTML, []byte(htmlBody))
	// or alternative part
	email.AddAlternativeData(mail.TextHTML, []byte(htmlBody))

	// add inline
	email.Attach(&mail.File{FilePath: "/path/to/image.png", Name: "Gopher.png", Inline: true})

	// you can add dkim signature to the email.
	// to add dkim, you need a private key already created one.
	// if privateKey != "" {
		options := dkim.NewSigOptions()
		// options.PrivateKey = []byte(privateKey)
		options.Domain = "example.com"
		options.Selector = "default"
		options.SignatureExpireIn = 3600
		options.Headers = []string{"from", "date", "mime-version", "received", "received"}
		options.AddSignatureTimestamp = true
		options.Canonicalization = "relaxed/relaxed"

		email.SetDkim(options)
	// }

	// always check error after send
	if email.Error != nil {
		println(email.Error.Error())
		return false
	}

	// Call Send and pass the client
	err = email.Send(smtpClient)
	if err != nil {
		println(err.Error())
		return false
	} else {
		return true
	}

}
