package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/email"
	"shiv-shakti/internal/middleware"
	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"

	"github.com/gin-gonic/gin"
)

type AuthHandler struct {
	service      *auth.Service
	emailService *email.MailService
}

func NewAuthHandler(service *auth.Service) *AuthHandler {
	return &AuthHandler{service: service, emailService: email.NewMailService()}
}

func (h *AuthHandler) Register(c *gin.Context) {
	var input models.RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	user, token, err := h.service.Register(&input)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "email already registered" {
			status = http.StatusConflict
		}
		c.JSON(status, gin.H{"error": "registration_failed", "message": err.Error()})
		return
	}

	// Send verification email (mock mode logs)
	if err := h.emailService.SendVerification(user.Email, user.Name, token); err != nil {
		log.Printf("Failed to send verification email: %v", err)
	}

	tokenStr, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, tokenStr)

	// Generate CSRF token and include in response
	csrfToken := middleware.GenerateCSRFToken()
	c.JSON(http.StatusCreated, gin.H{
		"message":    "Account created successfully. Verification email sent.",
		"user":       user,
		"csrf_token": csrfToken,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	user, err := h.service.Login(&input)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "login_failed",
			"message": "Invalid email or password.",
		})
		return
	}

	// Send welcome email on each login
	if err := h.emailService.SendWelcome(user.Email, user.Name); err != nil {
		log.Printf("Failed to send login welcome email: %v", err)
	}

	token, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, token)

	// Generate CSRF token for subsequent state‑changing requests
	csrfToken := middleware.GenerateCSRFToken()
	c.JSON(http.StatusOK, gin.H{
		"message":    "Login successful",
		"user":       user,
		"csrf_token": csrfToken,
	})
}

func (h *AuthHandler) AdminLogin(c *gin.Context) {
	var input models.LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"message": "Invalid input: " + err.Error(),
		})
		return
	}

	user, err := h.service.Login(&input)
	if err != nil || user.Role != "admin" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error":   "admin_login_failed",
			"message": "Invalid admin credentials.",
		})
		return
	}

	token, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, token)

	c.JSON(http.StatusOK, gin.H{
		"message": "Admin login successful",
		"user":    user,
	})
}

