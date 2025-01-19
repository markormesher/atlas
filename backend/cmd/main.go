package main

import (
	"context"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/markormesher/atlas/internal/api"
	"github.com/markormesher/atlas/internal/config"
	"github.com/markormesher/atlas/internal/core"
	"github.com/markormesher/atlas/internal/db"
	"github.com/markormesher/atlas/internal/logging"
	"golang.org/x/net/http2"
	"golang.org/x/net/http2/h2c"
)

var l = logging.Logger

func main() {
	// config
	cfg, err := config.GetConfig()
	if err != nil {
		l.Error("failed to load config", "error", err)
		os.Exit(1)
	}

	// db init
	pool, err := pgxpool.New(context.Background(), cfg.PostgresConnectionStr)
	if err != nil {
		l.Error("failed to init database connection pool", "error", err)
		os.Exit(1)
	}
	defer pool.Close()

	l.Info("checking database connectivity")
	err = pool.Ping(context.Background())
	if err != nil {
		l.Error("failed to connect to database", "error", err)
		os.Exit(1)
	}
	l.Info("database connectivity okay")

	l.Info("migrating database")
	err = db.Migrate(context.Background(), pool, "/app/sql/migrations")
	if err != nil {
		l.Error("failed to mirgate database", "error", err)
		os.Exit(1)
	}
	l.Info("database migration completed")

	// core logic
	core := core.Core{
		Q: *db.New(pool),
	}

	// api + front end server
	mux := http.NewServeMux()
	apiServer := api.NewApiServer(&core)
	apiServer.ConfigureMux(mux)
	mux.Handle("/", http.FileServer(http.Dir(cfg.FrontendDistPath)))
	http.ListenAndServe(
		"0.0.0.0:8080",
		h2c.NewHandler(mux, &http2.Server{}),
	)
}
