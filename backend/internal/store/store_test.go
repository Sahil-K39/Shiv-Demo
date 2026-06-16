package store

import (
	"path/filepath"
	"strings"
	"testing"
)

func TestSeedProductsRemovesRetiredCatalogue(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	db, err := InitDB(filepath.Join(t.TempDir(), "seed.db"))
	if err != nil {
		t.Fatalf("InitDB() error = %v", err)
	}
	defer db.Close()

	retiredSlugs := retiredSeedProductSlugs()
	for i, slug := range retiredSlugs {
		_, err := Exec(db, `
			INSERT INTO products (name, slug, description, price, category, sku)
			VALUES (?, ?, ?, ?, ?, ?)
		`, slug, slug, "retired product", float64(100+i), "shakti", "RETIRED-"+slug)
		if err != nil {
			t.Fatalf("insert retired product %q: %v", slug, err)
		}
	}

	SeedProducts(db)

	var retiredCount int
	if err := QueryRow(db, "SELECT COUNT(*) FROM products WHERE slug IN ("+placeholders(len(retiredSlugs))+")", anySlice(retiredSlugs)...).Scan(&retiredCount); err != nil {
		t.Fatalf("count retired products: %v", err)
	}
	if retiredCount != 0 {
		t.Fatalf("retired products = %d, want 0", retiredCount)
	}
}

func TestSeedProductsHidesReferencedRetiredProducts(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	db, err := InitDB(filepath.Join(t.TempDir(), "referenced.db"))
	if err != nil {
		t.Fatalf("InitDB() error = %v", err)
	}
	defer db.Close()

	slug := retiredSeedProductSlugs()[0]
	if _, err := Exec(db, `
		INSERT INTO users (email, password_hash, name, is_verified)
		VALUES (?, ?, ?, ?)
	`, "buyer@example.com", "hash", "Buyer", true); err != nil {
		t.Fatalf("insert user: %v", err)
	}
	if _, err := Exec(db, `
		INSERT INTO products (name, slug, description, price, category, sku, quantity, in_stock, is_active)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, slug, slug, "referenced retired product", 100.0, "shakti", "RETIRED-REFERENCED", 120, true, true); err != nil {
		t.Fatalf("insert retired product: %v", err)
	}

	var productID int64
	if err := QueryRow(db, "SELECT id FROM products WHERE slug = ?", slug).Scan(&productID); err != nil {
		t.Fatalf("select product id: %v", err)
	}
	if _, err := Exec(db, `
		INSERT INTO cart_items (user_id, product_id, quantity, size, color)
		VALUES (1, ?, 50, ?, ?)
	`, productID, "M", "Void Black"); err != nil {
		t.Fatalf("insert cart item: %v", err)
	}

	SeedProducts(db)

	var isActive bool
	var inStock bool
	var quantity int
	if err := QueryRow(db, `
		SELECT is_active, in_stock, quantity
		FROM products
		WHERE slug = ?
	`, slug).Scan(&isActive, &inStock, &quantity); err != nil {
		t.Fatalf("select retired product: %v", err)
	}
	if isActive || inStock || quantity != 0 {
		t.Fatalf("referenced retired product active=%v inStock=%v quantity=%d, want hidden/out/0", isActive, inStock, quantity)
	}
}

func TestSyncFinalProductsNormalizesCurrencyAndPNGImages(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	db, err := InitDB(filepath.Join(t.TempDir(), "final-products.db"))
	if err != nil {
		t.Fatalf("InitDB() error = %v", err)
	}
	defer db.Close()

	if _, err := Exec(db, `
		INSERT INTO products (name, slug, description, price, currency, category, sku)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, "Old Final Product", "shiv-shakti-final-style-01", "old row", 100.0, "USD", "shakti", "SS-FINAL-001"); err != nil {
		t.Fatalf("insert existing final product: %v", err)
	}

	if err := SyncFinalProducts(db); err != nil {
		t.Fatalf("SyncFinalProducts() error = %v", err)
	}

	var currency string
	var images string
	if err := QueryRow(db, `
		SELECT currency, images
		FROM products
		WHERE sku = ?
	`, "SS-FINAL-001").Scan(&currency, &images); err != nil {
		t.Fatalf("select synced product: %v", err)
	}

	if currency != "INR" {
		t.Fatalf("currency = %q, want INR", currency)
	}
	if !strings.Contains(images, ".png") || strings.Contains(images, ".webp") {
		t.Fatalf("images = %q, want PNG-only final product paths", images)
	}
}
