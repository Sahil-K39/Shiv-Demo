package store

import (
	"database/sql"
	_ "embed"
	"encoding/json"
	"errors"
	"log"
)

//go:embed final_products.json
var finalProductsJSON []byte

type finalProductsPayload struct {
	Products []finalProduct `json:"products"`
}

type finalProduct struct {
	Name          string  `json:"name"`
	Slug          string  `json:"slug"`
	Description   string  `json:"description"`
	Price         float64 `json:"price"`
	SalePrice     float64 `json:"sale_price"`
	Category      string  `json:"category"`
	Collection    string  `json:"collection"`
	Sizes         string  `json:"sizes"`
	Colors        string  `json:"colors"`
	Images        string  `json:"images"`
	Quantity      int     `json:"quantity"`
	SKU           string  `json:"sku"`
	IsFeatured    bool    `json:"is_featured"`
	IsActive      bool    `json:"is_active"`
	SaleActive    bool    `json:"sale_active"`
	SaleStartDate *string `json:"sale_start_date"`
	SaleEndDate   *string `json:"sale_end_date"`
}

func SyncFinalProducts(db *sql.DB) error {
	var payload finalProductsPayload
	if err := json.Unmarshal(finalProductsJSON, &payload); err != nil {
		return err
	}
	if len(payload.Products) == 0 {
		return nil
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	created := 0
	updated := 0
	activeSKUs := make([]string, 0, len(payload.Products))
	for _, product := range payload.Products {
		activeSKUs = append(activeSKUs, product.SKU)
		existingID, exists, err := findProductIDBySKUOrSlug(tx, product.SKU, product.Slug)
		if err != nil {
			return err
		}
		if exists {
			if err := updateFinalProduct(tx, existingID, product); err != nil {
				return err
			}
			updated++
			continue
		}
		if err := insertFinalProduct(tx, product); err != nil {
			return err
		}
		created++
	}

	deleted, hidden, err := removeMissingFinalProducts(tx, activeSKUs)
	if err != nil {
		return err
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	log.Printf("✓ Synced final product catalogue: %d created, %d updated, %d deleted, %d hidden", created, updated, deleted, hidden)
	return nil
}

func removeMissingFinalProducts(tx *sql.Tx, activeSKUs []string) (int64, int64, error) {
	if len(activeSKUs) == 0 {
		return 0, 0, nil
	}

	args := []any{}
	for _, sku := range activeSKUs {
		args = append(args, sku)
	}
	deleteQuery := `
		DELETE FROM products
		WHERE (sku LIKE 'SS-FINAL-%' OR sku LIKE 'SS-PHOTO-%')
		  AND sku NOT IN (` + placeholders(len(activeSKUs)) + `)
		  AND NOT EXISTS (SELECT 1 FROM cart_items ci WHERE ci.product_id = products.id)
		  AND NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = products.id)
	`
	deleteResult, err := tx.Exec(Rebind(deleteQuery), args...)
	if err != nil {
		return 0, 0, err
	}
	deleted, _ := deleteResult.RowsAffected()

	updateArgs := []any{false, false}
	updateArgs = append(updateArgs, args...)
	updateQuery := `
		UPDATE products
		SET is_active = ?, in_stock = ?, quantity = 0, updated_at = CURRENT_TIMESTAMP
		WHERE (sku LIKE 'SS-FINAL-%' OR sku LIKE 'SS-PHOTO-%')
		  AND sku NOT IN (` + placeholders(len(activeSKUs)) + `)
		  AND is_active = true
	`
	updateResult, err := tx.Exec(Rebind(updateQuery), updateArgs...)
	if err != nil {
		return 0, 0, err
	}
	hidden, _ := updateResult.RowsAffected()
	return deleted, hidden, nil
}

func findProductIDBySKUOrSlug(tx *sql.Tx, sku string, slug string) (int64, bool, error) {
	var skuID sql.NullInt64
	err := tx.QueryRow(Rebind("SELECT id FROM products WHERE sku = ?"), sku).Scan(&skuID)
	if err != nil && err != sql.ErrNoRows {
		return 0, false, err
	}

	var slugID sql.NullInt64
	err = tx.QueryRow(Rebind("SELECT id FROM products WHERE slug = ?"), slug).Scan(&slugID)
	if err != nil && err != sql.ErrNoRows {
		return 0, false, err
	}

	if skuID.Valid && slugID.Valid && skuID.Int64 != slugID.Int64 {
		return 0, false, errors.New("final product SKU and slug already belong to different products")
	}
	if skuID.Valid {
		return skuID.Int64, true, nil
	}
	if slugID.Valid {
		return slugID.Int64, true, nil
	}
	return 0, false, nil
}

func insertFinalProduct(tx *sql.Tx, product finalProduct) error {
	_, err := tx.Exec(Rebind(`
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, currency, category, collection, sizes, colors, images, in_stock, featured, quantity, sku, is_featured, is_active, sale_active, sale_start_date, sale_end_date, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`), product.Name, product.Slug, product.Description, product.Price, product.SalePrice, product.SaleActive, "INR", product.Category, product.Collection, product.Sizes, product.Colors, product.Images, product.Quantity > 0, product.IsFeatured, product.Quantity, product.SKU, product.IsFeatured, product.IsActive, product.SaleActive, product.SaleStartDate, product.SaleEndDate)
	return err
}

func updateFinalProduct(tx *sql.Tx, id int64, product finalProduct) error {
	_, err := tx.Exec(Rebind(`
		UPDATE products
		SET name = ?, slug = ?, description = ?, price = ?, sale_price = ?, is_on_sale = ?, currency = ?, category = ?, collection = ?, sizes = ?, colors = ?, images = ?, in_stock = ?, featured = ?, quantity = ?, sku = ?, is_featured = ?, is_active = ?, sale_active = ?, sale_start_date = ?, sale_end_date = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`), product.Name, product.Slug, product.Description, product.Price, product.SalePrice, product.SaleActive, "INR", product.Category, product.Collection, product.Sizes, product.Colors, product.Images, product.Quantity > 0, product.IsFeatured, product.Quantity, product.SKU, product.IsFeatured, product.IsActive, product.SaleActive, product.SaleStartDate, product.SaleEndDate, id)
	return err
}
