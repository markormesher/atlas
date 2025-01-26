-- create the old table if it doesn't exist, otherwise the migration below will fail on new installs
CREATE TABLE IF NOT EXISTS places (
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL
);

-- create the new schema in a temporary table
CREATE TABLE places_tmp (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL
);

-- migrate old data to the new schema
INSERT INTO places_tmp (
  SELECT
    gen_random_uuid(),
    name,
    country,
    lat,
    lon
  FROM places
);

-- swap tables
DROP TABLE places;
ALTER TABLE places_tmp RENAME TO places;
ALTER INDEX places_tmp_pkey RENAME TO places_pkey;
