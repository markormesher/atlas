package api

import (
	"context"

	"connectrpc.com/connect"
	"github.com/google/uuid"
	"github.com/markormesher/atlas/internal/convert"
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
	output, err := convert.ConvertSlicePtr(places, err, convertPlaceFromCore)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return connect.NewResponse(&atlasv1.GetPlacesResponse{
		Places: output,
	}), nil
}

func (s *apiServer) UpdatePlace(ctx context.Context, req *connect.Request[atlasv1.UpdatePlaceRequest]) (*connect.Response[atlasv1.UpdatePlaceResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	place, err := convertPlaceToCore(req.Msg.Place)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}

	err = s.core.UpdatePlace(ctx, place)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return &connect.Response[atlasv1.UpdatePlaceResponse]{}, err
}

func (s *apiServer) DeletePlace(ctx context.Context, req *connect.Request[atlasv1.DeletePlaceRequest]) (*connect.Response[atlasv1.DeletePlaceResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	id, err := uuid.Parse(req.Msg.Id)
	if err != nil {
		return nil, connect.NewError(connect.CodeInvalidArgument, err)
	}

	err = s.core.DeletePlace(ctx, id)
	if err != nil {
		return nil, connect.NewError(connect.CodeInternal, err)
	}

	return &connect.Response[atlasv1.DeletePlaceResponse]{}, err
}

func (s *apiServer) AuthCheck(ctx context.Context, req *connect.Request[atlasv1.AuthCheckRequest]) (*connect.Response[atlasv1.AuthCheckResponse], error) {
	if !s.GetLoggedIn(req) {
		return nil, connect.NewError(connect.CodeUnauthenticated, nil)
	}

	return connect.NewResponse(&atlasv1.AuthCheckResponse{}), nil
}
