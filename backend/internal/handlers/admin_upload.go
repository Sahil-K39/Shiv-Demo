package handlers

import (
	"bytes"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

type AdminUploadHandler struct {
	uploadDir       string
	publicDir       string
	supabaseURL     string
	supabaseAPIKey  string
	supabaseBucket  string
	supabasePrefix  string
	supabaseStorage bool
	httpClient      *http.Client
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

	supabaseURL := strings.TrimRight(firstSetEnv("SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"), "/")
	supabaseAPIKey := firstSetEnv("SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_STORAGE_KEY")
	if supabaseURL == "" && supabaseAPIKey != "" {
		supabaseURL = "https://bmyghobfovkzchhuhnss.supabase.co"
	}
	supabaseBucket := firstSetEnv("SUPABASE_STORAGE_BUCKET")
	if supabaseBucket == "" {
		supabaseBucket = "product-images"
	}
	supabasePrefix := strings.Trim(firstSetEnv("SUPABASE_STORAGE_PREFIX"), "/")
	if supabasePrefix == "" {
		supabasePrefix = "admin-products"
	}

	return &AdminUploadHandler{
		uploadDir:       uploadDir,
		publicDir:       strings.TrimRight(publicDir, "/"),
		supabaseURL:     supabaseURL,
		supabaseAPIKey:  supabaseAPIKey,
		supabaseBucket:  supabaseBucket,
		supabasePrefix:  supabasePrefix,
		supabaseStorage: supabaseURL != "" && supabaseAPIKey != "",
		httpClient:      &http.Client{Timeout: 30 * time.Second},
	}
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
	if len(files) > 12 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "too_many_files", "message": "Upload up to 12 images at a time."})
		return
	}

	if strings.EqualFold(os.Getenv("APP_ENV"), "production") && !h.supabaseStorage {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "storage_not_configured", "message": "Supabase Storage is required for production uploads."})
		return
	}

	if !h.supabaseStorage {
		if err := os.MkdirAll(h.uploadDir, 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "upload_dir_failed"})
			return
		}
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

		if h.supabaseStorage {
			url, err := h.uploadToSupabaseStorage(name, bytes, http.DetectContentType(bytes))
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "storage_upload_failed", "message": "Could not upload image to storage."})
				return
			}
			uploaded = append(uploaded, url)
		} else {
			path := filepath.Join(h.uploadDir, name)
			if err := os.WriteFile(path, bytes, 0644); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "file_write_failed"})
				return
			}
			uploaded = append(uploaded, h.publicDir+"/"+name)
		}
	}

	c.JSON(http.StatusCreated, gin.H{
		"images": uploaded,
		"total":  len(uploaded),
	})
}

func (h *AdminUploadHandler) uploadToSupabaseStorage(name string, data []byte, contentType string) (string, error) {
	objectPath := strings.Trim(strings.Trim(h.supabasePrefix, "/")+"/"+name, "/")
	uploadURL := fmt.Sprintf("%s/storage/v1/object/%s/%s", h.supabaseURL, h.supabaseBucket, objectPath)

	req, err := http.NewRequest(http.MethodPost, uploadURL, bytes.NewReader(data))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+h.supabaseAPIKey)
	req.Header.Set("apikey", h.supabaseAPIKey)
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Cache-Control", "public, max-age=31536000, immutable")
	req.Header.Set("x-upsert", "false")

	res, err := h.httpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return "", fmt.Errorf("supabase storage returned %s", res.Status)
	}

	return fmt.Sprintf("%s/storage/v1/object/public/%s/%s", h.supabaseURL, h.supabaseBucket, objectPath), nil
}

func uploadFileName(extension string) (string, error) {
	random := make([]byte, 8)
	if _, err := rand.Read(random); err != nil {
		return "", err
	}

	return time.Now().UTC().Format("20060102-150405") + "-" + hex.EncodeToString(random) + extension, nil
}

func firstSetEnv(names ...string) string {
	for _, name := range names {
		value := strings.TrimSpace(os.Getenv(name))
		if value != "" {
			return value
		}
	}
	return ""
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
