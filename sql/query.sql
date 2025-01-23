-- name: GetPlaces :many
SELECT * FROM places;

-- name: DeletePlace :exec
DELETE FROM places WHERE id = @id;
