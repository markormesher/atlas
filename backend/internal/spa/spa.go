package spa

import (
	"net/http"
	"os"
	"path"
)

type SinglePageApp struct {
	ContentBase string
	IndexPage   string
}

func (spa *SinglePageApp) Handler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		indexPath := path.Join(spa.ContentBase, spa.IndexPage)
		filePath := path.Join(spa.ContentBase, r.URL.Path)
		fi, err := os.Stat(filePath)

		if filePath == "/" || os.IsNotExist(err) || fi.IsDir() {
			http.ServeFile(w, r, indexPath)
			return
		}

		if err != nil {
			http.ServeFile(w, r, indexPath)
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		http.ServeFile(w, r, filePath)
	})
}
