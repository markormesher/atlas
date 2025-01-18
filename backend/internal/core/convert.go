package core

import (
	"github.com/markormesher/atlas/internal/db"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
)

func convertSlice[F, T any](source []F, f func(F) T) []T {
	if source == nil {
		return nil
	}

	output := make([]T, len(source))
	for i, v := range source {
		output[i] = f(v)
	}

	return output
}

func convertSlicePtr[F, T any](source []F, f func(F) T) []*T {
	if source == nil {
		return nil
	}

	output := make([]*T, len(source))
	for i, v := range source {
		v2 := f(v)
		output[i] = &v2
	}

	return output
}

func convertPlaceDBToAPI(in db.Place) atlasv1.Place {
	return atlasv1.Place{
		Id:      in.ID.String(),
		Name:    in.Name,
		Country: in.Country,
		Lat:     in.Lat,
		Lon:     in.Lon,
	}
}
