/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Authentication Service
 * auth.go — JWT generation, password hashing, user verification
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

package auth

import (
	"database/sql"
	"errors"
	"time"

	"shiv-shakti/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

// Service encapsulates authentication logic with secure defaults.
type Service struct {
	jwtSecret []byte
	db        *sql.DB
}

// NewService creates a new auth service instance.
func NewService(secret string, db *sql.DB) *Service {
	return &Service{
		jwtSecret: []byte(secret),
		db:        db,
	}
}

// ── Password Hashing ────────────────────────────────────────────
// HashPassword generates a bcrypt hash with cost factor 12.
// bcrypt is intentionally slow to resist brute-force attacks.
func (s *Service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

// CheckPassword compares a plaintext password against a bcrypt hash.
// Returns nil if the password matches, error otherwise.
func (s *Service) CheckPassword(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}

// ── JWT Generation ──────────────────────────────────────────────
// GenerateToken creates a signed JWT with user claims and 24-hour expiry.
func (s *Service) GenerateToken(user *models.User) (string, error) {
	claims := jwt.MapClaims{
		"user_id": user.ID,
		"email":   user.Email,
		"name":    user.Name,
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(24 * time.Hour).Unix(), // 24h session
		"iss":     "shiv-shakti-commerce-engine",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}

// ── User Registration ───────────────────────────────────────────
// Register creates a new user account with hashed password.
func (s *Service) Register(input *models.RegisterInput) (*models.User, error) {
	// Check if email already exists
	var exists int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", input.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists > 0 {
		return nil, errors.New("email already registered")
	}

	// Hash the password
	hash, err := s.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	// Insert user into database
	result, err := s.db.Exec(
		"INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
		input.Email, hash, input.Name, time.Now(), time.Now(),
	)
	if err != nil {
		return nil, err
	}

	id, _ := result.LastInsertId()

	return &models.User{
		ID:        id,
		Email:     input.Email,
		Name:      input.Name,
		CreatedAt: time.Now(),
	}, nil
}

// ── User Login ──────────────────────────────────────────────────
// Login verifies credentials and returns the user if valid.
func (s *Service) Login(input *models.LoginInput) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(
		"SELECT id, email, password_hash, name, created_at FROM users WHERE email = ?",
		input.Email,
	).Scan(&user.ID, &user.Email, &user.PasswordHash, &user.Name, &user.CreatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("invalid credentials")
		}
		return nil, err
	}

	// Verify password against stored hash
	if err := s.CheckPassword(user.PasswordHash, input.Password); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}

// ── User Lookup ─────────────────────────────────────────────────
// GetUserByID retrieves a user by their database ID.
func (s *Service) GetUserByID(id int64) (*models.User, error) {
	var user models.User
	err := s.db.QueryRow(
		"SELECT id, email, name, created_at FROM users WHERE id = ?", id,
	).Scan(&user.ID, &user.Email, &user.Name, &user.CreatedAt)

	if err != nil {
		return nil, err
	}
	return &user, nil
}
