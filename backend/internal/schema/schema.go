package schema

import "github.com/google/uuid"

type Place struct {
	ID      uuid.UUID
	Name    string
	Country string
	Lat     float64
	Lon     float64
}
