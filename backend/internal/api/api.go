package api

import (
	"context"
	"net/http"

	"connectrpc.com/connect"
	"github.com/markormesher/atlas/internal/core"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
	"github.com/markormesher/atlas/internal/gen/atlas/v1/atlasv1connect"
)

type apiServer struct {
	c *core.Core
}

func NewApiServer(c *core.Core) *apiServer {
	return &apiServer{
		c: c,
	}
}

func (s *apiServer) ConfigureMux(mux *http.ServeMux) {
	path, handler := atlasv1connect.NewAtlasServiceHandler(s)
	mux.Handle(path, handler)
}

func (s *apiServer) GetPlaces(ctx context.Context, req *connect.Request[atlasv1.GetPlacesRequest]) (*connect.Response[atlasv1.GetPlacesResponse], error) {
	places, err := s.c.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(&atlasv1.GetPlacesResponse{
		Places: places,
	}), nil
}