func (h *AuthHandler) Logout(c *gin.Context) {
	sameSite, secure := sessionCookieOptions()
	c.SetSameSite(sameSite)
	c.SetCookie("shiv_session", "", -1, "/", "", secure, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// Verify handles email verification via token query param
func (h *AuthHandler) Verify(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "missing_token", "message": "Verification token is required"})
		return
	}
	user, err := h.service.VerifyEmail(token)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "verification_failed", "message": err.Error()})
		return
	}
	// Generate JWT token for the verified user
	tokenStr, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, tokenStr)
	c.JSON(http.StatusOK, gin.H{"message": "Email verified", "user": user})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID := c.GetInt64("user_id")
	user, err := h.service.GetUserByID(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user_not_found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

func setSessionCookie(c *gin.Context, token string) {
	sameSite, secure := sessionCookieOptions()
	c.SetSameSite(sameSite)
	c.SetCookie(
		"shiv_session",
		token,
		86400,
		"/",
		"",
		secure,
		true,
	)
}

func sessionCookieOptions() (http.SameSite, bool) {
	if strings.EqualFold(os.Getenv("APP_ENV"), "production") || strings.EqualFold(os.Getenv("SESSION_COOKIE_SAMESITE"), "none") {
		return http.SameSiteNoneMode, true
	}
	return http.SameSiteLaxMode, false
}

type ProductHandler struct {
	db *sql.DB
}

func NewProductHandler(db *sql.DB) *ProductHandler {
	return &ProductHandler{db: db}
}

const productSelectColumns = `
	id, name, slug, description, price, sale_price, is_on_sale, currency, category, collection,
	sizes, colors, images, in_stock, featured, quantity, sku, is_featured, is_active, sale_active,
	sale_start_date, sale_end_date, created_at, updated_at
`

type rowScanner interface {
	Scan(dest ...any) error
}

func scanProduct(scanner rowScanner, p *models.Product) error {
	var saleStart sql.NullTime
	var saleEnd sql.NullTime
	err := scanner.Scan(
		&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.SalePrice, &p.IsOnSale, &p.Currency,
		&p.Category, &p.Collection, &p.Sizes, &p.Colors, &p.Images, &p.InStock, &p.Featured,
		&p.Quantity, &p.SKU, &p.IsFeatured, &p.IsActive, &p.SaleActive,
		&saleStart, &saleEnd, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return err
	}
	if saleStart.Valid {
		p.SaleStartDate = &saleStart.Time
	}
	if saleEnd.Valid {
		p.SaleEndDate = &saleEnd.Time
	}
	if p.Featured {
		p.IsFeatured = true
	}
	if p.IsOnSale {
		p.SaleActive = true
	}
	return nil
}

func productSlug(name string) string {
	slug := strings.ToLower(strings.TrimSpace(name))
	replacer := strings.NewReplacer("&", "and", "/", "-", "_", "-", ".", "", ",", "", "'", "", "\"", "")
	slug = replacer.Replace(slug)
	slug = strings.Join(strings.Fields(slug), "-")
	if slug == "" {
		return "product"
	}
	return slug
}

func normalizeProductInput(input *models.ProductInput) {
	input.Name = strings.TrimSpace(input.Name)
	input.Slug = strings.TrimSpace(input.Slug)
	input.Category = strings.TrimSpace(input.Category)
	input.Collection = strings.TrimSpace(input.Collection)
	input.SKU = strings.TrimSpace(input.SKU)
	if strings.TrimSpace(input.Slug) == "" {
		input.Slug = productSlug(input.Name)
	}
	if strings.TrimSpace(input.Collection) == "" {
		input.Collection = "SS26"
	}
	if strings.TrimSpace(input.Sizes) == "" {
		input.Sizes = `["OS"]`
	}
	if strings.TrimSpace(input.Colors) == "" {
		input.Colors = `["Default"]`
	}
	if strings.TrimSpace(input.Images) == "" {
		input.Images = `[]`
	}
	input.InStock = input.Quantity > 0
	input.Featured = input.IsFeatured
	input.IsOnSale = input.SaleActive
}

func validateProductInput(input *models.ProductInput) error {
	if input.SalePrice > input.Price && input.Price > 0 {
		return errors.New("sale price cannot be greater than price")
	}
	if input.SaleStartDate != nil && input.SaleEndDate != nil && input.SaleStartDate.After(*input.SaleEndDate) {
		return errors.New("sale start date must be before sale end date")
	}
	for field, value := range map[string]string{
		"sizes":  input.Sizes,
		"colors": input.Colors,
		"images": input.Images,
	} {
		if err := validateJSONStringArray(field, value); err != nil {
			return err
		}
	}
	return nil
}

func validateJSONStringArray(field string, value string) error {
	var items []string
	if err := json.Unmarshal([]byte(value), &items); err != nil {
		return errors.New(field + " must be a JSON array")
	}
	for _, item := range items {
		if strings.TrimSpace(item) == "" {
			return errors.New(field + " cannot contain empty values")
		}
	}
	return nil
}

func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	message := strings.ToLower(err.Error())
	return strings.Contains(message, "unique") || strings.Contains(message, "duplicate")
}

func (h *ProductHandler) ListAll(c *gin.Context) {
	rows, err := store.Query(h.db,
		"SELECT "+productSelectColumns+" FROM products WHERE is_active = ? ORDER BY id ASC",
		true,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"total":    len(products),
	})
}

func (h *ProductHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	var p models.Product
	row := store.QueryRow(h.db,
		"SELECT "+productSelectColumns+" FROM products WHERE id = ?", id,
	)
	err = scanProduct(row, &p)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, p)
}

