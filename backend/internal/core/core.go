package core

import (
	"github.com/markormesher/atlas/internal/config"
	"github.com/markormesher/atlas/internal/database"
)

type Core struct {
	DB     *database.DB
	Config config.Config
}
