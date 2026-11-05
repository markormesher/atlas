FROM docker.io/node:26.13.0-slim@sha256:5adad64f9a1fca2d51972caa65983634c8a774eb300d72b20f7f2a0f60368072 AS frontend-builder
WORKDIR /app

RUN npm install -g corepack
RUN corepack enable

COPY ./frontend/package.json ./frontend/pnpm-lock.yaml ./frontend/pnpm-workspace.yaml ./frontend/
RUN cd frontend && pnpm install --frozen-lockfile

COPY ./frontend ./frontend/
RUN cd frontend && pnpm build

# --

FROM docker.io/golang:1.27.3@sha256:c292963ad0e5f51e843c726edc204a4e4c26a859ba1e4d736d91028aa3633048 AS backend-builder
WORKDIR /app

ARG CGO_ENABLED=0

COPY ./backend/go.mod ./backend/go.sum ./backend/
RUN cd backend && go mod download

COPY ./backend ./backend
RUN cd backend && go build -o ./build/main ./cmd

# --

FROM ghcr.io/markormesher/scratch:v0.4.31@sha256:0314cadaeca5c96786917b815eba969fbf054ffd0e0493ca00c1acd60b003f1b
WORKDIR /app

ENV FRONTEND_DIST_PATH=/app/frontend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY --from=backend-builder /app/backend/build /app/backend/build
COPY ./sql /app/sql

CMD ["/app/backend/build/main"]

LABEL image.name=markormesher/atlas
LABEL image.registry=ghcr.io
LABEL org.opencontainers.image.description=""
LABEL org.opencontainers.image.documentation=""
LABEL org.opencontainers.image.title="atlas"
LABEL org.opencontainers.image.url=""
LABEL org.opencontainers.image.vendor=""
LABEL org.opencontainers.image.version=""
