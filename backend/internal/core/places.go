package core

import (
	"context"

	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
	"github.com/markormesher/atlas/internal/mapper"
)

func (c *Core) GetPlaces(ctx context.Context) ([]*atlasv1.Place, error) {
	places, err := c.Q.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return mapper.Map(places, mapper.DBPlaceToAPI), nil
}
