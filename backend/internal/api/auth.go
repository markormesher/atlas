package api

import (
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"connectrpc.com/connect"
)

func (s *apiServer) AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		// always clear the auth header in case someone is being sneaky
		req.Header.Del("x-logged-in")

		loggedIn := false
		func() {
			authHeader := req.Header.Get("authorization")
			if authHeader == "" {
				return
			}

			if !strings.HasPrefix(authHeader, "Basic ") {
				return
			}

			authRaw := strings.TrimPrefix(authHeader, "Basic ")
			auth, err := base64.StdEncoding.DecodeString(authRaw)
			if err != nil {
				l.Warn("error parsing basic auth header", "error", err)
				return
			}

			expectedAuth := fmt.Sprintf("admin:%s", s.core.Config.AdminPassword)
			if string(auth) != expectedAuth {
				return
			}

			loggedIn = true
		}()

		if loggedIn {
			req.Header.Add("x-logged-in", "yes")
		}

		next.ServeHTTP(res, req)
	})
}

func (s *apiServer) GetLoggedIn(req connect.AnyRequest) bool {
	return req.Header().Get("x-logged-in") == "yes"
}

func (s *apiServer) LoginHandler() http.Handler {
	return http.HandlerFunc(func(res http.ResponseWriter, req *http.Request) {
		if req.Header.Get("x-logged-in") == "yes" {
			res.Header().Add("location", "/edit")
			res.WriteHeader(302)
		} else {
			res.Header().Add("www-authenticate", `Basic realm="atlas"`)
			res.WriteHeader(401)
		}
	})
}
