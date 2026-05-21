package store

import (
	"database/sql"
	"log"

	_ "github.com/mattn/go-sqlite3"
)


func InitDB(path string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", path+"?_journal_mode=WAL&_busy_timeout=5000")
	if err != nil {
		return nil, err
	}

	
	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(5)

	
	if err := migrate(db); err != nil {
		return nil, err
	}

	log.Println("✓ Database initialized successfully")
	return db, nil
}


func migrate(db *sql.DB) error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		name TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

	-- Products catalogue
	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		slug TEXT UNIQUE NOT NULL,
		description TEXT,
		price REAL NOT NULL,
		sale_price REAL DEFAULT 0,
		is_on_sale BOOLEAN DEFAULT 0,
		currency TEXT DEFAULT 'USD',
		category TEXT NOT NULL,
		collection TEXT DEFAULT 'SS26',
		sizes TEXT DEFAULT '["XS","S","M","L","XL"]',
		colors TEXT DEFAULT '["Void Black"]',
		images TEXT DEFAULT '[]',
		in_stock BOOLEAN DEFAULT 1,
		featured BOOLEAN DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
	CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

	-- Shopping cart
	CREATE TABLE IF NOT EXISTS cart_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		product_id INTEGER NOT NULL,
		quantity INTEGER DEFAULT 1,
		size TEXT NOT NULL,
		color TEXT DEFAULT '',
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
		FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
		UNIQUE(user_id, product_id, size, color)
	);
	CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

	-- Orders
	CREATE TABLE IF NOT EXISTS orders (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		total_price REAL NOT NULL,
		status TEXT DEFAULT 'pending',
		shipping_name TEXT DEFAULT '',
		shipping_address TEXT DEFAULT '',
		shipping_city TEXT DEFAULT '',
		shipping_state TEXT DEFAULT '',
		shipping_zip TEXT DEFAULT '',
		shipping_country TEXT DEFAULT '',
		shipping_phone TEXT DEFAULT '',
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	-- Order line items
	CREATE TABLE IF NOT EXISTS order_items (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		order_id INTEGER NOT NULL,
		product_id INTEGER NOT NULL,
		name TEXT NOT NULL,
		price REAL NOT NULL,
		quantity INTEGER NOT NULL,
		size TEXT NOT NULL,
		color TEXT DEFAULT '',
		FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
	);

	-- Community posts
	CREATE TABLE IF NOT EXISTS community_posts (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		email TEXT NOT NULL,
		title TEXT NOT NULL,
		body TEXT NOT NULL,
		category TEXT DEFAULT 'GENERAL',
		likes INTEGER DEFAULT 0,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

	-- Post likes (one per user per post)
	CREATE TABLE IF NOT EXISTS post_likes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		post_id INTEGER NOT NULL,
		UNIQUE(user_id, post_id)
	);

	-- NGO Interests
	CREATE TABLE IF NOT EXISTS ngo_interests (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		phone TEXT,
		message TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	_, err := db.Exec(schema)

	// Add new columns for email verification and role management
	db.Exec("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT 0")
	db.Exec("ALTER TABLE users ADD COLUMN verification_token TEXT")
	db.Exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'")

	// Existing product and order alterations
	db.Exec("ALTER TABLE products ADD COLUMN sale_price REAL DEFAULT 0")
	db.Exec("ALTER TABLE products ADD COLUMN is_on_sale BOOLEAN DEFAULT 0")

	
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_name TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_address TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_city TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_state TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_zip TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_country TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN shipping_phone TEXT DEFAULT ''")

	return err
}


// InsertNGOInterest saves a new NGO interest submission.
func InsertNGOInterest(db *sql.DB, name, email, phone, message string) error {
	_, err := db.Exec(`INSERT INTO ngo_interests (name, email, phone, message) VALUES (?, ?, ?, ?)`,
		name, email, phone, message)
	return err
}


func SeedProducts(db *sql.DB) {
	var count int
	db.QueryRow("SELECT COUNT(*) FROM products").Scan(&count)
	if count > 0 {
		return
	}

	products := []struct {
		name, slug, desc, cat string
		price                 float64
		sizes, colors, images string
		featured              bool
	}{
		{
			name:     "Void Walker Trench",
			slug:     "void-walker-trench",
			desc:     "A sculptural trench coat crafted from heavyweight waxed cotton. Asymmetric draping meets military precision in this statement piece of post-apocalyptic armor.",
			cat:      "shakti",
			price:    1450,
			sizes:    `["XS","S","M","L","XL"]`,
			colors:   `["Void Black","Obsidian"]`,
			images:   `["/assets/images/void-walker-trench.jpg"]`,
			featured: true,
		},
		{
			name:     "Asymmetric Drape Dress",
			slug:     "asymmetric-drape-dress",
			desc:     "Fluid jersey construction with deliberate asymmetry. A garment that moves between worlds — ceremonial yet street-ready.",
			cat:      "shakti",
			price:    1180,
			sizes:    `["XS","S","M","L"]`,
			colors:   `["Void Black","Ash"]`,
			images:   `["/assets/images/asymmetric-drape-dress.jpg"]`,
			featured: true,
		},
		{
			name:     "Tactical Survival Suit",
			slug:     "tactical-survival-suit",
			desc:     "Engineered for the end of days. Multi-pocket utility suit with reinforced seams, waterproof zippers, and a silhouette that commands respect.",
			cat:      "shakti",
			price:    1650,
			sizes:    `["S","M","L","XL"]`,
			colors:   `["Void Black","Desert Storm"]`,
			images:   `["/assets/images/tactical-survival-suit.jpg"]`,
			featured: false,
		},
		{
			name:     "Deconstructed Blazer",
			slug:     "deconstructed-blazer",
			desc:     "Traditional tailoring torn apart and rebuilt. Raw-edge seams, exposed lining, and an intentionally unfinished silhouette.",
			cat:      "shiva",
			price:    1320,
			sizes:    `["S","M","L","XL"]`,
			colors:   `["Void Black","Charcoal"]`,
			images:   `["/assets/images/deconstructed-blazer.jpg"]`,
			featured: true,
		},
		{
			name:     "Nomad Cargo Trousers",
			slug:     "nomad-cargo-trousers",
			desc:     "Wide-leg cargo with articulated knee panels and adjustable ankle cuffs. Built for movement through uncertain terrain.",
			cat:      "shiva",
			price:    890,
			sizes:    `["XS","S","M","L","XL"]`,
			colors:   `["Void Black","Stone"]`,
			images:   `["/assets/images/nomad-cargo-trousers.jpg"]`,
			featured: false,
		},
		{
			name:     "Ritual Wrap Coat",
			slug:     "ritual-wrap-coat",
			desc:     "An oversized cocoon silhouette inspired by ceremonial robes. Wool-cashmere blend with obi-style waist tie.",
			cat:      "shiva",
			price:    1780,
			sizes:    `["S","M","L"]`,
			colors:   `["Void Black"]`,
			images:   `["/assets/images/ritual-wrap-coat.jpg"]`,
			featured: true,
		},
	}

	stmt, err := db.Prepare(`
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, category, sizes, colors, images, featured)
		VALUES (?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		log.Printf("Failed to prepare product seed: %v", err)
		return
	}
	defer stmt.Close()

	for _, p := range products {
		_, err := stmt.Exec(p.name, p.slug, p.desc, p.price, p.cat, p.sizes, p.colors, p.images, p.featured)
		if err != nil {
			log.Printf("Failed to seed product %s: %v", p.name, err)
		}
	}

	log.Printf("✓ Seeded %d products into catalogue", len(products))
}