func (h *ProductHandler) GetByCategory(c *gin.Context) {
	category := c.Param("category")

	rows, err := store.Query(h.db,
		"SELECT "+productSelectColumns+" FROM products WHERE LOWER(category) = LOWER(?) AND is_active = ? ORDER BY id ASC", category, true,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products, "total": len(products)})
}

func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}
	normalizeProductInput(&input)
	if err := validateProductInput(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	id, err := store.InsertID(h.db, `
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, category, collection, sizes, colors, images, in_stock, featured, quantity, sku, is_featured, is_active, sale_active, sale_start_date, sale_end_date, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
	`, `
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, category, collection, sizes, colors, images, in_stock, featured, quantity, sku, is_featured, is_active, sale_active, sale_start_date, sale_end_date, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
		RETURNING id
	`, input.Name, input.Slug, input.Description, input.Price, input.SalePrice, input.IsOnSale, input.Category, input.Collection, input.Sizes, input.Colors, input.Images, input.InStock, input.Featured, input.Quantity, input.SKU, input.IsFeatured, input.IsActive, input.SaleActive, input.SaleStartDate, input.SaleEndDate)

	if err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "product_already_exists", "message": "Slug or SKU already exists."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_creation_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Product created", "product_id": id})
}

func (h *ProductHandler) UpdateProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}
	normalizeProductInput(&input)
	if err := validateProductInput(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	result, err := store.Exec(h.db, `
		UPDATE products 
		SET name = ?, slug = ?, description = ?, price = ?, sale_price = ?, is_on_sale = ?, category = ?, collection = ?, sizes = ?, colors = ?, images = ?, in_stock = ?, featured = ?, quantity = ?, sku = ?, is_featured = ?, is_active = ?, sale_active = ?, sale_start_date = ?, sale_end_date = ?, updated_at = CURRENT_TIMESTAMP
		WHERE id = ?
	`, input.Name, input.Slug, input.Description, input.Price, input.SalePrice, input.IsOnSale, input.Category, input.Collection, input.Sizes, input.Colors, input.Images, input.InStock, input.Featured, input.Quantity, input.SKU, input.IsFeatured, input.IsActive, input.SaleActive, input.SaleStartDate, input.SaleEndDate, id)

	if err != nil {
		if isUniqueConstraintError(err) {
			c.JSON(http.StatusConflict, gin.H{"error": "product_already_exists", "message": "Slug or SKU already exists."})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_update_failed", "message": err.Error()})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product updated"})
}

func (h *ProductHandler) DeleteProduct(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	result, err := store.Exec(h.db, "DELETE FROM products WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_deletion_failed", "message": err.Error()})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}

func (h *ProductHandler) ListAdmin(c *gin.Context) {
	rows, err := store.Query(h.db, "SELECT "+productSelectColumns+" FROM products ORDER BY created_at DESC")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		if err := scanProduct(rows, &p); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		products = append(products, p)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products, "total": len(products)})
}

func (h *ProductHandler) Dashboard(c *gin.Context) {
	var totalProducts, totalStock, lowStockProducts, activeSaleProducts int
	store.QueryRow(h.db, "SELECT COUNT(*) FROM products").Scan(&totalProducts)
	store.QueryRow(h.db, "SELECT COALESCE(SUM(quantity), 0) FROM products").Scan(&totalStock)
	store.QueryRow(h.db, "SELECT COUNT(*) FROM products WHERE quantity > 0 AND quantity <= 10").Scan(&lowStockProducts)
	store.QueryRow(h.db, "SELECT COUNT(*) FROM products WHERE sale_active = ?", true).Scan(&activeSaleProducts)

	c.JSON(http.StatusOK, gin.H{
		"total_products":       totalProducts,
		"total_stock":          totalStock,
		"low_stock_products":   lowStockProducts,
		"active_sale_products": activeSaleProducts,
	})
}

type CartHandler struct {
	db *sql.DB
}

