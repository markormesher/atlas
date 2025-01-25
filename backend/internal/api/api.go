package api

import (
	"context"

	"connectrpc.com/connect"
	"github.com/markormesher/atlas/internal/core"
	atlasv1 "github.com/markormesher/atlas/internal/gen/atlas/v1"
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

func (s *apiServer) GetPlaces(ctx context.Context, req *connect.Request[atlasv1.GetPlacesRequest]) (*connect.Response[atlasv1.GetPlacesResponse], error) {
	places, err := s.core.GetPlaces(ctx)
	if err != nil {
		return nil, err
	}

	return connect.NewResponse(&atlasv1.GetPlacesResponse{
		Places: places,
	}), nil
}

func (s *apiServer) UpdatePlace(ctx context.Context, req *connect.Request[atlasv1.UpdatePlaceRequest]) (*connect.Response[atlasv1.UpdatePlaceResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	err := s.core.UpdatePlace(ctx, req.Msg.Place)
	return &connect.Response[atlasv1.UpdatePlaceResponse]{}, err
}

func (s *apiServer) DeletePlace(ctx context.Context, req *connect.Request[atlasv1.DeletePlaceRequest]) (*connect.Response[atlasv1.DeletePlaceResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	err := s.core.DeletePlace(ctx, req.Msg.Id)
	return &connect.Response[atlasv1.DeletePlaceResponse]{}, err
}

func (s *apiServer) AuthCheck(ctx context.Context, req *connect.Request[atlasv1.AuthCheckRequest]) (*connect.Response[atlasv1.AuthCheckResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	return connect.NewResponse(&atlasv1.AuthCheckResponse{}), nil
}
