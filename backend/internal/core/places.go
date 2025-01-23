package core

import (
	"context"

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

func (c *Core) DeletePlace(ctx context.Context, id string) error {
	uuid, err := uuid.ParseUUID(id)
	if err != nil {
		return err
	}

	return c.Queries.DeletePlace(ctx, uuid)
}