func NewCartHandler(db *sql.DB) *CartHandler {
	return &CartHandler{db: db}
}

func (h *CartHandler) GetCart(c *gin.Context) {
	userID := c.GetInt64("user_id")

	rows, err := store.Query(h.db, `
		SELECT ci.id, ci.product_id, ci.quantity, ci.size, ci.color,
		       p.name,
		       CASE WHEN (p.sale_active = ? OR p.is_on_sale = ?) AND p.sale_price > 0 THEN p.sale_price ELSE p.price END,
		       p.images, p.slug
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ? AND p.is_active = ?
	`, true, true, userID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	type CartItemResponse struct {
		ID        int64   `json:"id"`
		ProductID int64   `json:"product_id"`
		Quantity  int     `json:"quantity"`
		Size      string  `json:"size"`
		Color     string  `json:"color"`
		Name      string  `json:"name"`
		Price     float64 `json:"price"`
		Images    string  `json:"images"`
		Slug      string  `json:"slug"`
	}

	items := []CartItemResponse{}
	var total float64
	for rows.Next() {
		var item CartItemResponse
		if err := rows.Scan(&item.ID, &item.ProductID, &item.Quantity, &item.Size, &item.Color,
			&item.Name, &item.Price, &item.Images, &item.Slug); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		total += item.Price * float64(item.Quantity)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"items":      items,
		"item_count": len(items),
		"total":      total,
		"currency":   "USD",
	})
}

