-- name: GetPlaces :many
SELECT * FROM places;

-- name: UpsertPlace :exec
INSERT INTO places (
  id, name, country, lat, lon
) VALUES (
  @id, @name, @country, @lat, @lon
) ON CONFLICT (id) DO UPDATE SET
  name = @name,
  country = @country,
  lat = @lat,
  lon = @lon
;

-- name: DeletePlace :exec
DELETE FROM places WHERE id = @id;
