package main

import (
	"context"
	"net/http"
	"os"
	"path"
	"time"

	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/markormesher/atlas/internal/api"
	"github.com/markormesher/atlas/internal/config"
	"github.com/markormesher/atlas/internal/core"
	"github.com/markormesher/atlas/internal/db"
	"github.com/markormesher/atlas/internal/gen/atlas/v1/atlasv1connect"
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
	attemptsLeft := 5
	for {
		err = pool.Ping(context.Background())
		if err != nil {
			l.Error("failed to connect to database", "error", err)
			if attemptsLeft > 0 {
				l.Info("retrying in 2 seconds")
				time.Sleep(time.Duration(2) * time.Second)
			} else {
				os.Exit(1)
			}
		}

		break
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
		Config:  cfg,
		Queries: *db.New(pool),
	}

	// server setup
	mux := mux.NewRouter()
	apiServer := api.NewApiServer(&core)

	// auth middleware
	mux.Use(apiServer.AuthMiddleware)

	// API server
	apiPath, apiHandler := atlasv1connect.NewAtlasServiceHandler(apiServer)
	mux.PathPrefix(apiPath).Handler(apiHandler)

	// SPA frontend
	mux.PathPrefix("/").HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		indexPath := path.Join(cfg.FrontendDistPath, "index.html")
		filePath := path.Join(cfg.FrontendDistPath, r.URL.Path)
		fi, err := os.Stat(filePath)

		if filePath == "/" || os.IsNotExist(err) || fi.IsDir() {
			http.ServeFile(w, r, indexPath)
			return
		}

		if err != nil {
			http.ServeFile(w, r, indexPath)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		http.ServeFile(w, r, filePath)
	})

	http.ListenAndServe(
		"0.0.0.0:8080",
		h2c.NewHandler(mux, &http2.Server{}),
	)
}
