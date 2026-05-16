package main

import (
	"log"
	"net/http"
	"os"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/handlers"
	"shiv-shakti/internal/middleware"
	"shiv-shakti/internal/models"
	"shiv-shakti/internal/store"

	"github.com/gin-gonic/gin"
)

func main() {
	// Load Configuration
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "shiv-shakti-dev-secret-change-in-production-2026"
	}

	// Initialize Database
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./shiv_shakti.db"
	}
	db, err := store.InitDB(dbPath)
	if err != nil {
		log.Fatalf("✗ Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Seed initial product data if empty
	store.SeedProducts(db)

	// Initialize Auth Service
	authService := auth.NewService(jwtSecret, db)

	// Initialize Handlers
	productHandler := handlers.NewProductHandler(db)
	cartHandler := handlers.NewCartHandler(db)
	orderHandler := handlers.NewOrderHandler(db)
	authHandler := handlers.NewAuthHandler(authService)
	communityHandler := handlers.NewCommunityHandler(db)

	// Configure Gin Router
	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()

	// Global Middleware Stack
	r.Use(gin.Recovery())                                      // Panic recovery
	r.Use(middleware.Logger())                                  // Structured request logging
	r.Use(middleware.SecureHeaders())                           // HSTS, X-Frame, CSP, etc.
	
	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000"
	}
	r.Use(middleware.CORS(corsOrigin))                          // Configurable CORS
	r.Use(middleware.RateLimiter(100, 60))                     // 100 req/min global limit

	// Root Route
	r.GET("/", func(c *gin.Context) {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHIV SHAKTI — API</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #0d0d0d;
            color: #f5f5f7;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
        }
        .container {
            max-width: 600px;
            padding: 2.5rem;
            border: 1px solid #262626;
            background-color: #141414;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        h1 {
            font-weight: 300;
            letter-spacing: 0.15em;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            font-size: 1.8rem;
        }
        p {
            color: #86868b;
            font-size: 0.9rem;
            margin-bottom: 2rem;
            letter-spacing: 0.05em;
        }
        .status {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background-color: #1c1c1e;
            padding: 0.6rem 1.2rem;
            border-radius: 20px;
            font-size: 0.8rem;
            border: 1px solid #3a3a3c;
            font-weight: 500;
        }
        .dot {
            width: 8px;
            height: 8px;
            background-color: #30d158;
            border-radius: 50%;
            box-shadow: 0 0 8px #30d158;
        }
        .links {
            margin-top: 2.5rem;
            display: flex;
            gap: 1.5rem;
            justify-content: center;
        }
        a {
            color: #0a84ff;
            text-decoration: none;
            font-size: 0.85rem;
            transition: color 0.2s;
            border-bottom: 1px solid transparent;
        }
        a:hover {
            color: #2997ff;
            border-bottom-color: #2997ff;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Shiv Shakti</h1>
        <p>Commerce Engine v2.0</p>
        <div class="status">
            <div class="dot"></div>
            <span>System Operational</span>
        </div>
        <div class="links">
            <a href="/health">Health Check</a>
            <a href="/api/products">Products API</a>
        </div>
    </div>
</body>
</html>`))
	})

	// Health Check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "operational",
			"service": "shiv-shakti-commerce-engine",
			"version": "2.0.0",
		})
	})

	// Public API Routes
	api := r.Group("/api")
	{
		// Authentication routes — rate-limited more aggressively
		authGroup := api.Group("/auth")
		authGroup.Use(middleware.RateLimiter(10, 60)) // 10 req/min for auth
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
		}

		// Product routes — publicly accessible
		products := api.Group("/products")
		{
			products.GET("", productHandler.ListAll)
			products.GET("/:id", productHandler.GetByID)
			products.GET("/category/:category", productHandler.GetByCategory)
		}

		// Community read routes — publicly accessible
		community := api.Group("/community")
		{
			community.GET("/posts", communityHandler.ListPosts)
		}
	}

	// Protected API Routes
	protected := r.Group("/api")
	protected.Use(middleware.JWTAuth(jwtSecret))
	{
		// Current user info
		protected.GET("/auth/me", authHandler.Me)

		// Cart operations — require CSRF token for mutations
		cart := protected.Group("/cart")
		cart.Use(middleware.CSRFProtection())
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("/add", cartHandler.AddItem)
			cart.PUT("/update", cartHandler.UpdateItem)
			cart.DELETE("/remove/:itemId", cartHandler.RemoveItem)
		}

		// Checkout — heavily rate-limited + CSRF
		checkout := protected.Group("/checkout")
		checkout.Use(middleware.RateLimiter(5, 60)) // 5 checkouts/min max
		checkout.Use(middleware.CSRFProtection())
		{
			checkout.POST("", orderHandler.CreateOrder)
		}

		// Order history
		protected.GET("/orders", orderHandler.ListOrders)

		// Community write operations — CSRF protected
		communityWrite := protected.Group("/community")
		communityWrite.Use(middleware.CSRFProtection())
		{
			communityWrite.POST("/post", communityHandler.CreatePost)
			communityWrite.POST("/like", communityHandler.LikePost)
		}

		// Admin Product Management (JWT + CSRF)
		adminProducts := protected.Group("/admin/products")
		adminProducts.Use(middleware.CSRFProtection())
		{
			adminProducts.POST("", productHandler.CreateProduct)
			adminProducts.PUT("/:id", productHandler.UpdateProduct)
			adminProducts.DELETE("/:id", productHandler.DeleteProduct)
		}

		// CSRF token endpoint — returns a fresh token
		protected.GET("/csrf-token", func(c *gin.Context) {
			token := middleware.GenerateCSRFToken()
			c.JSON(http.StatusOK, gin.H{"csrf_token": token})
		})
	}

	// Serve Static Assets
	r.Static("/assets", "./assets")

	// Start Server
	log.Printf("✓ API running on http://localhost:%s", port)
	log.Println("✓ JWT Authentication enabled")
	log.Println("✓ CSRF Protection active")
	log.Println("✓ Rate Limiting enforced")
	log.Println("✓ Secure HTTP headers set")

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("✗ Server failed to start: %v", err)
	}
}

// Models Registration
// This init function ensures models are registered at compile time.
func init() {
	_ = models.User{}
	_ = models.Product{}
	_ = models.CartItem{}
	_ = models.Order{}
}
