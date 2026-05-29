package handlers

import (
	"database/sql"
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
	if status == "confirmed" {
		result, err = store.Exec(h.db, `
			UPDATE orders
			SET status = ?, payment_reference = ?, payment_confirmed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`, status, paymentReference, id)
	} else if paymentReference != "" {
		result, err = store.Exec(h.db, `
			UPDATE orders
			SET status = ?, payment_reference = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`, status, paymentReference, id)
	} else {
		result, err = store.Exec(h.db, `
			UPDATE orders
			SET status = ?, updated_at = CURRENT_TIMESTAMP
			WHERE id = ?
		`, status, id)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "order_update_failed", "message": err.Error()})
		return
	}
	if affected, err := result.RowsAffected(); err == nil && affected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "order_not_found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Order updated"})
}

func validOrderStatus(status string) bool {
	switch status {
	case "pending", "payment_pending", "confirmed", "shipped", "delivered", "cancelled", "refunded":
		return true
	default:
		return false
	}
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