func (h *CartHandler) AddItem(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var input models.AddToCartInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	var inStock bool
	var available int
	err := store.QueryRow(h.db, "SELECT in_stock, quantity FROM products WHERE id = ? AND is_active = ?", input.ProductID, true).Scan(&inStock, &available)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	if !inStock {
		c.JSON(http.StatusConflict, gin.H{"error": "out_of_stock"})
		return
	}
	var currentQuantity int
	err = store.QueryRow(h.db, `
		SELECT COALESCE(quantity, 0)
		FROM cart_items
		WHERE user_id = ? AND product_id = ? AND size = ? AND color = ?
	`, userID, input.ProductID, input.Size, input.Color).Scan(&currentQuantity)
	if err != nil && err != sql.ErrNoRows {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	if currentQuantity+input.Quantity > available {
		c.JSON(http.StatusConflict, gin.H{
			"error":     "stock_limit_exceeded",
			"message":   "Requested quantity exceeds available stock.",
			"available": available,
		})
		return
	}

	_, err = store.Exec(h.db, `
		INSERT INTO cart_items (user_id, product_id, quantity, size, color)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(user_id, product_id, size, color)
		DO UPDATE SET quantity = quantity + ?
	`, userID, input.ProductID, input.Quantity, input.Size, input.Color, input.Quantity)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cart_update_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Item added to cart"})
}

func (h *CartHandler) UpdateItem(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var input struct {
		ItemID   int64 `json:"item_id" binding:"required"`
		Quantity int   `json:"quantity" binding:"required,min=0,max=500"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed"})
		return
	}

	if input.Quantity == 0 {
		if _, err := store.Exec(h.db, "DELETE FROM cart_items WHERE id = ? AND user_id = ?", input.ItemID, userID); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "cart_update_failed"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
		return
	}

	var available int
	err := store.QueryRow(h.db, `
		SELECT p.quantity
		FROM cart_items ci
		JOIN products p ON p.id = ci.product_id
		WHERE ci.id = ? AND ci.user_id = ? AND p.is_active = ? AND p.in_stock = ?
	`, input.ItemID, userID, true, true).Scan(&available)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart_item_not_found"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	if input.Quantity > available {
		c.JSON(http.StatusConflict, gin.H{
			"error":     "stock_limit_exceeded",
			"message":   "Requested quantity exceeds available stock.",
			"available": available,
		})
		return
	}

	result, err := store.Exec(h.db, "UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
		input.Quantity, input.ItemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cart_update_failed"})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart_item_not_found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cart updated"})
}

func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID := c.GetInt64("user_id")
	itemID, err := strconv.ParseInt(c.Param("itemId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	result, err := store.Exec(h.db, "DELETE FROM cart_items WHERE id = ? AND user_id = ?", itemID, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cart_update_failed"})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "cart_item_not_found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}

type OrderHandler struct {
	db           *sql.DB
	emailService *email.MailService
}

func NewOrderHandler(db *sql.DB) *OrderHandler {
	return &OrderHandler{
		db:           db,
		emailService: email.NewMailService(),
	}
}

func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID := c.GetInt64("user_id")
	userEmail := c.GetString("email")

	var input models.CheckoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   "validation_failed",
			"message": "Invalid shipping details: " + err.Error(),
		})
		return
	}

	rows, err := store.Query(h.db, `
		SELECT ci.product_id, ci.quantity, ci.size, ci.color, p.name,
		       CASE WHEN (p.sale_active = ? OR p.is_on_sale = ?) AND p.sale_price > 0 THEN p.sale_price ELSE p.price END
		FROM cart_items ci JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ? AND p.is_active = ?
	`, true, true, userID, true)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	var items []models.OrderItem
	var total float64
	for rows.Next() {
		var item models.OrderItem
		if err := rows.Scan(&item.ProductID, &item.Quantity, &item.Size, &item.Color, &item.Name, &item.Price); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		total += item.Price * float64(item.Quantity)
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	if err := rows.Close(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	if len(items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "empty_cart", "message": "Cart is empty"})
		return
	}

	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction_failed"})
		return
	}
	for _, item := range items {
		result, err := store.TxExec(tx, `
			UPDATE products
			SET quantity = quantity - ?,
			    in_stock = CASE WHEN quantity - ? > 0 THEN ? ELSE ? END,
			    updated_at = CURRENT_TIMESTAMP
			WHERE id = ? AND is_active = ? AND in_stock = ? AND quantity >= ?
		`, item.Quantity, item.Quantity, true, false, item.ProductID, true, true, item.Quantity)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "stock_update_failed"})
			return
		}
		if affected, err := result.RowsAffected(); err == nil && affected == 0 {
			tx.Rollback()
			c.JSON(http.StatusConflict, gin.H{
				"error":   "stock_limit_exceeded",
				"message": "One or more items no longer have enough stock.",
			})
			return
		}
	}

	const orderStatus = "payment_pending"
	createdAt := time.Now()
	orderID, err := store.TxInsertID(tx, `
		INSERT INTO orders (
			user_id, total_price, status,
			shipping_name, shipping_address, shipping_city,
			shipping_state, shipping_zip, shipping_country,
			shipping_phone, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		`
		INSERT INTO orders (
			user_id, total_price, status,
			shipping_name, shipping_address, shipping_city,
			shipping_state, shipping_zip, shipping_country,
			shipping_phone, created_at, updated_at
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		RETURNING id`,
		userID, total, orderStatus,
		input.ShippingName, input.ShippingAddress, input.ShippingCity,
		input.ShippingState, input.ShippingZip, input.ShippingCountry,
		input.ShippingPhone, createdAt, createdAt,
	)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "order_creation_failed", "details": err.Error()})
		return
	}

	for _, item := range items {
		_, err = store.TxExec(tx,
			"INSERT INTO order_items (order_id, product_id, name, price, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
			orderID, item.ProductID, item.Name, item.Price, item.Quantity, item.Size, item.Color,
		)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "order_items_failed"})
			return
		}
	}

	if _, err := store.TxExec(tx, "DELETE FROM cart_items WHERE user_id = ?", userID); err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "cart_clear_failed"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit_failed"})
		return
	}

	// Prepare Order object for email template
	order := &models.Order{
		ID:              orderID,
		UserID:          userID,
		Items:           items,
		TotalPrice:      total,
		Status:          orderStatus,
		ShippingName:    input.ShippingName,
		ShippingAddress: input.ShippingAddress,
		ShippingCity:    input.ShippingCity,
		ShippingState:   input.ShippingState,
		ShippingZip:     input.ShippingZip,
		ShippingCountry: input.ShippingCountry,
		ShippingPhone:   input.ShippingPhone,
		CreatedAt:       createdAt,
		UpdatedAt:       createdAt,
	}

	// Asynchronously trigger order confirmation email
	go func() {
		if err := h.emailService.SendOrderConfirmation(userEmail, order); err != nil {
			log.Printf("✗ Email delivery failed for Order #%d: %v", order.ID, err)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Wholesale order received. Payment is pending manual review.",
		"order_id": orderID,
		"status":   orderStatus,
		"total":    total,
		"items":    len(items),
	})
}

