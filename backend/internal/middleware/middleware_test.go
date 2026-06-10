package middleware

import (
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"testing"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"

	"github.com/gin-gonic/gin"
)

func TestJWTAuthRejectsUnverifiedUser(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("DATABASE_URL", "")
	db, err := store.InitDB(filepath.Join(t.TempDir(), "middleware.db"))
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer db.Close()

	secret := "test-secret-with-at-least-32-characters"
	service := auth.NewService(secret, db)
	user, _, err := service.Register(&models.RegisterInput{
		Email:    "unverified@example.com",
		Password: "StrongPass123!",
		Name:     "Unverified",
	})
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	token, err := service.GenerateToken(user)
	if err != nil {
		t.Fatalf("GenerateToken failed: %v", err)
	}

	router := gin.New()
	router.GET("/protected", JWTAuth(secret, db), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	req := httptest.NewRequest(http.MethodGet, "/protected", nil)
	req.AddCookie(&http.Cookie{Name: "shiv_session", Value: token})
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)

	if res.Code != http.StatusUnauthorized {
		t.Fatalf("status = %d, want %d", res.Code, http.StatusUnauthorized)
	}
}

func TestAdminOnlyRejectsNormalUserAndAllowsAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)
	t.Setenv("DATABASE_URL", "")
	db, err := store.InitDB(filepath.Join(t.TempDir(), "admin.db"))
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	defer db.Close()

	secret := "test-secret-with-at-least-32-characters"
	service := auth.NewService(secret, db)

	user, tokenValue, err := service.Register(&models.RegisterInput{
		Email:    "normal@example.com",
		Password: "StrongPass123!",
		Name:     "Normal",
	})
	if err != nil {
		t.Fatalf("Register normal user failed: %v", err)
	}
	if _, err := service.VerifyEmail(tokenValue); err != nil {
		t.Fatalf("Verify normal user failed: %v", err)
	}
	normalToken, err := service.GenerateToken(user)
	if err != nil {
		t.Fatalf("Generate normal token failed: %v", err)
	}

	t.Setenv("ADMIN_EMAIL", "admin@example.com")
	t.Setenv("ADMIN_PASSWORD", "StrongPass123!")
	t.Setenv("ADMIN_NAME", "Admin")
	service.EnsureAdminFromEnv()
	adminUser, err := service.Login(&models.LoginInput{Email: "admin@example.com", Password: "StrongPass123!"})
	if err != nil {
		t.Fatalf("Admin login failed: %v", err)
	}
	adminToken, err := service.GenerateToken(adminUser)
	if err != nil {
		t.Fatalf("Generate admin token failed: %v", err)
	}

	router := gin.New()
	router.GET("/admin", JWTAuth(secret, db), AdminOnly(), func(c *gin.Context) {
		c.Status(http.StatusNoContent)
	})

	res := performCookieRequest(router, normalToken)
	if res.Code != http.StatusForbidden {
		t.Fatalf("normal user status = %d, want %d", res.Code, http.StatusForbidden)
	}

	res = performCookieRequest(router, adminToken)
	if res.Code != http.StatusNoContent {
		t.Fatalf("admin status = %d, want %d", res.Code, http.StatusNoContent)
	}
}

func performCookieRequest(router http.Handler, token string) *httptest.ResponseRecorder {
	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req.AddCookie(&http.Cookie{Name: "shiv_session", Value: token})
	res := httptest.NewRecorder()
	router.ServeHTTP(res, req)
	return res
}
