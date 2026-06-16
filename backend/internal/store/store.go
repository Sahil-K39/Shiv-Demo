package store

import (
	"database/sql"
	"log"
	"os"
	"strconv"
	"strings"

	_ "github.com/jackc/pgx/v5/stdlib"
	_ "github.com/mattn/go-sqlite3"
)

var activeDriver = "sqlite3"

func InitDB(path string) (*sql.DB, error) {
	databaseURL := os.Getenv("DATABASE_URL")
	var db *sql.DB
	var err error

	if databaseURL != "" {
		activeDriver = "pgx"
		db, err = sql.Open(activeDriver, databaseURL)
	} else {
		activeDriver = "sqlite3"
		db, err = sql.Open(activeDriver, path+"?_journal_mode=WAL&_busy_timeout=5000&_foreign_keys=on")
	}
	if err != nil {
		return nil, err
	}

	if IsPostgres() {
		db.SetMaxOpenConns(25)
		db.SetMaxIdleConns(5)
	} else {
		db.SetMaxOpenConns(1)
		db.SetMaxIdleConns(1)
	}

	if IsPostgres() {
		if err := db.Ping(); err != nil {
			return nil, err
		}
	}

	if err := migrate(db); err != nil {
		return nil, err
	}

	if IsPostgres() {
		log.Println("✓ PostgreSQL database initialized successfully")
	} else {
		log.Println("✓ SQLite database initialized successfully")
	}
	return db, nil
}

func IsPostgres() bool {
	return activeDriver == "pgx"
}

func Rebind(query string) string {
	if !IsPostgres() {
		return query
	}

	var builder strings.Builder
	arg := 1
	for _, char := range query {
		if char == '?' {
			builder.WriteString("$")
			builder.WriteString(strconv.Itoa(arg))
			arg++
			continue
		}
		builder.WriteRune(char)
	}
	return builder.String()
}

func Exec(db *sql.DB, query string, args ...any) (sql.Result, error) {
	return db.Exec(Rebind(query), args...)
}

func Query(db *sql.DB, query string, args ...any) (*sql.Rows, error) {
	return db.Query(Rebind(query), args...)
}

func QueryRow(db *sql.DB, query string, args ...any) *sql.Row {
	return db.QueryRow(Rebind(query), args...)
}

func TxExec(tx *sql.Tx, query string, args ...any) (sql.Result, error) {
	return tx.Exec(Rebind(query), args...)
}

