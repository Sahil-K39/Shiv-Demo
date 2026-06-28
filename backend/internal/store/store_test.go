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

	names := map[string]string{
		"SS-PHOTO-02": "Obsidian Cutwork Halter Dress",
		"SS-PHOTO-12": "Black Lace Column Kaftan",
		"SS-PHOTO-16": "Black Temple Mini Pants",
		"SS-PHOTO-20": "Handloom Open Kimono",
		"SS-PHOTO-29": "Temple Print Dress",
		"SS-PHOTO-34": "Ivory Minimal Dress",
		"SS-PHOTO-36": "Handloom Resort Dress",
		"SS-PHOTO-38": "Ivory Casual Ritual Kimono",
		"SS-PHOTO-39": "Black Tie Detail Top & Skirt Set",
		"SS-PHOTO-40": "Temple Surface Crop Set",
	}
	for sku, wantName := range names {
		product, ok := productsBySKU[sku]
		if !ok {
			t.Fatalf("missing corrected product %s", sku)
		}
		if product.Name != wantName {
			t.Fatalf("%s name = %q, want %q", sku, product.Name, wantName)
		}
		if !strings.HasPrefix(product.Description, wantName+" ") {
			t.Fatalf("%s description does not start with corrected name", sku)
		}
	}

	wantPrices := map[string]float64{
		"SS-PHOTO-01": 1300,
		"SS-PHOTO-02": 1400,
		"SS-PHOTO-03": 1400,
		"SS-PHOTO-04": 1600,
		"SS-PHOTO-05": 1200,
		"SS-PHOTO-06": 2049,
		"SS-PHOTO-07": 1500,
		"SS-PHOTO-08": 1200,
		"SS-PHOTO-09": 1300,
		"SS-PHOTO-10": 700,
		"SS-PHOTO-11": 1300,
		"SS-PHOTO-12": 1600,
		"SS-PHOTO-13": 1400,
		"SS-PHOTO-14": 700,
		"SS-PHOTO-15": 1400,
		"SS-PHOTO-16": 800,
		"SS-PHOTO-17": 2300,
		"SS-PHOTO-18": 1200,
		"SS-PHOTO-19": 1200,
		"SS-PHOTO-20": 1600,
		"SS-PHOTO-21": 1600,
		"SS-PHOTO-22": 1300,
		"SS-PHOTO-23": 1600,
		"SS-PHOTO-24": 1000,
		"SS-PHOTO-25": 1200,
		"SS-PHOTO-26": 1400,
		"SS-PHOTO-27": 1200,
		"SS-PHOTO-28": 1400,
		"SS-PHOTO-29": 1100,
		"SS-PHOTO-30": 1200,
		"SS-PHOTO-31": 1100,
		"SS-PHOTO-32": 950,
		"SS-PHOTO-33": 1200,
		"SS-PHOTO-34": 1300,
		"SS-PHOTO-35": 1100,
		"SS-PHOTO-36": 1400,
		"SS-PHOTO-37": 1300,
		"SS-PHOTO-38": 850,
		"SS-PHOTO-39": 1300,
		"SS-PHOTO-40": 1300,
		"SS-PHOTO-41": 1200,
		"SS-PHOTO-42": 1300,
		"SS-PHOTO-43": 1100,
		"SS-PHOTO-44": 1400,
		"SS-PHOTO-45": 1500,
		"SS-PHOTO-46": 1400,
	}
	for sku, wantPrice := range wantPrices {
		product, ok := productsBySKU[sku]
		if !ok {
			t.Fatalf("missing priced product %s", sku)
		}
		if product.Price != wantPrice {
			t.Fatalf("%s price = %.0f, want %.0f", sku, product.Price, wantPrice)
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
