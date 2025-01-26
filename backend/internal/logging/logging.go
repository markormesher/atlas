package logging

import (
	"log/slog"
	"os"
)

var jsonHandler = slog.NewJSONHandler(os.Stdout, nil)
var Logger = slog.New(jsonHandler)
