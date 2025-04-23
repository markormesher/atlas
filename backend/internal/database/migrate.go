package database

import (
	"context"
	"fmt"
	"os"
	"path"
	"slices"
	"strings"

	"github.com/markormesher/atlas/internal/logging"
)

var l = logging.Logger

func (db *DB) Migrate(ctx context.Context, migrationsDir string) error {
	// make sure migration table exists
	_, err := db.conn.Exec(ctx, `CREATE TABLE IF NOT EXISTS __migration (name TEXT NOT NULL);`)
	if err != nil {
		return fmt.Errorf("error creating migration state table: %w", err)
	}

	// get completed migrations
	rows, err := db.conn.Query(ctx, `SELECT name FROM __migration;`)
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

		tx, err := db.conn.Begin(ctx)
		if err != nil {
			return fmt.Errorf("error running migration: %w", err)
		}

		if _, err = db.conn.Exec(ctx, string(sqlBytes)); err != nil {
			rollbackErr := tx.Rollback(ctx)
			if rollbackErr != nil {
				return fmt.Errorf("error running migration: %w; error rolling back: %w", err, rollbackErr)
			}

			return fmt.Errorf("error running migration: %w", err)
		}

		if _, err = db.conn.Exec(ctx, `INSERT INTO __migration VALUES ( $1 );`, name); err != nil {
			rollbackErr := tx.Rollback(ctx)
			if rollbackErr != nil {
				return fmt.Errorf("error running migration: %w; error rolling back: %w", err, rollbackErr)
			}

			return fmt.Errorf("error running migration: %w", err)
		}

		if err = tx.Commit(ctx); err != nil {
			return fmt.Errorf("error committing migration: %w", err)
		}
	}

	return nil
}