func InsertID(db *sql.DB, sqliteQuery string, postgresQuery string, args ...any) (int64, error) {
	if IsPostgres() {
		var id int64
		err := db.QueryRow(Rebind(postgresQuery), args...).Scan(&id)
		return id, err
	}

	result, err := db.Exec(sqliteQuery, args...)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func TxInsertID(tx *sql.Tx, sqliteQuery string, postgresQuery string, args ...any) (int64, error) {
	if IsPostgres() {
		var id int64
		err := tx.QueryRow(Rebind(postgresQuery), args...).Scan(&id)
		return id, err
	}

	result, err := tx.Exec(sqliteQuery, args...)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

func migrate(db *sql.DB) error {
	if IsPostgres() {
		return migratePostgres(db)
	}
	return migrateSQLite(db)
}

func migrateSQLite(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		name TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		is_verified BOOLEAN DEFAULT 0,
		verification_token TEXT,
		role TEXT DEFAULT 'user',
		last_login_at DATETIME,
		login_count INTEGER DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

	CREATE TABLE IF NOT EXISTS products (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		slug TEXT UNIQUE NOT NULL,
		description TEXT,
		price REAL NOT NULL,
		sale_price REAL DEFAULT 0,
		is_on_sale BOOLEAN DEFAULT 0,
		currency TEXT DEFAULT 'INR',
		category TEXT NOT NULL,
		collection TEXT DEFAULT 'SS26',
		sizes TEXT DEFAULT '["XS","S","M","L","XL"]',
		colors TEXT DEFAULT '["Void Black"]',
		images TEXT DEFAULT '[]',
		in_stock BOOLEAN DEFAULT 1,
		featured BOOLEAN DEFAULT 0,
		quantity INTEGER DEFAULT 0,
		sku TEXT UNIQUE DEFAULT '',
		is_featured BOOLEAN DEFAULT 0,
		is_active BOOLEAN DEFAULT 1,
		sale_active BOOLEAN DEFAULT 0,
		sale_start_date DATETIME,
		sale_end_date DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
	CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

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
		payment_reference TEXT DEFAULT '',
		payment_confirmed_at DATETIME,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
	);

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

	CREATE TABLE IF NOT EXISTS post_likes (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		user_id INTEGER NOT NULL,
		post_id INTEGER NOT NULL,
		UNIQUE(user_id, post_id)
	);

	CREATE TABLE IF NOT EXISTS ngo_interests (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		phone TEXT,
		message TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);
	`

	if _, err := db.Exec(schema); err != nil {
		return err
	}
	for _, column := range []struct {
		table string
		name  string
		ddl   string
	}{
		{"users", "is_verified", "BOOLEAN DEFAULT 0"},
		{"users", "verification_token", "TEXT"},
		{"users", "role", "TEXT DEFAULT 'user'"},
		{"users", "last_login_at", "DATETIME"},
		{"users", "login_count", "INTEGER DEFAULT 0"},
		{"products", "sale_price", "REAL DEFAULT 0"},
		{"products", "is_on_sale", "BOOLEAN DEFAULT 0"},
		{"products", "currency", "TEXT DEFAULT 'INR'"},
		{"products", "quantity", "INTEGER DEFAULT 0"},
		{"products", "sku", "TEXT DEFAULT ''"},
		{"products", "is_featured", "BOOLEAN DEFAULT 0"},
		{"products", "is_active", "BOOLEAN DEFAULT 1"},
		{"products", "sale_active", "BOOLEAN DEFAULT 0"},
		{"products", "sale_start_date", "DATETIME"},
		{"products", "sale_end_date", "DATETIME"},
		{"products", "updated_at", "DATETIME"},
		{"orders", "shipping_name", "TEXT DEFAULT ''"},
		{"orders", "shipping_address", "TEXT DEFAULT ''"},
		{"orders", "shipping_city", "TEXT DEFAULT ''"},
		{"orders", "shipping_state", "TEXT DEFAULT ''"},
		{"orders", "shipping_zip", "TEXT DEFAULT ''"},
		{"orders", "shipping_country", "TEXT DEFAULT ''"},
		{"orders", "shipping_phone", "TEXT DEFAULT ''"},
		{"orders", "payment_reference", "TEXT DEFAULT ''"},
		{"orders", "payment_confirmed_at", "DATETIME"},
		{"orders", "updated_at", "DATETIME"},
	} {
		if err := ensureSQLiteColumn(db, column.table, column.name, column.ddl); err != nil {
			return err
		}
	}
	db.Exec("UPDATE products SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)")
	db.Exec("UPDATE orders SET updated_at = COALESCE(updated_at, created_at, CURRENT_TIMESTAMP)")
	normalizeProductCurrency(db)
	if _, err := db.Exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_not_empty ON products(sku) WHERE sku <> ''"); err != nil {
		log.Printf("Could not create unique SKU index: %v", err)
	}
	return nil
}

func ensureSQLiteColumn(db *sql.DB, table string, column string, ddl string) error {
	rows, err := db.Query("PRAGMA table_info(" + table + ")")
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var cid int
		var name string
		var dataType string
		var notNull int
		var defaultValue any
		var pk int
		if err := rows.Scan(&cid, &name, &dataType, &notNull, &defaultValue, &pk); err != nil {
			return err
		}
		if name == column {
			return nil
		}
	}
	if err := rows.Err(); err != nil {
		return err
	}
	_, err = db.Exec("ALTER TABLE " + table + " ADD COLUMN " + column + " " + ddl)
	return err
}

func migratePostgres(db *sql.DB) error {
	schema := `
	CREATE TABLE IF NOT EXISTS users (
		id BIGSERIAL PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		name TEXT NOT NULL,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW(),
		is_verified BOOLEAN DEFAULT FALSE,
		verification_token TEXT,
		role TEXT DEFAULT 'user',
		last_login_at TIMESTAMPTZ,
		login_count INTEGER DEFAULT 0
	);
	CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

	CREATE TABLE IF NOT EXISTS products (
		id BIGSERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		slug TEXT UNIQUE NOT NULL,
		description TEXT,
		price DOUBLE PRECISION NOT NULL,
		sale_price DOUBLE PRECISION DEFAULT 0,
		is_on_sale BOOLEAN DEFAULT FALSE,
		currency TEXT DEFAULT 'INR',
		category TEXT NOT NULL,
		collection TEXT DEFAULT 'SS26',
		sizes TEXT DEFAULT '["XS","S","M","L","XL"]',
		colors TEXT DEFAULT '["Void Black"]',
		images TEXT DEFAULT '[]',
		in_stock BOOLEAN DEFAULT TRUE,
		featured BOOLEAN DEFAULT FALSE,
		quantity INTEGER DEFAULT 0,
		sku TEXT UNIQUE DEFAULT '',
		is_featured BOOLEAN DEFAULT FALSE,
		is_active BOOLEAN DEFAULT TRUE,
		sale_active BOOLEAN DEFAULT FALSE,
		sale_start_date TIMESTAMPTZ,
		sale_end_date TIMESTAMPTZ,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);
	CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
	CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);

	CREATE TABLE IF NOT EXISTS cart_items (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
		quantity INTEGER DEFAULT 1,
		size TEXT NOT NULL,
		color TEXT DEFAULT '',
		UNIQUE(user_id, product_id, size, color)
	);
	CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);

	CREATE TABLE IF NOT EXISTS orders (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		total_price DOUBLE PRECISION NOT NULL,
		status TEXT DEFAULT 'pending',
		shipping_name TEXT DEFAULT '',
		shipping_address TEXT DEFAULT '',
		shipping_city TEXT DEFAULT '',
		shipping_state TEXT DEFAULT '',
		shipping_zip TEXT DEFAULT '',
		shipping_country TEXT DEFAULT '',
		shipping_phone TEXT DEFAULT '',
		payment_reference TEXT DEFAULT '',
		payment_confirmed_at TIMESTAMPTZ,
		created_at TIMESTAMPTZ DEFAULT NOW(),
		updated_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS order_items (
		id BIGSERIAL PRIMARY KEY,
		order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
		product_id BIGINT NOT NULL,
		name TEXT NOT NULL,
		price DOUBLE PRECISION NOT NULL,
		quantity INTEGER NOT NULL,
		size TEXT NOT NULL,
		color TEXT DEFAULT ''
	);

	CREATE TABLE IF NOT EXISTS community_posts (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
		email TEXT NOT NULL,
		title TEXT NOT NULL,
		body TEXT NOT NULL,
		category TEXT DEFAULT 'GENERAL',
		likes INTEGER DEFAULT 0,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);

	CREATE TABLE IF NOT EXISTS post_likes (
		id BIGSERIAL PRIMARY KEY,
		user_id BIGINT NOT NULL,
		post_id BIGINT NOT NULL,
		UNIQUE(user_id, post_id)
	);

	CREATE TABLE IF NOT EXISTS ngo_interests (
		id BIGSERIAL PRIMARY KEY,
		name TEXT NOT NULL,
		email TEXT NOT NULL,
		phone TEXT,
		message TEXT,
		created_at TIMESTAMPTZ DEFAULT NOW()
	);
	`
	_, err := db.Exec(schema)
	db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ")
	db.Exec("ALTER TABLE users ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 0")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR'")
	db.Exec("ALTER TABLE products ALTER COLUMN currency SET DEFAULT 'INR'")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT ''")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_active BOOLEAN DEFAULT FALSE")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_start_date TIMESTAMPTZ")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS sale_end_date TIMESTAMPTZ")
	db.Exec("ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()")
	db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT DEFAULT ''")
	db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_confirmed_at TIMESTAMPTZ")
	db.Exec("ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()")
	db.Exec("UPDATE orders SET updated_at = COALESCE(updated_at, created_at, NOW())")
	normalizeProductCurrency(db)
	return err
}

func normalizeProductCurrency(db *sql.DB) {
	if _, err := Exec(db, "UPDATE products SET currency = ? WHERE currency IS NULL OR currency = '' OR currency = 'USD'", "INR"); err != nil {
		log.Printf("Could not normalize product currency: %v", err)
	}
}

func InsertNGOInterest(db *sql.DB, name, email, phone, message string) error {
	_, err := Exec(db, `INSERT INTO ngo_interests (name, email, phone, message) VALUES (?, ?, ?, ?)`,
		name, email, phone, message)
	return err
}

var seedProductRows = []struct {
	name     string
	category string
	price    float64
	images   []string
}{
	{"Ivory Ruin Dress", "shakti", 1216.06, []string{"1-153A0953.jpg", "2-153A0956.jpg", "3-153A0960.jpg", "4-153A0965.jpg", "5-153A0979.jpg", "6-153A0981.jpg"}},
	{"Ivory Backless Kaftan", "shakti", 908.49, []string{"15-153A1040.jpg", "16-153A1042.jpg", "17-153A1043.jpg", "18-153A1044.jpg"}},
	{"Saffron Pleated Dress", "shakti", 2068.23, []string{"19-153A1072.jpg", "20-153A1078.jpg", "21-153A1081.jpg", "22-153A1083.jpg", "23-153A1086.jpg", "24-153A1089.jpg"}},
	{"Tribal Print Slip Dress", "shakti", 885.64, []string{"25-153A1093.jpg", "26-153A1094.jpg", "27-153A1095.jpg"}},
	{"Ivory Panel Dress", "shakti", 930.28, []string{"28-153A1128.jpg", "29-153A1130.jpg", "30-153A1137.jpg", "31-153A1139.jpg"}},
	{"Grey Poncho Dress", "shakti", 836.11, []string{"82-153A0139.jpg", "83-153A0159.jpg", "84-153A0163.jpg", "85-153A0164.jpg", "86-153A0165.jpg"}},
	{"Ivory Flow Dress", "shakti", 1408.38, []string{"87-153A0173.jpg", "88-153A0176.jpg", "89-153A0179.jpg", "90-153A0180.jpg", "91-153A0181.jpg"}},
	{"White Long Overlay", "shakti", 1212.14, []string{"92-153A0185.jpg", "93-153A0191.jpg", "94-153A0192.jpg"}},
	{"Stone Kimono Overlay", "shakti", 1000.59, []string{"95-153A0198.jpg", "96-153A0200.jpg", "97-153A0201.jpg", "98-153A0204.jpg", "99-153A0217.jpg", "100-153A0218.jpg", "101-153A0219.jpg", "102-153A0220.jpg"}},
	{"Night Print Slip Dress", "shakti", 917.47, []string{"103-153A0223.jpg", "104-153A0225.jpg", "105-153A0227.jpg"}},
	{"Taupe Backless Dress", "shakti", 1323.60, []string{"106-153A0247.jpg", "107-153A0248.jpg", "108-153A0255.jpg", "109-153A0262.jpg", "110-153A0263.jpg"}},
	{"Rust Hooded Coat", "shakti", 1710.32, []string{"111-153A0276.jpg", "112-153A0280.jpg", "113-153A0282.jpg", "114-153A0284.jpg"}},
	{"Ivory Hooded Wrap Coat", "shakti", 1569.08, []string{"116-153A0306.jpg", "117-153A0315.jpg", "118-153A0319.jpg", "119-153A0325.jpg"}},
	{"Sand Drape Dress", "shakti", 1427.26, []string{"120-153A0334.jpg", "121-153A0335.jpg", "122-153A0338.jpg", "123-153A0339.jpg", "124-153A0346.jpg", "125-153A0351.jpg"}},
	{"Black Drape Dress", "shiva", 904.96, []string{"32-153A9973.jpg", "33-153A9976.jpg", "34-153A9986.jpg", "35-153A9988.jpg"}},
	{"Black Sheer Skirt Set", "shiva", 601.08, []string{"36-153A9990.jpg", "37-153A9994.jpg", "38-153A9996.jpg", "39-153A9999.jpg", "40-153A0003.jpg"}},
	{"Black Gold Mini Dress", "shiva", 1010.94, []string{"41-153A0011.jpg", "42-153A0014.jpg", "43-153A0017.jpg", "44-153A0021.jpg", "45-153A0024.jpg"}},
	{"Black Hooded Robe", "shiva", 567.66, []string{"46-153A0030.jpg", "47-153A0032.jpg", "48-153A0033.jpg", "49-153A0037.jpg", "50-153A0039.jpg"}},
	{"Silver Hooded Vest", "shiva", 1354.31, []string{"51-153A0043.jpg", "52-153A0046.jpg", "53-153A0049.jpg"}},
	{"Black Line Dress", "shiva", 1199.52, []string{"54-153A0053.jpg", "55-153A0055.jpg", "56-153A0058.jpg", "57-153A0061.jpg", "58-153A0062.jpg", "59-153A0064.jpg", "60-153A0067.jpg", "61-153A0068.jpg"}},
	{"Charcoal Sheer Kimono", "shiva", 897.63, []string{"62-153A0070.jpg", "63-153A0073.jpg", "64-153A0079.jpg", "65-153A0081.jpg", "66-153A0083.jpg"}},
	{"Black Studded Skirt Set", "shiva", 640.47, []string{"67-153A0084.jpg", "68-153A0085.jpg", "69-153A0094.jpg"}},
	{"Black Lace Skirt Set", "shiva", 654.71, []string{"70-153A0097.jpg", "71-153A0098.jpg", "72-153A0099.jpg", "73-153A0101.jpg", "74-153A0105.jpg", "80-153A0127.jpg", "81-153A0128.jpg"}},
	{"Brown Wrap Skirt Set", "shiva", 785.27, []string{"75-153A0113.jpg", "76-153A0115.jpg", "77-153A0118.jpg", "78-153A0119.jpg", "79-153A0120.jpg"}},
}

var legacySeedSlugs = []string{
	"void-walker-trench",
	"asymmetric-drape-dress",
	"tactical-survival-suit",
	"deconstructed-blazer",
	"nomad-cargo-trousers",
	"ritual-wrap-coat",
}

func seedProductSlug(name string) string {
	slug := strings.ToLower(name)
	slug = strings.ReplaceAll(slug, " ", "-")
	return strings.Trim(slug, "-")
}

func seedImagesJSON(images []string) string {
	paths := make([]string, 0, len(images))
	for _, image := range images {
		paths = append(paths, `"/assets/images/`+image+`"`)
	}
	return "[" + strings.Join(paths, ",") + "]"
}

func SeedProducts(db *sql.DB) {
	if err := cleanupRetiredSeedProducts(db); err != nil {
		log.Printf("Failed to remove retired seed products: %v", err)
	}
}

func cleanupRetiredSeedProducts(db *sql.DB) error {
	slugs := retiredSeedProductSlugs()
	if len(slugs) == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	args := anySlice(slugs)
	deleteQuery := `
		DELETE FROM products
		WHERE slug IN (` + placeholders(len(slugs)) + `)
		  AND NOT EXISTS (SELECT 1 FROM cart_items ci WHERE ci.product_id = products.id)
		  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id)
	`
	deleteResult, err := tx.Exec(Rebind(deleteQuery), args...)
	if err != nil {
		return err
	}
	deleted, _ := deleteResult.RowsAffected()

	updateArgs := append([]any{false, false}, args...)
	updateResult, err := tx.Exec(Rebind(`
		UPDATE products
		SET is_active = ?, in_stock = ?, quantity = 0, updated_at = CURRENT_TIMESTAMP
		WHERE slug IN (`+placeholders(len(slugs))+`)
	`), updateArgs...)
	if err != nil {
		return err
	}
	hidden, _ := updateResult.RowsAffected()

	if err := tx.Commit(); err != nil {
		return err
	}
	if deleted > 0 || hidden > 0 {
		log.Printf("✓ Removed retired seed catalogue products: %d deleted, %d hidden", deleted, hidden)
	}
	return nil
}

func retiredSeedProductSlugs() []string {
	seen := map[string]bool{}
	slugs := make([]string, 0, len(seedProductRows)+len(legacySeedSlugs))
	for _, product := range seedProductRows {
		slug := seedProductSlug(product.name)
		if !seen[slug] {
			slugs = append(slugs, slug)
			seen[slug] = true
		}
	}
	for _, slug := range legacySeedSlugs {
		if !seen[slug] {
			slugs = append(slugs, slug)
			seen[slug] = true
		}
	}
	return slugs
}

func seedProducts(db *sql.DB) error {
	for i, p := range seedProductRows {
		if err := insertSeedProduct(db, i, p.name, p.category, p.price, p.images); err != nil {
			return err
		}
	}
	return nil
}

func isLegacySeedCatalogue(db *sql.DB, totalProducts int) bool {
	var legacyCount, realSeedCount int
	QueryRow(db, "SELECT COUNT(*) FROM products WHERE slug IN ("+placeholders(len(legacySeedSlugs))+")", anySlice(legacySeedSlugs)...).Scan(&legacyCount)
	QueryRow(db, "SELECT COUNT(*) FROM products WHERE slug IN ("+placeholders(len(seedProductRows))+")", seedSlugArgs()...).Scan(&realSeedCount)
	return totalProducts <= len(legacySeedSlugs) && legacyCount >= 4 && realSeedCount == 0
}

func replaceLegacySeedCatalogue(db *sql.DB) error {
	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	refs, err := referencedLegacyProductCount(tx)
	if err != nil {
		return err
	}
	if refs == 0 {
		if _, err := tx.Exec(Rebind("DELETE FROM products WHERE slug IN ("+placeholders(len(legacySeedSlugs))+")"), anySlice(legacySeedSlugs)...); err != nil {
			return err
		}
	} else {
		if _, err := tx.Exec(Rebind("UPDATE products SET is_active = false, in_stock = false, quantity = 0, updated_at = CURRENT_TIMESTAMP WHERE slug IN ("+placeholders(len(legacySeedSlugs))+")"), anySlice(legacySeedSlugs)...); err != nil {
			return err
		}
	}

	for i, p := range seedProductRows {
		if err := insertSeedProductTx(tx, i, p.name, p.category, p.price, p.images); err != nil {
			return err
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	log.Printf("✓ Replaced legacy demo catalogue with %d production products", len(seedProductRows))
	return nil
}

func referencedLegacyProductCount(tx *sql.Tx) (int, error) {
	args := anySlice(legacySeedSlugs)
	query := `
		SELECT
			(SELECT COUNT(*)
			 FROM cart_items ci
			 JOIN products p ON p.id = ci.product_id
			 WHERE p.slug IN (` + placeholders(len(legacySeedSlugs)) + `))
			+
			(SELECT COUNT(*)
			 FROM order_items oi
			 JOIN products p ON p.id = oi.product_id
			 WHERE p.slug IN (` + placeholders(len(legacySeedSlugs)) + `))
	`
	allArgs := append(args, args...)
	var count int
	err := tx.QueryRow(Rebind(query), allArgs...).Scan(&count)
	return count, err
}

func insertSeedProduct(db *sql.DB, index int, name string, category string, price float64, images []string) error {
	return insertSeedProductWithExec(func(query string, args ...any) (sql.Result, error) {
		return Exec(db, query, args...)
	}, index, name, category, price, images)
}

func insertSeedProductTx(tx *sql.Tx, index int, name string, category string, price float64, images []string) error {
	return insertSeedProductWithExec(func(query string, args ...any) (sql.Result, error) {
		return tx.Exec(Rebind(query), args...)
	}, index, name, category, price, images)
}

func insertSeedProductWithExec(exec func(string, ...any) (sql.Result, error), index int, name string, category string, price float64, images []string) error {
	id := index + 1
	featured := id <= 4
	quantity := 120
	idText := strconv.Itoa(id)
	imagesJSON := seedImagesJSON(images)
	sku := "SS26-" + strings.ToUpper(category) + "-" + strings.Repeat("0", 3-len(idText)) + idText

	_, err := exec(`
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, currency, category, sizes, colors, images, featured, quantity, sku, is_featured, is_active, sale_active, in_stock, updated_at)
		VALUES (?, ?, ?, ?, 0, false, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, false, ?, CURRENT_TIMESTAMP)
	`, name, seedProductSlug(name), "Studio photographed wholesale style with matching front, back, and detail views.", price, "INR", category, `["XS","S","M","L","XL"]`, `["Void Black"]`, imagesJSON, featured, quantity, sku, featured, quantity > 0)
	if err != nil {
		return err
	}
	return nil
}

func placeholders(count int) string {
	if count <= 0 {
		return "NULL"
	}
	return strings.TrimRight(strings.Repeat("?,", count), ",")
}

func seedSlugArgs() []any {
	args := make([]any, 0, len(seedProductRows))
	for _, product := range seedProductRows {
		args = append(args, seedProductSlug(product.name))
	}
	return args
}

func anySlice(values []string) []any {
	args := make([]any, 0, len(values))
	for _, value := range values {
		args = append(args, value)
	}
	return args
}
