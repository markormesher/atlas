package core

import (
	"context"

	"github.com/google/uuid"
	"github.com/markormesher/atlas/internal/schema"
)

func (c *Core) GetPlaces(ctx context.Context) ([]schema.Place, error) {
	places, err := c.DB.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return places, nil
}

func (c *Core) UpdatePlace(ctx context.Context, place schema.Place) error {
	if uuidIsZero(place.ID) {
		place.ID = uuid.New()
	}

	// TODO: validation

	return c.DB.UpsertPlace(ctx, place)
}

func (c *Core) DeletePlace(ctx context.Context, id uuid.UUID) error {
	return c.DB.DeletePlace(ctx, id)
}
