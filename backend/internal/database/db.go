package database

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/markormesher/atlas/internal/db_gen"
)

type DBConn interface {
	Begin(context.Context) (pgx.Tx, error)
	Exec(context.Context, string, ...interface{}) (pgconn.CommandTag, error)
	Query(context.Context, string, ...interface{}) (pgx.Rows, error)
	QueryRow(context.Context, string, ...interface{}) pgx.Row
}

type DB struct {
	conn    DBConn
	queries db_gen.Queries
}

func New(conn DBConn) *DB {
	return &DB{
		conn:    conn,
		queries: *db_gen.New(conn),
	}
}
