package handlers

import (
	"database/sql"
	"net/http"
	"strconv"
	"time"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/models"

	"github.com/gin-gonic/gin"
)



type AuthHandler struct {
	service *auth.Service
}

func NewAuthHandler(service *auth.Service) *AuthHandler {
	return &AuthHandler{service: service}
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

	user, err := h.service.Register(&input)
	if err != nil {
		status := http.StatusInternalServerError
		if err.Error() == "email already registered" {
			status = http.StatusConflict
		}
		c.JSON(status, gin.H{"error": "registration_failed", "message": err.Error()})
		return
	}

	
	token, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, token)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"user":    user,
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

	token, err := h.service.GenerateToken(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "token_failed"})
		return
	}
	setSessionCookie(c, token)

	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user":    user,
	})
}



func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("shiv_session", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
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
	c.SetSameSite(http.SameSiteLaxMode)
	c.SetCookie(
		"shiv_session", 
		token,          
		86400,          
		"/",            
		"",             
		false,          
		true,           
	)
}



type ProductHandler struct {
	db *sql.DB
}

func NewProductHandler(db *sql.DB) *ProductHandler {
	return &ProductHandler{db: db}
}



func (h *ProductHandler) ListAll(c *gin.Context) {
	rows, err := h.db.Query(
		"SELECT id, name, slug, description, price, sale_price, is_on_sale, currency, category, collection, sizes, colors, images, in_stock, featured, created_at FROM products ORDER BY featured DESC, created_at DESC",
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.SalePrice, &p.IsOnSale, &p.Currency,
			&p.Category, &p.Collection, &p.Sizes, &p.Colors, &p.Images,
			&p.InStock, &p.Featured, &p.CreatedAt)
		products = append(products, p)
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
	err = h.db.QueryRow(
		"SELECT id, name, slug, description, price, sale_price, is_on_sale, currency, category, collection, sizes, colors, images, in_stock, featured, created_at FROM products WHERE id = ?", id,
	).Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.SalePrice, &p.IsOnSale, &p.Currency,
		&p.Category, &p.Collection, &p.Sizes, &p.Colors, &p.Images,
		&p.InStock, &p.Featured, &p.CreatedAt)

	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}

	c.JSON(http.StatusOK, p)
}



func (h *ProductHandler) GetByCategory(c *gin.Context) {
	category := c.Param("category")

	rows, err := h.db.Query(
		"SELECT id, name, slug, description, price, sale_price, is_on_sale, currency, category, collection, sizes, colors, images, in_stock, featured, created_at FROM products WHERE category = ? ORDER BY featured DESC", category,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	products := []models.Product{}
	for rows.Next() {
		var p models.Product
		rows.Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.Price, &p.SalePrice, &p.IsOnSale, &p.Currency,
			&p.Category, &p.Collection, &p.Sizes, &p.Colors, &p.Images,
			&p.InStock, &p.Featured, &p.CreatedAt)
		products = append(products, p)
	}

	c.JSON(http.StatusOK, gin.H{"products": products, "total": len(products)})
}



func (h *ProductHandler) CreateProduct(c *gin.Context) {
	var input models.ProductInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	result, err := h.db.Exec(`
		INSERT INTO products (name, slug, description, price, sale_price, is_on_sale, category, collection, sizes, colors, images, in_stock, featured)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`, input.Name, input.Slug, input.Description, input.Price, input.SalePrice, input.IsOnSale, input.Category, input.Collection, input.Sizes, input.Colors, input.Images, input.InStock, input.Featured)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_creation_failed", "message": err.Error()})
		return
	}

	id, _ := result.LastInsertId()
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

	_, err = h.db.Exec(`
		UPDATE products 
		SET name = ?, slug = ?, description = ?, price = ?, sale_price = ?, is_on_sale = ?, category = ?, collection = ?, sizes = ?, colors = ?, images = ?, in_stock = ?, featured = ?
		WHERE id = ?
	`, input.Name, input.Slug, input.Description, input.Price, input.SalePrice, input.IsOnSale, input.Category, input.Collection, input.Sizes, input.Colors, input.Images, input.InStock, input.Featured, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_update_failed", "message": err.Error()})
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

	_, err = h.db.Exec("DELETE FROM products WHERE id = ?", id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "product_deletion_failed", "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted"})
}



type CartHandler struct {
	db *sql.DB
}

func NewCartHandler(db *sql.DB) *CartHandler {
	return &CartHandler{db: db}
}



