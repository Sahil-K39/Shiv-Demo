package main

import (
	"log"
	"os"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/store"
)

func main() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./shiv_shakti.db"
	}
	db, err := store.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to open db at %s: %v", dbPath, err)
	}
	defer db.Close()

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "shiv-shakti-dev-secret-change-in-production-2026"
	}

	service := auth.NewService(jwtSecret, db)
	service.EnsureAdminFromEnv()
	log.Printf("✓ reset-admin completed for DB_PATH=%s", dbPath)
}
