FROM docker.io/node:24.8.0-slim@sha256:cadbfafeb6baf87eaaffa40b3640209c4b7fd38cebde65059d15bc39cd636b85 AS frontend-builder
WORKDIR /app

RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY ./frontend ./frontend/
RUN cd frontend && pnpm build

# --

FROM docker.io/golang:1.25.1@sha256:bb979b278ffb8d31c8b07336fd187ef8fafc8766ebeaece524304483ea137e96 AS backend-builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY ./backend/go.mod ./backend/go.sum ./backend/
RUN cd backend && go mod download

COPY ./backend ./backend
RUN cd backend && go build -o ./build/main ./cmd

# --

FROM ghcr.io/markormesher/scratch:v0.3.0@sha256:8813090ae525a56a8649fd646008af7492d8995edbeb6e1bdaa0c92773d27f8f
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/atlas

ENV FRONTEND_DIST_PATH=/app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/build /app/backend/build
COPY ./sql /app/sql

CMD ["/app/backend/build/main"]