func (h *CartHandler) GetCart(c *gin.Context) {
	userID := c.GetInt64("user_id")

	rows, err := h.db.Query(`
		SELECT ci.id, ci.product_id, ci.quantity, ci.size, ci.color,
		       p.name, p.price, p.images, p.slug
		FROM cart_items ci
		JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ?
	`, userID)
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
		rows.Scan(&item.ID, &item.ProductID, &item.Quantity, &item.Size, &item.Color,
			&item.Name, &item.Price, &item.Images, &item.Slug)
		total += item.Price * float64(item.Quantity)
		items = append(items, item)
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
	err := h.db.QueryRow("SELECT in_stock FROM products WHERE id = ?", input.ProductID).Scan(&inStock)
	if err == sql.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "product_not_found"})
		return
	}
	if !inStock {
		c.JSON(http.StatusConflict, gin.H{"error": "out_of_stock"})
		return
	}

	
	_, err = h.db.Exec(`
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
		Quantity int   `json:"quantity" binding:"required,min=0,max=10"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed"})
		return
	}

	if input.Quantity == 0 {
		h.db.Exec("DELETE FROM cart_items WHERE id = ? AND user_id = ?", input.ItemID, userID)
		c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
		return
	}

	h.db.Exec("UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?",
		input.Quantity, input.ItemID, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Cart updated"})
}



func (h *CartHandler) RemoveItem(c *gin.Context) {
	userID := c.GetInt64("user_id")
	itemID, _ := strconv.ParseInt(c.Param("itemId"), 10, 64)

	h.db.Exec("DELETE FROM cart_items WHERE id = ? AND user_id = ?", itemID, userID)
	c.JSON(http.StatusOK, gin.H{"message": "Item removed from cart"})
}



type OrderHandler struct {
	db *sql.DB
}

func NewOrderHandler(db *sql.DB) *OrderHandler {
	return &OrderHandler{db: db}
}



func (h *OrderHandler) CreateOrder(c *gin.Context) {
	userID := c.GetInt64("user_id")

	
	rows, err := h.db.Query(`
		SELECT ci.product_id, ci.quantity, ci.size, ci.color, p.name, p.price
		FROM cart_items ci JOIN products p ON ci.product_id = p.id
		WHERE ci.user_id = ?
	`, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	type lineItem struct {
		productID int64
		quantity  int
		size      string
		color     string
		name      string
		price     float64
	}

	var items []lineItem
	var total float64
	for rows.Next() {
		var li lineItem
		rows.Scan(&li.productID, &li.quantity, &li.size, &li.color, &li.name, &li.price)
		total += li.price * float64(li.quantity)
		items = append(items, li)
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

	
	result, err := tx.Exec(
		"INSERT INTO orders (user_id, total_price, status, created_at) VALUES (?, ?, 'confirmed', ?)",
		userID, total, time.Now(),
	)
	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "order_creation_failed"})
		return
	}

	orderID, _ := result.LastInsertId()

	
	for _, item := range items {
		_, err = tx.Exec(
			"INSERT INTO order_items (order_id, product_id, name, price, quantity, size, color) VALUES (?, ?, ?, ?, ?, ?, ?)",
			orderID, item.productID, item.name, item.price, item.quantity, item.size, item.color,
		)
		if err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "order_items_failed"})
			return
		}
	}

	
	tx.Exec("DELETE FROM cart_items WHERE user_id = ?", userID)

	
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit_failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Order confirmed",
		"order_id": orderID,
		"total":    total,
		"items":    len(items),
	})
}



func (h *OrderHandler) ListOrders(c *gin.Context) {
	userID := c.GetInt64("user_id")

	rows, err := h.db.Query(
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
		rows.Scan(&o.ID, &o.TotalPrice, &o.Status, &o.CreatedAt)
		orders = append(orders, o)
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
		rows, err = h.db.Query(
			"SELECT id, user_id, email, title, body, category, likes, created_at FROM community_posts WHERE category = ? ORDER BY created_at DESC LIMIT 50",
			category,
		)
	} else {
		rows, err = h.db.Query(
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
		rows.Scan(&p.ID, &p.UserID, &p.Email, &p.Title, &p.Body, &p.Category, &p.Likes, &p.CreatedAt)
		posts = append(posts, p)
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

	result, err := h.db.Exec(
		"INSERT INTO community_posts (user_id, email, title, body, category, created_at) VALUES (?, ?, ?, ?, ?, ?)",
		userID, email, input.Title, input.Body, input.Category, time.Now(),
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "post_creation_failed"})
		return
	}

	id, _ := result.LastInsertId()
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

	
	_, err := h.db.Exec(
		"INSERT INTO post_likes (user_id, post_id) VALUES (?, ?)",
		userID, input.PostID,
	)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "already_liked"})
		return
	}

	h.db.Exec("UPDATE community_posts SET likes = likes + 1 WHERE id = ?", input.PostID)
	c.JSON(http.StatusOK, gin.H{"message": "Liked"})
}
