package uuid

import (
	"encoding/hex"
	"fmt"

	guuid "github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func ParseUUID(src string) (pgtype.UUID, error) {
	switch len(src) {
	case 36:
		src = src[0:8] + src[9:13] + src[14:18] + src[19:23] + src[24:]
	case 32:
		// dashes already stripped, assume valid
	default:
		return pgtype.UUID{}, fmt.Errorf("invalid UUID '%v'", src)
	}

	buf, err := hex.DecodeString(src)
	if err != nil {
		return pgtype.UUID{}, err
	}

	dst := [16]byte{}
	copy(dst[:], buf)

	return pgtype.UUID{
		Bytes: dst,
		Valid: true,
	}, nil
}

func IsZero(uuid pgtype.UUID) bool {
	for _, b := range uuid.Bytes {
		if b != 0 {
			return false
		}
	}
	return true
}

func New() pgtype.UUID {
	// this is ugly and is going to go away
	n := guuid.New().String()
	u, _ := ParseUUID(n)
	return u
}
