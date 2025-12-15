FROM docker.io/node:24.12.0-slim@sha256:04d9cbb7297edb843581b9bb9bbed6d7efb459447d5b6ade8d8ef988e6737804 AS frontend-builder
WORKDIR /app

RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY ./frontend ./frontend/
RUN cd frontend && pnpm build

# --

FROM docker.io/golang:1.25.5@sha256:36b4f45d2874905b9e8573b783292629bcb346d0a70d8d7150b6df545234818f AS backend-builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY ./backend/go.mod ./backend/go.sum ./backend/
RUN cd backend && go mod download

COPY ./backend ./backend
RUN cd backend && go build -o ./build/main ./cmd

# --

FROM ghcr.io/markormesher/scratch:v0.4.8@sha256:08a137ebb7aa6eadbf3982373f282eee52931a772a29f19f7eac313d5d942e4b
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/atlas

ENV FRONTEND_DIST_PATH=/app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/build /app/backend/build
COPY ./sql /app/sql

CMD ["/app/backend/build/main"]
