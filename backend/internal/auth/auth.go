package auth

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"errors"
	"log"
	"os"
	"strings"
	"time"

	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	jwtSecret []byte
	db        *sql.DB
}

func NewService(secret string, db *sql.DB) *Service {
	return &Service{
		jwtSecret: []byte(secret),
		db:        db,
	}
}

func (s *Service) EnsureAdminFromEnv() {
	email := normalizeEmail(os.Getenv("ADMIN_EMAIL"))
	password := os.Getenv("ADMIN_PASSWORD")
	name := os.Getenv("ADMIN_NAME")
	if email == "" || password == "" {
		return
	}
	if name == "" {
		name = "Admin"
	}

	var exists int
	if err := store.QueryRow(s.db, "SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&exists); err != nil {
		log.Printf("Admin bootstrap check failed: %v", err)
		return
	}
	if exists > 0 {
		_, err := store.Exec(s.db, "UPDATE users SET role = ?, is_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE email = ?", "admin", true, email)
		if err != nil {
			log.Printf("Admin bootstrap update failed: %v", err)
		}
		return
	}

	hash, err := s.HashPassword(password)
	if err != nil {
		log.Printf("Admin bootstrap password hash failed: %v", err)
		return
	}
	_, err = store.InsertID(s.db,
		"INSERT INTO users (email, password_hash, name, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
		"INSERT INTO users (email, password_hash, name, role, is_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id",
		email, hash, name, "admin", true, time.Now(), time.Now(),
	)
	if err != nil {
		log.Printf("Admin bootstrap create failed: %v", err)
		return
	}
	log.Printf("✓ Admin user bootstrapped for %s", email)
}

func (s *Service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func (s *Service) CheckPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

func (s *Service) GenerateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"role":    user.Role,
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
		"iss":     "shiv-shakti-commerce-engine",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// Register creates a new user and returns the user object along with a verification token.
func (s *Service) Register(input *models.RegisterInput) (*models.User, string, error) {
	input.Email = normalizeEmail(input.Email)
	input.Name = strings.TrimSpace(input.Name)

	var exists int
	err := store.QueryRow(s.db, "SELECT COUNT(*) FROM users WHERE email = ?", input.Email).Scan(&exists)
	if err != nil {
		return nil, "", err
	}
	if exists > 0 {
		return nil, "", errors.New("email already registered")
	}

	hash, err := s.HashPassword(input.Password)
	if err != nil {
		return nil, "", err
	}

	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return nil, "", err
	}
	verificationToken := hex.EncodeToString(b)

	id, err := store.InsertID(s.db,
		"INSERT INTO users (email, password_hash, name, role, is_verified, verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
		"INSERT INTO users (email, password_hash, name, role, is_verified, verification_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id",
		input.Email, hash, input.Name, "user", false, verificationToken, time.Now(), time.Now(),
	)
	if err != nil {
		return nil, "", err
	}
	user := &models.User{
		ID:        id,
		Email:     input.Email,
		Name:      input.Name,
		Role:      "user",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}
	return user, verificationToken, nil
}

func (s *Service) DeleteUserByID(id int64) error {
	_, err := store.Exec(s.db, "DELETE FROM users WHERE id = ?", id)
	return err
}

// VerifyEmail verifies the token and activates the user account.
func (s *Service) VerifyEmail(token string) (*models.User, error) {
	var user models.User
	var lastLogin sql.NullTime
	err := store.QueryRow(s.db,
		"SELECT id, email, name, role, created_at, updated_at, is_verified, last_login_at, COALESCE(login_count, 0) FROM users WHERE verification_token = ?",
		token,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.IsVerified, &lastLogin, &user.LoginCount)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid verification token")
		}
		return nil, err
	}
	if lastLogin.Valid {
		user.LastLoginAt = &lastLogin.Time
	}
	if user.IsVerified {
		return &user, nil // already verified
	}
	// Mark as verified and clear token
	_, err = store.Exec(s.db, "UPDATE users SET is_verified = ?, verification_token = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?", true, user.ID)
	if err != nil {
		return nil, err
	}
	user.IsVerified = true
	return &user, nil
}

func (s *Service) Login(input *models.LoginInput) (*models.User, error) {
	input.Email = normalizeEmail(input.Email)
	var user models.User
	var lastLogin sql.NullTime
	err := store.QueryRow(s.db,
		"SELECT id, email, password_hash, name, is_verified, role, created_at, updated_at, last_login_at, COALESCE(login_count, 0) FROM users WHERE email = ?",
		input.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.IsVerified, &user.Role, &user.CreatedAt, &user.UpdatedAt, &lastLogin, &user.LoginCount)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	if err := s.CheckPassword(user.PasswordHash, input.Password); err != nil {
		return nil, errors.New("invalid credentials")
	}

	if !user.IsVerified {
		return nil, errors.New("email not verified")
	}

	now := time.Now()
	if _, err := store.Exec(s.db, "UPDATE users SET last_login_at = ?, login_count = COALESCE(login_count, 0) + 1, updated_at = ? WHERE id = ?", now, now, user.ID); err != nil {
		log.Printf("Failed to update login tracking for user %d: %v", user.ID, err)
	} else {
		user.LastLoginAt = &now
		user.LoginCount++
		user.UpdatedAt = now
	}
	if lastLogin.Valid && user.LastLoginAt == nil {
		user.LastLoginAt = &lastLogin.Time
	}
	user.PasswordHash = ""

	return &user, nil
}

func normalizeEmail(email string) string {
	return strings.ToLower(strings.TrimSpace(email))
}

func (s *Service) GetUserByID(id int64) (*models.User, error) {
	var user models.User
	var lastLogin sql.NullTime
	err := store.QueryRow(s.db,
		"SELECT id, email, name, role, created_at, updated_at, is_verified, last_login_at, COALESCE(login_count, 0) FROM users WHERE id = ?", id,
	).Scan(&user.ID, &user.Email, &user.Name, &user.Role, &user.CreatedAt, &user.UpdatedAt, &user.IsVerified, &lastLogin, &user.LoginCount)

	if err != nil {
		return nil, err
	}
	if lastLogin.Valid {
		user.LastLoginAt = &lastLogin.Time
	}
	return &user, nil
}
