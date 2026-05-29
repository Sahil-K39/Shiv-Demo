package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type AdminUploadHandler struct {
	uploadDir string
	publicDir string
}

func NewAdminUploadHandler() *AdminUploadHandler {
	uploadDir := os.Getenv("UPLOAD_DIR")
	if uploadDir == "" {
		uploadDir = "./assets/uploads"
	}

	publicDir := os.Getenv("UPLOAD_PUBLIC_PATH")
	if publicDir == "" {
		publicDir = "/assets/uploads"
	}

	return &AdminUploadHandler{uploadDir: uploadDir, publicDir: strings.TrimRight(publicDir, "/")}
}

func (h *AdminUploadHandler) UploadImages(c *gin.Context) {
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_upload", "message": "Image files are required."})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		files = form.File["files"]
	}
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing_images", "message": "No image files were uploaded."})
		return
	}

	if err := os.MkdirAll(h.uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "upload_dir_failed"})
		return
	}

	uploaded := make([]string, 0, len(files))
	for _, fileHeader := range files {
		file, err := fileHeader.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file_open_failed"})
			return
		}

		limited := io.LimitReader(file, 10*1024*1024+1)
		bytes, err := io.ReadAll(limited)
		file.Close()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "file_read_failed"})
			return
		}
		if len(bytes) > 10*1024*1024 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "file_too_large", "message": "Each image must be 10MB or smaller."})
			return
		}

		extension, ok := imageExtension(bytes)
		if !ok {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_image", "message": "Only JPEG, PNG, WebP, and GIF images are supported."})
			return
		}

		name, err := uploadFileName(extension)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "file_name_failed"})
			return
		}

		path := filepath.Join(h.uploadDir, name)
		if err := os.WriteFile(path, bytes, 0644); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "file_write_failed"})
			return
		}

		uploaded = append(uploaded, h.publicDir+"/"+name)
	}

	c.JSON(http.StatusCreated, gin.H{
		"images": uploaded,
		"total":  len(uploaded),
	})
}

func uploadFileName(extension string) (string, error) {
	random := make([]byte, 8)
	if _, err := rand.Read(random); err != nil {
		return "", err
	}

	return time.Now().UTC().Format("20060102-150405") + "-" + hex.EncodeToString(random) + extension, nil
}

func imageExtension(bytes []byte) (string, bool) {
	contentType := http.DetectContentType(bytes)
	switch contentType {
	case "image/jpeg":
		return ".jpg", true
	case "image/png":
		return ".png", true
	case "image/webp":
		return ".webp", true
	case "image/gif":
		return ".gif", true
	default:
		return "", false
	}
}
