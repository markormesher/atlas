package core

import (
	"context"

	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
)

func (c *Core) GetPlaces(ctx context.Context) ([]*atlasv1.Place, error) {
	places, err := c.Queries.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return convertSlicePtr(places, convertPlaceDBToAPI), nil
}
