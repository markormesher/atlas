![CircleCI](https://img.shields.io/circleci/build/github/markormesher/atlas)

# Atlas

A super-simple tracker of the places you've visited around the world, originally created when [Wolpy](http://wolpy.com/) stopped working. Places can be edited from `.../edit` on your install - the username is `admin` and the password configuration is described below.

## Configuration via Environment Variables

All arguments are required if they do not have a default value listed below.

- `POSTGRES_CONNECTION_STRING` - Postgres connection string (see example below)
- `ADMIN_PASSWORD` - admin password for editing (default: auto-generated password, logged on start up)

## Quick-Start Example

See [podman-compose.yml](./podman-compose.yml) for a working example.

## Technology Choices

This project sometimes serves as test-bed for technologies I'm considering for other projects, which is why it is somewhat over-engineered. Right now it is being used to test out Vite, SQLC, Protobuf, and others.
