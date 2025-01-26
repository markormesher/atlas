package api

import (
	"github.com/google/uuid"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
	"github.com/markormesher/atlas/internal/schema"
)

func convertPlaceFromCore(in schema.Place) (atlasv1.Place, error) {
	return atlasv1.Place{
		Id:      in.ID.String(),
		Name:    in.Name,
		Country: in.Country,
		Lat:     in.Lat,
		Lon:     in.Lon,
	}, nil
}

func convertPlaceToCore(in *atlasv1.Place) (schema.Place, error) {
	idParsed, err := uuid.Parse(in.Id)
	if err != nil {
		return schema.Place{}, err
	}

	return schema.Place{
		ID:      idParsed,
		Name:    in.Name,
		Country: in.Country,
		Lat:     in.Lat,
		Lon:     in.Lon,
	}, nil
}
