package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/markormesher/atlas/internal/convert"
	"github.com/markormesher/atlas/internal/db_gen"
	"github.com/markormesher/atlas/internal/schema"
)

func (db *DB) GetPlaces(ctx context.Context) ([]schema.Place, error) {
	res, err := db.queries.GetPlaces(ctx)
	return convert.ConvertSlice(res, err, convertPlaceToCore)
}

func (db *DB) UpsertPlace(ctx context.Context, place schema.Place) error {
	params := db_gen.UpsertPlaceParams{
		ID:      convertUUIDFromCore(place.ID),
		Name:    place.Name,
		Country: place.Country,
		Lat:     place.Lat,
		Lon:     place.Lon,
	}
	return db.queries.UpsertPlace(ctx, params)
}

func (db *DB) DeletePlace(ctx context.Context, id uuid.UUID) error {
	return db.queries.DeletePlace(ctx, convertUUIDFromCore(id))
}
