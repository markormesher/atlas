package mapper

import (
	"github.com/markormesher/atlas/internal/db"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
)

func DBPlaceToAPI(in db.Place) *atlasv1.Place {
	return &atlasv1.Place{
		Id:      in.ID.String(),
		Name:    in.Name,
		Country: in.Country,
		Lat:     in.Lat,
		Lon:     in.Lon,
	}
}
