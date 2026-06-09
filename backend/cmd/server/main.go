package main

import (
	"log"
	"net/http"
	"os"
	"strings"

	"shiv-shakti/internal/auth"
	"shiv-shakti/internal/handlers"
	"shiv-shakti/internal/middleware"
	"shiv-shakti/internal/store"

	"github.com/gin-gonic/gin"
	"github.com/resend/resend-go/v3"
)

func main() {

	appEnv := strings.ToLower(strings.TrimSpace(os.Getenv("APP_ENV")))
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		if appEnv == "production" {
			log.Fatal("✗ APP_ENV=production requires JWT_SECRET")
		}
		jwtSecret = "shiv-shakti-dev-secret-change-in-production-2026"
	}
	if appEnv == "production" && (jwtSecret == "shiv-shakti-dev-secret-change-in-production-2026" || len(jwtSecret) < 32) {
		log.Fatal("✗ APP_ENV=production requires a strong JWT_SECRET with at least 32 characters")
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "./shiv_shakti.db"
	}
	if appEnv == "production" && os.Getenv("DATABASE_URL") == "" {
		log.Fatal("✗ APP_ENV=production requires DATABASE_URL for PostgreSQL")
	}
	db, err := store.InitDB(dbPath)
	if err != nil {
		log.Fatalf("✗ Failed to initialize database: %v", err)
	}
	defer db.Close()

	store.SeedProducts(db)

	authService := auth.NewService(jwtSecret, db)
	authService.EnsureAdminFromEnv()

	productHandler := handlers.NewProductHandler(db)
	cartHandler := handlers.NewCartHandler(db)
	orderHandler := handlers.NewOrderHandler(db)
	authHandler := handlers.NewAuthHandler(authService)
	communityHandler := handlers.NewCommunityHandler(db)
	ngoHandler := handlers.NewNGOHandler(db)
	adminDataHandler := handlers.NewAdminDataHandler(db)
	adminUploadHandler := handlers.NewAdminUploadHandler()

	if os.Getenv("GIN_MODE") == "" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()

	r.Use(gin.Recovery())
	r.Use(middleware.Logger())
	r.Use(middleware.SecureHeaders())

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:3000,http://127.0.0.1:3000"
	}
	r.Use(middleware.CORS(corsOrigin))
	r.Use(middleware.RateLimiter(100, 60))
	r.MaxMultipartMemory = 32 << 20

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

	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":  "operational",
			"service": "shiv-shakti-commerce-engine",
			"version": "2.0.0",
		})
	})

	r.POST("/send-email", func(c *gin.Context) {
		if os.Getenv("ENABLE_DEMO_EMAIL") != "true" {
			c.JSON(http.StatusNotFound, gin.H{"error": "not_found"})
			return
		}
		to := os.Getenv("RESEND_TEST_TO")
		if to == "" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "missing_resend_test_to"})
			return
		}
		from := os.Getenv("RESEND_FROM")
		if from == "" {
			from = "onboarding@resend.dev"
		}
		client := resend.NewClient(os.Getenv("RESEND_API_KEY"))
		params := &resend.SendEmailRequest{
			From:    from,
			To:      []string{to},
			Subject: "Demo Email",
			Html:    "<p>Congrats on sending your <strong>first email</strong>!</p>",
		}
		sent, err := client.Emails.Send(params)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "email sent", "id": sent.Id})
	})

	api := r.Group("/api")
	{

		authGroup := api.Group("/auth")
		authGroup.Use(middleware.RateLimiter(10, 60))
		{
			authGroup.POST("/register", authHandler.Register)
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/logout", authHandler.Logout)
			authGroup.GET("/verify", authHandler.Verify)
		}

		products := api.Group("/products")
		{
			products.GET("", productHandler.ListAll)
			products.GET("/:id", productHandler.GetByID)
			products.GET("/category/:category", productHandler.GetByCategory)
		}

		community := api.Group("/community")
		{
			community.GET("/posts", communityHandler.ListPosts)
		}

		ngo := api.Group("/ngo")
		ngo.Use(middleware.RateLimiter(10, 60))
		{
			ngo.POST("/interest", ngoHandler.CreateInterest)
		}
	}

	admin := r.Group("/admin")
	{
		admin.POST("/login", authHandler.AdminLogin)
	}

	protectedAdmin := r.Group("/admin")
	protectedAdmin.Use(middleware.JWTAuth(jwtSecret))
	protectedAdmin.Use(middleware.AdminOnly())
	protectedAdmin.Use(middleware.CSRFProtection())
	{
		protectedAdmin.GET("/me", authHandler.Me)
		protectedAdmin.GET("/dashboard", productHandler.Dashboard)
		protectedAdmin.GET("/products", productHandler.ListAdmin)
		protectedAdmin.GET("/products/:id", productHandler.GetByID)
		protectedAdmin.POST("/products", productHandler.CreateProduct)
		protectedAdmin.PUT("/products/:id", productHandler.UpdateProduct)
		protectedAdmin.DELETE("/products/:id", productHandler.DeleteProduct)
		protectedAdmin.GET("/users", adminDataHandler.ListUsers)
		protectedAdmin.GET("/ngo-interests", adminDataHandler.ListNGOInterests)
		protectedAdmin.GET("/orders", adminDataHandler.ListOrders)
		protectedAdmin.GET("/orders/:id", adminDataHandler.GetOrder)
		protectedAdmin.PUT("/orders/:id/status", adminDataHandler.UpdateOrderStatus)
		protectedAdmin.POST("/uploads/images", adminUploadHandler.UploadImages)
	}

	protected := r.Group("/api")
	protected.Use(middleware.JWTAuth(jwtSecret))
	{

		protected.GET("/auth/me", authHandler.Me)

		cart := protected.Group("/cart")
		cart.Use(middleware.CSRFProtection())
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("/add", cartHandler.AddItem)
			cart.PUT("/update", cartHandler.UpdateItem)
			cart.DELETE("/remove/:itemId", cartHandler.RemoveItem)
		}

		checkout := protected.Group("/checkout")
		checkout.Use(middleware.RateLimiter(5, 60))
		checkout.Use(middleware.CSRFProtection())
		{
			checkout.POST("", orderHandler.CreateOrder)
		}

		protected.GET("/orders", orderHandler.ListOrders)

		communityWrite := protected.Group("/community")
		communityWrite.Use(middleware.CSRFProtection())
		{
			communityWrite.POST("/post", communityHandler.CreatePost)
			communityWrite.POST("/like", communityHandler.LikePost)
		}

		protected.GET("/csrf-token", func(c *gin.Context) {
			token := middleware.GenerateCSRFToken()
			c.JSON(http.StatusOK, gin.H{"csrf_token": token})
		})
	}

	assetsDir := os.Getenv("ASSETS_DIR")
	if assetsDir == "" {
		assetsDir = "./assets"
	}
	r.Static("/assets", assetsDir)

	log.Printf("✓ API running on http://localhost:%s", port)
	log.Println("✓ JWT Authentication enabled")
	log.Println("✓ CSRF Protection active")
	log.Println("✓ Rate Limiting enforced")
	log.Println("✓ Secure HTTP headers set")

	if err := r.Run(":" + port); err != nil {
		log.Fatalf("✗ Server failed to start: %v", err)
	}
}

// init function removed