func (h *OrderHandler) ListOrders(c *gin.Context) {
	userID := c.GetInt64("user_id")

	rows, err := store.Query(h.db,
		"SELECT id, total_price, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC",
		userID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	type OrderSummary struct {
		ID         int64     `json:"id"`
		TotalPrice float64   `json:"total_price"`
		Status     string    `json:"status"`
		CreatedAt  time.Time `json:"created_at"`
	}

	orders := []OrderSummary{}
	for rows.Next() {
		var o OrderSummary
		if err := rows.Scan(&o.ID, &o.TotalPrice, &o.Status, &o.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		orders = append(orders, o)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

type CommunityHandler struct {
	db *sql.DB
}

func NewCommunityHandler(db *sql.DB) *CommunityHandler {
	return &CommunityHandler{db: db}
}

func (h *CommunityHandler) ListPosts(c *gin.Context) {
	category := c.Query("category")

	var rows *sql.Rows
	var err error
	if category != "" && category != "ALL" {
		rows, err = store.Query(h.db,
			"SELECT id, user_id, email, title, body, category, likes, created_at FROM community_posts WHERE category = ? ORDER BY created_at DESC LIMIT 50",
			category,
		)
	} else {
		rows, err = store.Query(h.db,
			"SELECT id, user_id, email, title, body, category, likes, created_at FROM community_posts ORDER BY created_at DESC LIMIT 50",
		)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	posts := []models.CommunityPost{}
	for rows.Next() {
		var p models.CommunityPost
		if err := rows.Scan(&p.ID, &p.UserID, &p.Email, &p.Title, &p.Body, &p.Category, &p.Likes, &p.CreatedAt); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		posts = append(posts, p)
	}
	if err := rows.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	c.JSON(http.StatusOK, posts)
}

func (h *CommunityHandler) CreatePost(c *gin.Context) {
	userID := c.GetInt64("user_id")
	email := c.GetString("email")

	var input models.CreatePostInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	id, err := store.InsertID(h.db,
		"INSERT INTO community_posts (user_id, email, title, body, category, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		"INSERT INTO community_posts (user_id, email, title, body, category, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
		userID, email, input.Title, input.Body, input.Category, time.Now(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "post_creation_failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Transmission accepted",
		"post_id": id,
	})
}

func (h *CommunityHandler) LikePost(c *gin.Context) {
	userID := c.GetInt64("user_id")

	var input struct {
		PostID int64 `json:"post_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed"})
		return
	}

	_, err := store.Exec(h.db,
		"INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)",
		userID, input.PostID,
	)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "already_liked"})
		return
	}

	store.Exec(h.db, "UPDATE community_posts SET likes = likes + 1 WHERE id = ?", input.PostID)
	c.JSON(http.StatusOK, gin.H{"message": "Liked"})
}

type NGOHandler struct {
	db *sql.DB
}

func NewNGOHandler(db *sql.DB) *NGOHandler {
	return &NGOHandler{db: db}
}

func (h *NGOHandler) CreateInterest(c *gin.Context) {
	var input models.NGOInterestInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	if err := store.InsertNGOInterest(h.db, input.Name, input.Email, input.Phone, input.Message); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ngo_interest_failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Interest received"})
}
