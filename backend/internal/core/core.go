package core

import (
	"github.com/markormesher/atlas/internal/config"
	"github.com/markormesher/atlas/internal/db"
)

type Core struct {
	Queries db.Queries
	Config  config.Config
}
