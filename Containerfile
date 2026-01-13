FROM docker.io/node:24.12.0-slim@sha256:b83af04d005d8e3716f542469a28ad2947ba382f6b4a76ddca0827a21446a540 AS frontend-builder
WORKDIR /app

RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY ./frontend ./frontend/
RUN cd frontend && pnpm build

# --

FROM docker.io/golang:1.25.5@sha256:0f406d34b7cb7255d0700af02ec28a2c88f1e00701055f4c282aa4c3ec0b3245 AS backend-builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY ./backend/go.mod ./backend/go.sum ./backend/
RUN cd backend && go mod download

COPY ./backend ./backend
RUN cd backend && go build -o ./build/main ./cmd

# --

FROM ghcr.io/markormesher/scratch:v0.4.9@sha256:768793be24576cc7d764a9f0dae447654c7a860be41309de9f2f7855b1af24b7
WORKDIR /app

LABEL image.registry=ghcr.io
LABEL image.name=markormesher/atlas

ENV FRONTEND_DIST_PATH=/app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/build /app/backend/build
COPY ./sql /app/sql

CMD ["/app/backend/build/main"]
