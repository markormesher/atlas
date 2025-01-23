package api

import (
	"context"
	"net/http"

	"connectrpc.com/connect"
	"github.com/markormesher/atlas/internal/core"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
	"github.com/markormesher/atlas/internal/gen/atlas/v1/atlasv1connect"
	"github.com/markormesher/atlas/internal/logging"
)

var l = logging.Logger

type apiServer struct {
	core *core.Core
}

func NewApiServer(core *core.Core) *apiServer {
	return &apiServer{
		core: core,
	}
}

func (s *apiServer) ConfigureMux(mux *http.ServeMux) {
	path, handler := atlasv1connect.NewAtlasServiceHandler(s)
	mux.Handle(path, handler)
}

func (s *apiServer) GetPlaces(ctx context.Context, req *connect.Request[atlasv1.GetPlacesRequest]) (*connect.Response[atlasv1.GetPlacesResponse], error) {
	places, err := s.core.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(&atlasv1.GetPlacesResponse{
		Places: places,
	}), nil
}

func (s *apiServer) SavePlace(ctx context.Context, req *connect.Request[atlasv1.SavePlaceRequest]) (*connect.Response[atlasv1.SavePlaceResponse], error) {
	return nil, nil
}

func (s *apiServer) DeletePlace(ctx context.Context, req *connect.Request[atlasv1.DeletePlaceRequest]) (*connect.Response[atlasv1.DeletePlaceResponse], error) {
	err := s.core.DeletePlace(ctx, req.Msg.Id)
	return &connect.Response[atlasv1.DeletePlaceResponse]{}, err
}

func (s *apiServer) AuthCheck(ctx context.Context, req *connect.Request[atlasv1.AuthCheckRequest]) (*connect.Response[atlasv1.AuthCheckResponse], error) {
	return connect.NewResponse(&atlasv1.AuthCheckResponse{}), nil
}
