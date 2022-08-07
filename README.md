![CircleCI](https://img.shields.io/circleci/build/github/markormesher/atlas)

# Atlas

A super-simple tracker of the places you've visited around the world, originally created when [Wolpy](http://wolpy.com/) stopped working. This is designed to be hosted behind a reverse proxy like Nginx or Traefik.

Places can be edited from `.../edit` on your install - the username is `admin` and the password is provided to the container in a file, or auto-generated on start.

:rocket: Jump to [quick-start example](#quick-start-docker-compose-example).

:whale: See releases on [ghcr.io](https://ghcr.io/markormesher/atlas).

## Configuration via Environment Variables

All arguments are required if they do not have a default value listed below.

- `POSTGRES_HOST` - Postgres host
- `POSTGRES_DATABASE` - Postgres database name
- `POSTGRES_USER` - Postgres username
- `POSTGRES_PASSWORD_FILE` - location of a file containing the Postgres password
- `ADMIN_PASSWORD_FILE` - location of a file containing the desired admin password (default: auto-generated password, logged on start up)
- `MAPBOX_TOKEN_FILE` - Mapbox API token for loading map tiles

## Quick-Start Docker-Compose Example

```yaml
version: "3.8"

services:
  atlas:
    image: ghcr.io/markormesher/atlas:VERSION
    depends_on:
      - postgres
    posts:
      - 3000:3000
    secrets:
      - postgres-password
      - admin-password
      - mapbox-token
    environment:
      - POSTGRES_HOST=atlas-postgres
      - POSTGRES_USER=atlas
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres-password
      - POSTGRES_DATABASE=atlas
      - ADMIN_PASSWORD_FILE=/run/secrets/admin-password
      - MAPBOX_TOKEN_FILE=/run/secrets/mapbox-token

  atlas-postgres:
    image: postgres:10.1-alpine
    secrets:
      - postgres-password
    environment:
      - POSTGRES_DATABASE=atlas
      - POSTGRES_USER=atlas
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres-password
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:

secrets:
  postgres-password:
    file: ./secrets/postgres-password.txt
  admin-password:
    file: ./secrets/admin-password.txt
  mapbox-token:
    file: ./secrets/mapbox-token.txt
```
