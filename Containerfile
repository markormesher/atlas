FROM docker.io/node:23.11.0-slim@sha256:f2cf744a59dcdd05b354754704a527de9fb0c5d8e924b0fc3628dedc23573c39 AS frontend-builder
WORKDIR /app

RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY ./frontend ./frontend/
RUN cd frontend && pnpm build

# --

FROM docker.io/golang:1.24.2@sha256:991aa6a6e4431f2f01e869a812934bd60fbc87fb939e4a1ea54b8494ab9d2fc6 AS backend-builder
WORKDIR /app

COPY ./backend/go.mod ./backend/go.sum ./backend/
RUN cd backend && go mod download

COPY ./backend ./backend
RUN cd backend && go build -o ./build/main ./cmd

# --

FROM gcr.io/distroless/static-debian12
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/atlas

ENV FRONTEND_DIST_PATH=/app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/build /app/backend/build
COPY ./sql /app/sql

CMD ["/app/backend/build/main"]
