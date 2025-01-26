package core

import "github.com/google/uuid"

const zeroUUID = "00000000-0000-0000-0000-000000000000"

func uuidIsZero(id uuid.UUID) bool {
	return id.String() == zeroUUID
}
