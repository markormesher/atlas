package core

import (
	"context"

	"github.com/markormesher/atlas/internal/db"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
	"github.com/markormesher/atlas/internal/uuid"
)

func (c *Core) GetPlaces(ctx context.Context) ([]*atlasv1.Place, error) {
	places, err := c.Queries.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return convertSlicePtr(places, convertPlaceDBToAPI), nil
}

func (c *Core) UpdatePlace(ctx context.Context, place *atlasv1.Place) error {
	parsedId, err := uuid.ParseUUID(place.Id)
	if err != nil {
		return err
	}

	if uuid.IsZero(parsedId) {
		parsedId = uuid.New()
	}

	// TODO: validation

	return c.Queries.UpsertPlace(ctx, db.UpsertPlaceParams{
		ID:      parsedId,
		Name:    place.Name,
		Country: place.Country,
		Lat:     place.Lat,
		Lon:     place.Lon,
	})
}

func (c *Core) DeletePlace(ctx context.Context, id string) error {
	uuid, err := uuid.ParseUUID(id)
	if err != nil {
		return err
	}

	return c.Queries.DeletePlace(ctx, uuid)
}
