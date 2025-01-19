package db

import (
	"context"
	"fmt"
	"os"
	"path"
	"slices"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/markormesher/atlas/internal/logging"
)

var l = logging.Logger

type DBConnForMigration interface {
	DBTX
	Begin(ctx context.Context) (pgx.Tx, error)
}

func Migrate(ctx context.Context, db DBConnForMigration, migrationsDir string) error {
	// make sure migration table exists
	_, err := db.Exec(ctx, `CREATE TABLE IF NOT EXISTS __migration (name TEXT NOT NULL);`)
	if err != nil {
		return fmt.Errorf("error creating migration state table: %w", err)
	}

	// get completed migrations
	rows, err := db.Query(ctx, `SELECT name FROM __migration;`)
	if err != nil {
		return fmt.Errorf("error listing completed migrations: %w", err)
	}
	defer rows.Close()

	completed := []string{}
	for rows.Next() {
		var name string
		if err = rows.Scan(&name); err != nil {
			return fmt.Errorf("error listing completed migrations: %w", err)
		}
		completed = append(completed, name)
	}

	// get migration files
	files, err := os.ReadDir(migrationsDir)
	if err != nil {
		return fmt.Errorf("error finding migration files: %w", err)
	}

	pending := []string{}
	for _, file := range files {
		name := file.Name()

		if file.IsDir() || !strings.HasSuffix(name, ".sql") {
			continue
		}

		if slices.Contains(completed, name) {
			l.Debug("skipping migration already completed", "name", name)
			continue
		}

		pending = append(pending, name)
	}

	if len(pending) == 0 {
		l.Info("no pending migrations")
		return nil
	}

	// run each migration
	slices.Sort(pending)
	for _, name := range pending {
		l.Info("running migration", "name", name)

		sqlBytes, err := os.ReadFile(path.Join(migrationsDir, name))
		if err != nil {
			return fmt.Errorf("error reading migration file: %w", err)
		}

		tx, err := db.Begin(ctx)
		if err != nil {
			return fmt.Errorf("error running migration: %w", err)
		}

		if _, err = db.Exec(ctx, string(sqlBytes)); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("error running migration: %w", err)
		}

		if _, err = db.Exec(ctx, `INSERT INTO __migration VALUES ( $1 );`, name); err != nil {
			tx.Rollback(ctx)
			return fmt.Errorf("error running migration: %w", err)
		}

		if err = tx.Commit(ctx); err != nil {
			return fmt.Errorf("error committing migration: %w", err)
		}
	}

	return nil
}
