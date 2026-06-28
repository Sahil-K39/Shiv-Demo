package store

import (
	"encoding/json"
	"path/filepath"
	"strings"
	"testing"
)

func TestFinalProductCatalogueCorrections(t *testing.T) {
	var payload finalProductsPayload
	if err := json.Unmarshal(finalProductsJSON, &payload); err != nil {
		t.Fatalf("unmarshal final product catalogue: %v", err)
	}
	if len(payload.Products) != 46 {
		t.Fatalf("final products = %d, want 46", len(payload.Products))
	}

	productsBySKU := make(map[string]finalProduct, len(payload.Products))
	wantColors := `["Black","Brown","Green","Purple","Maroon"]`
	for _, product := range payload.Products {
		productsBySKU[product.SKU] = product
		if product.Colors != wantColors {
			t.Fatalf("%s colors = %q, want %q", product.SKU, product.Colors, wantColors)
		}
	}

	checks := map[string]struct {
		name  string
		price float64
	}{
		"SS-PHOTO-02": {name: "Obsidian Cutwork Halter Dress", price: 1499},
		"SS-PHOTO-12": {name: "Black Lace Column Kaftan", price: 1749},
		"SS-PHOTO-16": {name: "Black Temple Mini Pants", price: 2349},
		"SS-PHOTO-20": {name: "Handloom Open Kimono", price: 1749},
		"SS-PHOTO-29": {name: "Temple Print Dress", price: 1899},
		"SS-PHOTO-34": {name: "Ivory Minimal Dress", price: 1349},
		"SS-PHOTO-36": {name: "Handloom Resort Dress", price: 1649},
		"SS-PHOTO-38": {name: "Ivory Casual Ritual Kimono", price: 1949},
		"SS-PHOTO-39": {name: "Black Tie Detail Top & Skirt Set", price: 2099},
		"SS-PHOTO-40": {name: "Temple Surface Crop Set", price: 2749},
	}
	for sku, want := range checks {
		product, ok := productsBySKU[sku]
		if !ok {
			t.Fatalf("missing corrected product %s", sku)
		}
		if product.Name != want.name || product.Price != want.price {
			t.Fatalf("%s = %q/%.0f, want %q/%.0f", sku, product.Name, product.Price, want.name, want.price)
		}
		if !strings.HasPrefix(product.Description, want.name+" ") {
			t.Fatalf("%s description does not start with corrected name", sku)
		}
	}
}

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
	`, "Old Final Product", "shiv-shakti-photoroom-style-01", "old row", 100.0, "USD", "shakti", "SS-PHOTO-01"); err != nil {
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
	`, "SS-PHOTO-01").Scan(&currency, &images); err != nil {
		t.Fatalf("select synced product: %v", err)
	}

	if currency != "INR" {
		t.Fatalf("currency = %q, want INR", currency)
	}
	if !strings.Contains(images, ".png") || strings.Contains(images, ".webp") {
		t.Fatalf("images = %q, want PNG-only final product paths", images)
	}
}

func TestSyncFinalProductsRemovesOldFinalCatalogueRows(t *testing.T) {
	t.Setenv("DATABASE_URL", "")

	db, err := InitDB(filepath.Join(t.TempDir(), "old-final-products.db"))
	if err != nil {
		t.Fatalf("InitDB() error = %v", err)
	}
	defer db.Close()

	if _, err := Exec(db, `
		INSERT INTO products (name, slug, description, price, currency, category, sku)
		VALUES (?, ?, ?, ?, ?, ?, ?)
	`, "Retired Final Product", "shiv-shakti-final-style-47", "old row", 100.0, "INR", "shiva", "SS-FINAL-047"); err != nil {
		t.Fatalf("insert retired final product: %v", err)
	}

	if err := SyncFinalProducts(db); err != nil {
		t.Fatalf("SyncFinalProducts() error = %v", err)
	}

	var retiredCount int
	if err := QueryRow(db, "SELECT COUNT(*) FROM products WHERE sku = ?", "SS-FINAL-047").Scan(&retiredCount); err != nil {
		t.Fatalf("count retired final product: %v", err)
	}
	if retiredCount != 0 {
		t.Fatalf("retired final products = %d, want 0", retiredCount)
	}
}
