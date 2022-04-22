![CircleCI](https://img.shields.io/circleci/build/github/markormesher/atlas)

# Atlas

A super-simple tracker of the places you've visited around the world, originally created when [Wolpy](http://wolpy.com/) stopped working. This is designed to be hosted behind a reverse proxy like Nginx or Traefik.

Places can be edited from `.../edit` on your install - the username is `admin` and the password is provided to the container in a file, or auto-generated on start.

:rocket: Jump to [quick-start example](#quick-start-docker-compose-example).

:whale: See releases on [ghcr.io](https://ghcr.io/markormesher/atlas).

## Configuration via Environment Variables

All arguments are required if they do not have a default value listed below.

- `ADMIN_PASSWORD_FILE` - location of a file containing the desired admin password (default: auto-generated password, logged on start up)
- `GOOGLE_API_KEY_FILE` - Google API key for loading map tiles
- `POSTGRES_HOST` - Postgres host
- `POSTGRES_DATABASE` - Postgres database name
- `POSTGRES_USER` - Postgres username
- `POSTGRES_PASSWORD_FILE` - location of a file containing the Postgres password

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
      - admin-password
      - google-api-key
      - postgres-password
    environment:
      - ADMIN_PASSWORD_FILE=/run/secrets/admin-password
      - GOOGLE_API_KEY_FILE=/run/secrets/google-api-key
      - POSTGRES_HOST=atlas-postgres
      - POSTGRES_USER=atlas
      - POSTGRES_PASSWORD_FILE=/run/secrets/postgres-password
      - POSTGRES_DATABASE=atlas

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
  admin-password:
    file: ./secrets/admin-password.txt
  google-api-key:
    file: ./secrets/google-api-key.txt
  postgres-password:
    file: ./secrets/postgres-password.txt
```
