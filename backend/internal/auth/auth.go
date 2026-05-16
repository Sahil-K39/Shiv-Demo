

package auth

import (
	"database/sql"
	"errors"
	"time"

	"shiv-shakti/internal/models"

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
		"iat":     time.Now().Unix(),
		"exp":     time.Now().Add(24 * time.Hour).Unix(), 
		"iss":     "shiv-shakti-commerce-engine",
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}



func (s *Service) Register(input *models.RegisterInput) (*models.User, error) {
	
	var exists int
	err := s.db.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", input.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists > 0 {
		return nil, errors.New("email already registered")
	}

	
	hash, err := s.HashPassword(input.Password)
	if err != nil {
		return nil, err
	}

	
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

	
	if err := s.CheckPassword(user.PasswordHash, input.Password); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return &user, nil
}



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
