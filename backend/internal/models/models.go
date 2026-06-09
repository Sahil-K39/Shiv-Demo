package models

import "time"

type User struct {
	ID                int64      `json:"id"`
	Email             string     `json:"email" binding:"required,email"`
	PasswordHash      string     `json:"-"`
	Name              string     `json:"name" binding:"required,min=2,max=100"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`
	IsVerified        bool       `json:"is_verified"`
	VerificationToken string     `json:"verification_token"`
	Role              string     `json:"role"`
	LastLoginAt       *time.Time `json:"last_login_at"`
	LoginCount        int        `json:"login_count"`
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
	ID            int64      `json:"id"`
	Name          string     `json:"name"`
	Slug          string     `json:"slug"`
	Description   string     `json:"description"`
	Price         float64    `json:"price"`
	SalePrice     float64    `json:"sale_price"`
	IsOnSale      bool       `json:"is_on_sale"`
	Currency      string     `json:"currency"`
	Category      string     `json:"category"`
	Collection    string     `json:"collection"`
	Sizes         string     `json:"sizes"`
	Colors        string     `json:"colors"`
	Images        string     `json:"images"`
	InStock       bool       `json:"in_stock"`
	Featured      bool       `json:"featured"`
	Quantity      int        `json:"quantity"`
	SKU           string     `json:"sku"`
	IsFeatured    bool       `json:"is_featured"`
	IsActive      bool       `json:"is_active"`
	SaleActive    bool       `json:"sale_active"`
	SaleStartDate *time.Time `json:"sale_start_date"`
	SaleEndDate   *time.Time `json:"sale_end_date"`
	CreatedAt     time.Time  `json:"created_at"`
	UpdatedAt     time.Time  `json:"updated_at"`
}

type ProductInput struct {
	Name          string     `json:"name" binding:"required,min=2,max=180"`
	Slug          string     `json:"slug"`
	Description   string     `json:"description" binding:"max=4000"`
	Price         float64    `json:"price" binding:"required,min=0"`
	SalePrice     float64    `json:"sale_price" binding:"min=0"`
	IsOnSale      bool       `json:"is_on_sale"`
	Category      string     `json:"category" binding:"required,max=80"`
	Collection    string     `json:"collection"`
	Sizes         string     `json:"sizes"`
	Colors        string     `json:"colors"`
	Images        string     `json:"images"`
	InStock       bool       `json:"in_stock"`
	Featured      bool       `json:"featured"`
	Quantity      int        `json:"quantity" binding:"min=0,max=100000"`
	SKU           string     `json:"sku" binding:"required,min=2,max=120"`
	IsFeatured    bool       `json:"is_featured"`
	IsActive      bool       `json:"is_active"`
	SaleActive    bool       `json:"sale_active"`
	SaleStartDate *time.Time `json:"sale_start_date"`
	SaleEndDate   *time.Time `json:"sale_end_date"`
}

type CartItem struct {
	ID        int64  `json:"id"`
	UserID    int64  `json:"user_id"`
	ProductID int64  `json:"product_id"`
	Quantity  int    `json:"quantity" binding:"required,min=1,max=500"`
	Size      string `json:"size" binding:"required"`
	Color     string `json:"color"`

	Product *Product `json:"product,omitempty"`
}

type AddToCartInput struct {
	ProductID int64  `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=50,max=500"`
	Size      string `json:"size" binding:"required"`
	Color     string `json:"color"`
}

type UpdateCartInput struct {
	Quantity int `json:"quantity" binding:"required,min=0,max=500"`
}

type Order struct {
	ID                 int64       `json:"id"`
	UserID             int64       `json:"user_id"`
	Items              []OrderItem `json:"items"`
	TotalPrice         float64     `json:"total_price"`
	Status             string      `json:"status"`
	ShippingName       string      `json:"shipping_name"`
	ShippingAddress    string      `json:"shipping_address"`
	ShippingCity       string      `json:"shipping_city"`
	ShippingState      string      `json:"shipping_state"`
	ShippingZip        string      `json:"shipping_zip"`
	ShippingCountry    string      `json:"shipping_country"`
	ShippingPhone      string      `json:"shipping_phone"`
	PaymentReference   string      `json:"payment_reference"`
	PaymentConfirmedAt *time.Time  `json:"payment_confirmed_at"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
}

type CheckoutInput struct {
	ShippingName    string `json:"shipping_name" binding:"required,min=2,max=100"`
	ShippingAddress string `json:"shipping_address" binding:"required,min=5,max=200"`
	ShippingCity    string `json:"shipping_city" binding:"required,min=2,max=100"`
	ShippingState   string `json:"shipping_state" binding:"required,min=2,max=100"`
	ShippingZip     string `json:"shipping_zip" binding:"required,min=3,max=20"`
	ShippingCountry string `json:"shipping_country" binding:"required,min=2,max=100"`
	ShippingPhone   string `json:"shipping_phone" binding:"required,min=5,max=20"`
}

type NGOInterestInput struct {
	Name    string `json:"name" binding:"required,min=2,max=100"`
	Email   string `json:"email" binding:"required,email"`
	Phone   string `json:"phone" binding:"required,min=5,max=20"`
	Message string `json:"message" binding:"max=1000"`
}

type NGOInterest struct {
	ID        int64     `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Phone     string    `json:"phone"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type AdminUser struct {
	ID          int64      `json:"id"`
	Email       string     `json:"email"`
	Name        string     `json:"name"`
	Role        string     `json:"role"`
	IsVerified  bool       `json:"is_verified"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at"`
	LoginCount  int        `json:"login_count"`
}

type AdminOrder struct {
	ID                 int64       `json:"id"`
	UserID             int64       `json:"user_id"`
	UserEmail          string      `json:"user_email"`
	UserName           string      `json:"user_name"`
	Items              []OrderItem `json:"items"`
	TotalPrice         float64     `json:"total_price"`
	Status             string      `json:"status"`
	ShippingName       string      `json:"shipping_name"`
	ShippingAddress    string      `json:"shipping_address"`
	ShippingCity       string      `json:"shipping_city"`
	ShippingState      string      `json:"shipping_state"`
	ShippingZip        string      `json:"shipping_zip"`
	ShippingCountry    string      `json:"shipping_country"`
	ShippingPhone      string      `json:"shipping_phone"`
	PaymentReference   string      `json:"payment_reference"`
	PaymentConfirmedAt *time.Time  `json:"payment_confirmed_at"`
	CreatedAt          time.Time   `json:"created_at"`
	UpdatedAt          time.Time   `json:"updated_at"`
}

type UpdateOrderStatusInput struct {
	Status           string `json:"status" binding:"required"`
	PaymentReference string `json:"payment_reference" binding:"max=160"`
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
