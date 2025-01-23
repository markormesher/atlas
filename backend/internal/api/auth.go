package api

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"
)

func (s *apiServer) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		// allow-list routes
		path := req.URL.Path
		if path == "/" || path == "/atlas.v1.AtlasService/GetPlaces" || strings.HasPrefix(path, "/assets") {
			next.ServeHTTP(res, req)
			return
		}

		// otherwise, enforce auth...
		fail := func() {
			res.Header().Add("www-authenticate", `Basic realm="atlas"`)
			res.WriteHeader(401)
		}

		authHeader := req.Header.Get("authorization")
		if authHeader == "" {
			fail()
			return
		}

		if !strings.HasPrefix(authHeader, "Basic ") {
			fail()
			return
		}

		authRaw := strings.TrimPrefix(authHeader, "Basic ")
		auth, err := base64.StdEncoding.DecodeString(authRaw)
		if err != nil {
			l.Warn("error parsing basic auth header", "error", err)
			fail()
			return
		}

		expectedAuth := fmt.Sprintf("admin:%s", s.core.Config.AdminPassword)
		if string(auth) != expectedAuth {
			fail()
			return
		}

		next.ServeHTTP(res, req)
	})
}
