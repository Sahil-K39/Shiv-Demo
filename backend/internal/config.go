package internal

import (
    "log"
    "os"
    "strings"

    "github.com/kelseyhightower/envconfig"
)

type Config struct {
    AppEnv        string `envconfig:"APP_ENV" default:"development"`
    Port          string `envconfig:"PORT" default:"8080"`
    FrontendURL   string `envconfig:"FRONTEND_URL"`
    BaseURL       string `envconfig:"BASE_URL"`
    JWTSecret     string `envconfig:"JWT_SECRET"`
    CORSOrigin    string `envconfig:"CORS_ORIGIN"`
    DatabaseURL   string `envconfig:"DATABASE_URL"`
    ResendAPIKey  string `envconfig:"RESEND_API_KEY"`
    ResendFrom    string `envconfig:"RESEND_FROM"`
}

func LoadConfig() *Config {
    var cfg Config
    if err := envconfig.Process("", &cfg); err != nil {
        log.Fatalf("Failed to load env config: %v", err)
    }
    // Trim spaces for URLs
    cfg.FrontendURL = strings.TrimSpace(cfg.FrontendURL)
    cfg.BaseURL = strings.TrimSpace(cfg.BaseURL)
    cfg.CORSOrigin = strings.TrimSpace(cfg.CORSOrigin)

    // Validate required fields for production
    if strings.ToLower(cfg.AppEnv) == "production" {
        if cfg.JWTSecret == "" || len(cfg.JWTSecret) < 32 {
            log.Fatal("JWT_SECRET must be set and at least 32 characters in production")
        }
        if cfg.FrontendURL == "" && cfg.BaseURL == "" {
            log.Fatal("FRONTEND_URL or BASE_URL must be set in production")
        }
        if cfg.CORSOrigin == "" {
            log.Fatal("CORS_ORIGIN must be set in production")
        }
        if cfg.DatabaseURL == "" {
            log.Fatal("DATABASE_URL must be set in production")
        }
    }
    return &cfg
}
