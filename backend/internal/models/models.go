

package models

import "time"



type User struct {
	ID           int64     `json:"id"`
	Email        string    `json:"email" binding:"required,email"`
	PasswordHash string    `json:"-"` 
	Name         string    `json:"name" binding:"required,min=2,max=100"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}


type RegisterInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8,max=128"`
	Name     string `json:"name" binding:"required,min=2,max=100"`
}


type LoginInput struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}



type Product struct {
	ID          int64     `json:"id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Price       float64   `json:"price"`
	SalePrice   float64   `json:"sale_price"` 
	IsOnSale    bool      `json:"is_on_sale"` 
	Currency    string    `json:"currency"`
	Category    string    `json:"category"` 
	Collection  string    `json:"collection"`
	Sizes       string    `json:"sizes"` 
	Colors      string    `json:"colors"` 
	Images      string    `json:"images"` 
	InStock     bool      `json:"in_stock"`
	Featured    bool      `json:"featured"`
	CreatedAt   time.Time `json:"created_at"`
}


type ProductInput struct {
	Name        string  `json:"name" binding:"required"`
	Slug        string  `json:"slug" binding:"required"`
	Description string  `json:"description"`
	Price       float64 `json:"price" binding:"required"`
	SalePrice   float64 `json:"sale_price"`
	IsOnSale    bool    `json:"is_on_sale"`
	Category    string  `json:"category" binding:"required"`
	Collection  string  `json:"collection"`
	Sizes       string  `json:"sizes"`
	Colors      string  `json:"colors"`
	Images      string  `json:"images"`
	InStock     bool    `json:"in_stock"`
	Featured    bool    `json:"featured"`
}



type CartItem struct {
	ID        int64   `json:"id"`
	UserID    int64   `json:"user_id"`
	ProductID int64   `json:"product_id"`
	Quantity  int     `json:"quantity" binding:"required,min=1,max=10"`
	Size      string  `json:"size" binding:"required"`
	Color     string  `json:"color"`
	
	Product *Product `json:"product,omitempty"`
}


type AddToCartInput struct {
	ProductID int64  `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=10"`
	Size      string `json:"size" binding:"required"`
	Color     string `json:"color"`
}


type UpdateCartInput struct {
	Quantity int `json:"quantity" binding:"required,min=0,max=10"`
}



type Order struct {
	ID         int64       `json:"id"`
	UserID     int64       `json:"user_id"`
	Items      []OrderItem `json:"items"`
	TotalPrice float64     `json:"total_price"`
	Status     string      `json:"status"` 
	CreatedAt  time.Time   `json:"created_at"`
}


type OrderItem struct {
	ID        int64   `json:"id"`
	OrderID   int64   `json:"order_id"`
	ProductID int64   `json:"product_id"`
	Name      string  `json:"name"`
	Price     float64 `json:"price"`
	Quantity  int     `json:"quantity"`
	Size      string  `json:"size"`
	Color     string  `json:"color"`
}



type CommunityPost struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Email     string    `json:"email"`
	Title     string    `json:"title" binding:"required,min=3,max=200"`
	Body      string    `json:"body" binding:"required,min=10,max=2000"`
	Category  string    `json:"category" binding:"required"`
	Likes     int       `json:"likes"`
	CreatedAt time.Time `json:"created_at"`
}


type CreatePostInput struct {
	Title    string `json:"title" binding:"required,min=3,max=200"`
	Body     string `json:"body" binding:"required,min=10,max=2000"`
	Category string `json:"category" binding:"required,oneof=STYLE DROPS GENERAL LOOKBOOK"`
}



type TokenClaims struct {
	UserID int64  `json:"user_id"`
	Email  string `json:"email"`
}
