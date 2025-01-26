package config

import (
	"fmt"
	"math/rand"
	"os"

	"github.com/markormesher/atlas/internal/logging"
)

var l = logging.Logger

type Config struct {
	PostgresConnectionStr string
	AdminPassword         string
	FrontendDistPath      string
}

func GetConfig() (Config, error) {
	postgresConnectionStr := os.Getenv("POSTGRES_CONNECTION_STRING")
	if postgresConnectionStr == "" {
		return Config{}, fmt.Errorf("postgres connection string not specified")
	}

	adminPassword := os.Getenv("ADMIN_PASSWORD")
	if adminPassword == "" {
		adminPassword = randomPassword()
		l.Warn("admin password not supplied, so an auto-generated value will be used", "password", adminPassword)
	}

	frontendDistPath := os.Getenv("FRONTEND_DIST_PATH")
	if frontendDistPath == "" {
		// take a guess that we're running in dev mode
		frontendDistPath = "../frontend/dist"
	}

	return Config{
		PostgresConnectionStr: postgresConnectionStr,
		AdminPassword:         adminPassword,
		FrontendDistPath:      frontendDistPath,
	}, nil
}

func randomPassword() string {
	letters := "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	b := make([]byte, 20)
	for i := range b {
		b[i] = letters[rand.Intn(len(letters))]
	}
	return string(b)
}
