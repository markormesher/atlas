package database

import (
	"encoding/hex"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/markormesher/atlas/internal/db_gen"
	"github.com/markormesher/atlas/internal/schema"
)

func convertUUIDToCore(in pgtype.UUID) uuid.UUID {
	return uuid.MustParse(in.String())
}

func convertUUIDFromCore(in uuid.UUID) pgtype.UUID {
	src := in.String()
	src = src[0:8] + src[9:13] + src[14:18] + src[19:23] + src[24:]

	buf, err := hex.DecodeString(src)
	if err != nil {
		panic(fmt.Sprintf("illegal UUID input: '%s'", src))
	}

	dst := [16]byte{}
	copy(dst[:], buf)

	return pgtype.UUID{
		Bytes: dst,
		Valid: true,
	}
}

func convertPlaceToCore(in db_gen.Place) (schema.Place, error) {
	return schema.Place{
		ID:      convertUUIDToCore(in.ID),
		Name:    in.Name,
		Country: in.Country,
		Lat:     in.Lat,
		Lon:     in.Lon,
	}, nil
}
