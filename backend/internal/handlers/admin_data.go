package handlers

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"

	"github.com/gin-gonic/gin"
)

type AdminDataHandler struct {
	db *sql.DB
}

type inventoryConflictError struct {
	message string
}

func (e inventoryConflictError) Error() string {
	return e.message
}

type orderInventoryLine struct {
	ProductID int64
	Quantity  int
	Available int
	Name      string
}

func NewAdminDataHandler(db *sql.DB) *AdminDataHandler {
	return &AdminDataHandler{db: db}
}

func (h *AdminDataHandler) ListUsers(c *gin.Context) {
	rows, err := store.Query(h.db, `
		SELECT id, email, name, role, is_verified, created_at, updated_at, last_login_at, COALESCE(login_count, 0)
		FROM users
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	users := []models.AdminUser{}
	for rows.Next() {
		var user models.AdminUser
		var lastLogin sql.NullTime
		if err := rows.Scan(
			&user.ID, &user.Email, &user.Name, &user.Role, &user.IsVerified,
			&user.CreatedAt, &user.UpdatedAt, &lastLogin, &user.LoginCount,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		if lastLogin.Valid {
			user.LastLoginAt = &lastLogin.Time
		}
		users = append(users, user)
	}

	c.JSON(http.StatusOK, gin.H{"users": users, "total": len(users)})
}

func (h *AdminDataHandler) ListNGOInterests(c *gin.Context) {
	rows, err := store.Query(h.db, `
		SELECT id, name, email, COALESCE(phone, ''), COALESCE(message, ''), created_at
		FROM ngo_interests
		ORDER BY created_at DESC
	`)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}
	defer rows.Close()

	interests := []models.NGOInterest{}
	for rows.Next() {
		var interest models.NGOInterest
		if err := rows.Scan(
			&interest.ID, &interest.Name, &interest.Email, &interest.Phone,
			&interest.Message, &interest.CreatedAt,
		); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
			return
		}
		interests = append(interests, interest)
	}

	c.JSON(http.StatusOK, gin.H{"interests": interests, "total": len(interests)})
}

func (h *AdminDataHandler) ListOrders(c *gin.Context) {
	orders, err := h.fetchOrders("", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"orders": orders, "total": len(orders)})
}

func (h *AdminDataHandler) GetOrder(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	orders, err := h.fetchOrders("o.id = ?", []any{id})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error", "message": err.Error()})
		return
	}
	if len(orders) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
		return
	}

	c.JSON(http.StatusOK, orders[0])
}

func (h *AdminDataHandler) UpdateOrderStatus(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_id"})
		return
	}

	var input models.UpdateOrderStatusInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "validation_failed", "message": err.Error()})
		return
	}

	status := strings.ToLower(strings.TrimSpace(input.Status))
	if !validOrderStatus(status) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid_status"})
		return
	}

	paymentReference := strings.TrimSpace(input.PaymentReference)
	var result sql.Result
	tx, err := h.db.Begin()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "transaction_failed"})
		return
	}

	var currentStatus string
	if err := tx.QueryRow(store.Rebind("SELECT status FROM orders WHERE id = ?"), id).Scan(&currentStatus); err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database_error"})
		return
	}

	unitsAdjusted, err := h.adjustInventoryForStatusChange(tx, id, currentStatus, status)
	if err != nil {
		tx.Rollback()
		if conflict, ok := err.(inventoryConflictError); ok {
			c.JSON(http.StatusConflict, gin.H{"error": "stock_limit_exceeded", "message": conflict.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "inventory_update_failed", "message": err.Error()})
		return
	}

	if soldOrderStatus(status) {
		if paymentReference != "" {
			result, err = tx.Exec(store.Rebind(`
			UPDATE orders
			SET status = ?, payment_reference = ?, payment_confirmed_at = COALESCE(payment_confirmed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`), status, paymentReference, id)
		} else {
			result, err = tx.Exec(store.Rebind(`
			UPDATE orders
			SET status = ?, payment_confirmed_at = COALESCE(payment_confirmed_at, CURRENT_TIMESTAMP), updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`), status, id)
		}
	} else if paymentReference != "" {
		result, err = tx.Exec(store.Rebind(`
			UPDATE orders
			SET status = ?, payment_reference = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`), status, paymentReference, id)
	} else {
		result, err = tx.Exec(store.Rebind(`
			UPDATE orders
			SET status = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`), status, id)
	}

	if err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "order_update_failed", "message": err.Error()})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "commit_failed"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated", "units_adjusted": unitsAdjusted})
}

func validOrderStatus(status string) bool {
	switch status {
	case "pending", "payment_pending", "confirmed", "shipped", "delivered", "cancelled", "refunded":
		return true
	default:
		return false
	}
}

func soldOrderStatus(status string) bool {
	switch status {
	case "confirmed", "shipped", "delivered":
		return true
	default:
		return false
	}
}

func (h *AdminDataHandler) adjustInventoryForStatusChange(tx *sql.Tx, orderID int64, fromStatus string, toStatus string) (int, error) {
	fromSold := soldOrderStatus(fromStatus)
	toSold := soldOrderStatus(toStatus)
	if fromSold == toSold {
		return 0, nil
	}

	lines, err := h.fetchOrderInventoryLines(tx, orderID)
	if err != nil {
		return 0, err
	}

	unitsAdjusted := 0
	if !fromSold && toSold {
		for _, line := range lines {
			if line.Available < line.Quantity {
				return 0, inventoryConflictError{
					message: fmt.Sprintf("%s has only %d units available, but this enquiry needs %d.", line.Name, line.Available, line.Quantity),
				}
			}
		}
		for _, line := range lines {
			if _, err := tx.Exec(store.Rebind(`
				UPDATE products
				SET quantity = quantity - ?,
					in_stock = CASE WHEN quantity - ? > 0 THEN ? ELSE ? END,
					updated_at = CURRENT_TIMESTAMP
				WHERE id = ?
			`), line.Quantity, line.Quantity, true, false, line.ProductID); err != nil {
				return 0, err
			}
			unitsAdjusted += line.Quantity
		}
		return unitsAdjusted, nil
	}

	for _, line := range lines {
		if _, err := tx.Exec(store.Rebind(`
			UPDATE products
			SET quantity = quantity + ?,
				in_stock = ?,
				updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`), line.Quantity, true, line.ProductID); err != nil {
			return 0, err
		}
		unitsAdjusted += line.Quantity
	}

	return -unitsAdjusted, nil
}

func (h *AdminDataHandler) fetchOrderInventoryLines(tx *sql.Tx, orderID int64) ([]orderInventoryLine, error) {
	rows, err := tx.Query(store.Rebind(`
		SELECT oi.product_id, oi.quantity, p.quantity, COALESCE(p.name, oi.name)
		FROM order_items oi
		JOIN products p ON p.id = oi.product_id
		WHERE oi.order_id = ?
	`), orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	lines := []orderInventoryLine{}
	for rows.Next() {
		var line orderInventoryLine
		if err := rows.Scan(&line.ProductID, &line.Quantity, &line.Available, &line.Name); err != nil {
			return nil, err
		}
		lines = append(lines, line)
	}

	return lines, rows.Err()
}

func (h *AdminDataHandler) fetchOrders(where string, args []any) ([]models.AdminOrder, error) {
	query := `
		SELECT
			o.id, o.user_id, COALESCE(u.email, ''), COALESCE(u.name, ''),
			o.total_price, o.status,
			COALESCE(o.shipping_name, ''), COALESCE(o.shipping_address, ''),
			COALESCE(o.shipping_city, ''), COALESCE(o.shipping_state, ''),
			COALESCE(o.shipping_zip, ''), COALESCE(o.shipping_country, ''),
			COALESCE(o.shipping_phone, ''), COALESCE(o.payment_reference, ''),
			o.payment_confirmed_at, o.created_at, o.updated_at
		FROM orders o
		LEFT JOIN users u ON u.id = o.user_id
	`
	if where != "" {
		query += " WHERE " + where
	}
	query += " ORDER BY o.created_at DESC"

	rows, err := store.Query(h.db, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := []models.AdminOrder{}
	for rows.Next() {
		var order models.AdminOrder
		var paymentConfirmed sql.NullTime
		var updatedAt sql.NullTime
		if err := rows.Scan(
			&order.ID, &order.UserID, &order.UserEmail, &order.UserName,
			&order.TotalPrice, &order.Status,
			&order.ShippingName, &order.ShippingAddress, &order.ShippingCity, &order.ShippingState,
			&order.ShippingZip, &order.ShippingCountry, &order.ShippingPhone,
			&order.PaymentReference, &paymentConfirmed, &order.CreatedAt, &updatedAt,
		); err != nil {
			return nil, err
		}
		if paymentConfirmed.Valid {
			order.PaymentConfirmedAt = &paymentConfirmed.Time
		}
		if updatedAt.Valid {
			order.UpdatedAt = updatedAt.Time
		} else {
			order.UpdatedAt = order.CreatedAt
		}
		orders = append(orders, order)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}

	for index := range orders {
		items, err := h.fetchOrderItems(orders[index].ID)
		if err != nil {
			return nil, err
		}
		orders[index].Items = items
	}

	return orders, nil
}

func (h *AdminDataHandler) fetchOrderItems(orderID int64) ([]models.OrderItem, error) {
	rows, err := store.Query(h.db, `
		SELECT id, order_id, product_id, name, price, quantity, size, color
		FROM order_items
		WHERE order_id = ?
		ORDER BY id ASC
	`, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := []models.OrderItem{}
	for rows.Next() {
		var item models.OrderItem
		if err := rows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.Name,
			&item.Price, &item.Quantity, &item.Size, &item.Color,
		); err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}
