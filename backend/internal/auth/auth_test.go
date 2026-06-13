package auth

import (
	"path/filepath"
	"testing"

	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"
)

func newTestService(t *testing.T) *Service {
	t.Helper()
	t.Setenv("DATABASE_URL", "")
	db, err := store.InitDB(filepath.Join(t.TempDir(), "auth.db"))
	if err != nil {
		t.Fatalf("InitDB failed: %v", err)
	}
	t.Cleanup(func() { db.Close() })
	return NewService("test-secret-with-at-least-32-characters", db)
}

func TestRegisterVerifyAndLoginFlow(t *testing.T) {
	service := newTestService(t)

	user, verificationToken, err := service.Register(&models.RegisterInput{
		Email:    " Buyer@Example.COM ",
		Password: "StrongPass123!",
		Name:     " Buyer ",
	})
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	if user.Email != "buyer@example.com" {
		t.Fatalf("email was not normalized: %q", user.Email)
	}
	if user.PasswordHash != "" {
		t.Fatal("password hash should not be exposed on registered user response")
	}
	if len(verificationToken) != 64 {
		t.Fatalf("verification token length = %d, want 64", len(verificationToken))
	}

	if _, err := service.Login(&models.LoginInput{Email: "buyer@example.com", Password: "StrongPass123!"}); err == nil {
		t.Fatal("unverified user login succeeded")
	}

	verified, err := service.VerifyEmail(verificationToken)
	if err != nil {
		t.Fatalf("VerifyEmail failed: %v", err)
	}
	if !verified.IsVerified {
		t.Fatal("verified user is not marked verified")
	}

	loggedIn, err := service.Login(&models.LoginInput{Email: "BUYER@example.com", Password: "StrongPass123!"})
	if err != nil {
		t.Fatalf("verified login failed: %v", err)
	}
	if loggedIn.LoginCount != 1 {
		t.Fatalf("login count = %d, want 1", loggedIn.LoginCount)
	}
	if loggedIn.PasswordHash != "" {
		t.Fatal("password hash should not be exposed on login response")
	}
}

func TestRegisterRejectsDuplicateEmail(t *testing.T) {
	service := newTestService(t)
	input := &models.RegisterInput{
		Email:    "dupe@example.com",
		Password: "StrongPass123!",
		Name:     "Dupe",
	}

	if _, _, err := service.Register(input); err != nil {
		t.Fatalf("first register failed: %v", err)
	}
	if _, _, err := service.Register(input); err == nil {
		t.Fatal("duplicate register succeeded")
	}
}

func TestWrongPasswordRejected(t *testing.T) {
	service := newTestService(t)
	_, token, err := service.Register(&models.RegisterInput{
		Email:    "wrong-pass@example.com",
		Password: "StrongPass123!",
		Name:     "Wrong Pass",
	})
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	if _, err := service.VerifyEmail(token); err != nil {
		t.Fatalf("VerifyEmail failed: %v", err)
	}
	if _, err := service.Login(&models.LoginInput{Email: "wrong-pass@example.com", Password: "bad-password"}); err == nil {
		t.Fatal("wrong password login succeeded")
	}
}

func TestEnsureAdminFromEnvUpdatesExistingUserPasswordAndRole(t *testing.T) {
	service := newTestService(t)
	_, token, err := service.Register(&models.RegisterInput{
		Email:    "admin@example.com",
		Password: "OldPass123!",
		Name:     "Old Name",
	})
	if err != nil {
		t.Fatalf("Register failed: %v", err)
	}
	if _, err := service.VerifyEmail(token); err != nil {
		t.Fatalf("VerifyEmail failed: %v", err)
	}

	t.Setenv("ADMIN_EMAIL", "admin@example.com")
	t.Setenv("ADMIN_PASSWORD", "NewAdminPass123!")
	t.Setenv("ADMIN_NAME", "Product Admin")
	service.EnsureAdminFromEnv()

	if _, err := service.Login(&models.LoginInput{Email: "admin@example.com", Password: "OldPass123!"}); err == nil {
		t.Fatal("old admin password still works")
	}

	admin, err := service.Login(&models.LoginInput{Email: "admin@example.com", Password: "NewAdminPass123!"})
	if err != nil {
		t.Fatalf("new admin password login failed: %v", err)
	}
	if admin.Role != "admin" {
		t.Fatalf("role = %q, want admin", admin.Role)
	}
	if !admin.IsVerified {
		t.Fatal("admin user is not verified")
	}
	if admin.Name != "Product Admin" {
		t.Fatalf("name = %q, want Product Admin", admin.Name)
	}
}
