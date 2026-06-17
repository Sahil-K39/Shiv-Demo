package handlers

import (
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
)

func TestAdminUploadUsesSupabaseStorage(t *testing.T) {
	gin.SetMode(gin.TestMode)

	var storagePath string
	var authorization string
	var apiKey string
	transport := roundTripFunc(func(r *http.Request) (*http.Response, error) {
		storagePath = r.URL.Path
		authorization = r.Header.Get("Authorization")
		apiKey = r.Header.Get("apikey")
		if r.Method != http.MethodPost {
			t.Fatalf("method = %s, want POST", r.Method)
		}
		if r.Header.Get("Content-Type") != "image/png" {
			t.Fatalf("content-type = %q, want image/png", r.Header.Get("Content-Type"))
		}
		return &http.Response{
			StatusCode: http.StatusOK,
			Status:     "200 OK",
			Body:       io.NopCloser(strings.NewReader(`{"Key":"admin-products/test.png"}`)),
			Header:     make(http.Header),
		}, nil
	})

	handler := &AdminUploadHandler{
		supabaseURL:     "https://example.supabase.co",
		supabaseAPIKey:  "service-role-test-key",
		supabaseBucket:  "product-images",
		supabasePrefix:  "admin-products",
		supabaseStorage: true,
		httpClient:      &http.Client{Transport: transport},
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("images", "sample.png")
	if err != nil {
		t.Fatalf("CreateFormFile() error = %v", err)
	}
	if _, err := part.Write(testPNG(t)); err != nil {
		t.Fatalf("write test image: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close() error = %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/admin/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	router := gin.New()
	router.POST("/admin/uploads/images", handler.UploadImages)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusCreated {
		t.Fatalf("status = %d, body = %s", rec.Code, rec.Body.String())
	}
	if authorization != "Bearer service-role-test-key" || apiKey != "service-role-test-key" {
		t.Fatalf("supabase auth headers were not set")
	}
	if !strings.HasPrefix(storagePath, "/storage/v1/object/product-images/admin-products/") {
		t.Fatalf("storage path = %q", storagePath)
	}

	var payload struct {
		Images []string `json:"images"`
		Total  int      `json:"total"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &payload); err != nil {
		t.Fatalf("response JSON: %v", err)
	}
	if payload.Total != 1 || len(payload.Images) != 1 {
		t.Fatalf("payload = %+v", payload)
	}
	if !strings.HasPrefix(payload.Images[0], "https://example.supabase.co/storage/v1/object/public/product-images/admin-products/") {
		t.Fatalf("returned image URL = %q", payload.Images[0])
	}
}

func TestAdminUploadProductionRequiresSupabaseStorage(t *testing.T) {
	gin.SetMode(gin.TestMode)

	t.Setenv("APP_ENV", "production")
	t.Setenv("SUPABASE_URL", "")
	t.Setenv("SUPABASE_SERVICE_ROLE_KEY", "")
	t.Setenv("UPLOAD_DIR", t.TempDir())

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	part, err := writer.CreateFormFile("images", "sample.png")
	if err != nil {
		t.Fatalf("CreateFormFile() error = %v", err)
	}
	if _, err := part.Write(testPNG(t)); err != nil {
		t.Fatalf("write test image: %v", err)
	}
	if err := writer.Close(); err != nil {
		t.Fatalf("writer.Close() error = %v", err)
	}

	req := httptest.NewRequest(http.MethodPost, "/admin/uploads/images", body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()
	router := gin.New()
	router.POST("/admin/uploads/images", NewAdminUploadHandler().UploadImages)
	router.ServeHTTP(rec, req)

	if rec.Code != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500; body = %s", rec.Code, rec.Body.String())
	}
	if entries, err := os.ReadDir(os.Getenv("UPLOAD_DIR")); err == nil && len(entries) > 0 {
		t.Fatalf("local upload directory should stay empty in production fallback failure")
	}
}

type roundTripFunc func(*http.Request) (*http.Response, error)

func (fn roundTripFunc) RoundTrip(req *http.Request) (*http.Response, error) {
	return fn(req)
}

func testPNG(t *testing.T) []byte {
	t.Helper()
	img := image.NewRGBA(image.Rect(0, 0, 2, 2))
	img.Set(0, 0, color.RGBA{R: 255, A: 255})
	img.Set(1, 0, color.RGBA{G: 255, A: 255})
	img.Set(0, 1, color.RGBA{B: 255, A: 255})
	img.Set(1, 1, color.RGBA{R: 255, G: 255, B: 255, A: 255})
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("png.Encode() error = %v", err)
	}
	return buf.Bytes()
}
