// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.27.0

package db_gen

import (
	"github.com/jackc/pgx/v5/pgtype"
)

type Place struct {
	ID      pgtype.UUID
	Name    string
	Country string
	Lat     float64
	Lon     float64
}
