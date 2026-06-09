package store

import (
	"path/filepath"
	"testing"
)

func TestSeedProductsReplacesLegacyDemoCatalogue(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	db, err := InitDB(filepath.Join(t.TempDir(), "seed.db"))
	if err != nil {
		t.Fatalf("InitDB() error = %v", err)
	}
	defer db.Close()

	for i, slug := range legacySeedSlugs {
		_, err := Exec(db, `
			INSERT INTO products (name, slug, description, price, category, sku)
			VALUES (?, ?, ?, ?, ?, ?)
		`, slug, slug, "legacy demo product", float64(100+i), "shakti", "LEGACY-"+slug)
		if err != nil {
			t.Fatalf("insert legacy product %q: %v", slug, err)
		}
	}

	SeedProducts(db)

	var total int
	if err := QueryRow(db, "SELECT COUNT(*) FROM products").Scan(&total); err != nil {
		t.Fatalf("count products: %v", err)
	}
	if total != len(seedProductRows) {
		t.Fatalf("total products = %d, want %d", total, len(seedProductRows))
	}

	var legacyActive int
	if err := QueryRow(db, "SELECT COUNT(*) FROM products WHERE slug IN ("+placeholders(len(legacySeedSlugs))+") AND is_active = ?", append(anySlice(legacySeedSlugs), true)...).Scan(&legacyActive); err != nil {
		t.Fatalf("count active legacy products: %v", err)
	}
	if legacyActive != 0 {
		t.Fatalf("active legacy products = %d, want 0", legacyActive)
	}

	var seededCount int
	if err := QueryRow(db, "SELECT COUNT(*) FROM products WHERE slug IN ("+placeholders(len(seedProductRows))+")", seedSlugArgs()...).Scan(&seededCount); err != nil {
		t.Fatalf("count seeded products: %v", err)
	}
	if seededCount != len(seedProductRows) {
		t.Fatalf("seeded products = %d, want %d", seededCount, len(seedProductRows))
	}
}
