package middleware

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Logger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path

		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		log.Printf("[%s] %3d | %13v | %s | %s",
			c.Request.Method,
			status,
			latency,
			c.ClientIP(),
			path,
		)
	}
}

func SecureHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {

		c.Header("X-Frame-Options", "DENY")

		c.Header("X-XSS-Protection", "1; mode=block")

		c.Header("X-Content-Type-Options", "nosniff")

		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		c.Header("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline'; "+
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com; "+
				"img-src 'self' data: blob:; "+
				"connect-src 'self' http://localhost:* http://127.0.0.1:*",
		)

		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

		c.Next()
	}
}

func CORS(allowedOrigin string) gin.HandlerFunc {
	allowedOrigins := map[string]bool{}
	for _, origin := range strings.Split(allowedOrigin, ",") {
		origin = strings.TrimSpace(origin)
		if origin != "" {
			allowedOrigins[origin] = true
		}
	}

	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
			c.Header("Access-Control-Expose-Headers", "X-CSRF-Token")
			c.Header("Access-Control-Max-Age", "86400")
		}

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {

		tokenStr, err := c.Cookie("shiv_session")
		if err != nil {

			authHeader := c.GetHeader("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error":   "authentication_required",
					"message": "Valid session required. Please login.",
				})
				return
			}
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {

			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return []byte(secret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_token",
				"message": "Session expired or invalid. Please login again.",
			})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_claims",
				"message": "Malformed token payload.",
			})
			return
		}

		userID, ok := claimInt64(claims, "user_id")
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_claims",
				"message": "Malformed user id in token.",
			})
			return
		}
		email, ok := claims["email"].(string)
		if !ok || strings.TrimSpace(email) == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_claims",
				"message": "Malformed email in token.",
			})
			return
		}

		c.Set("user_id", userID)
		c.Set("email", email)
		if role, ok := claims["role"].(string); ok {
			c.Set("role", role)
		}

		c.Next()
	}
}

func claimInt64(claims jwt.MapClaims, key string) (int64, bool) {
	value, exists := claims[key]
	if !exists {
		return 0, false
	}
	switch typed := value.(type) {
	case float64:
		id := int64(typed)
		return id, typed > 0 && float64(id) == typed
	case int64:
		return typed, typed > 0
	case int:
		return int64(typed), typed > 0
	default:
		return 0, false
	}
}

func AdminOnly() gin.HandlerFunc {
	return func(c *gin.Context) {
		role := c.GetString("role")
		if role != "admin" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "admin_required",
				"message": "Admin access required.",
			})
			return
		}
		c.Next()
	}
}

var csrfTokens = struct {
	sync.RWMutex
	tokens map[string]time.Time
}{tokens: make(map[string]time.Time)}

func GenerateCSRFToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		log.Printf("CSRF token generation error: %v", err)
		return ""
	}
	token := hex.EncodeToString(b)

	csrfTokens.Lock()
	csrfTokens.tokens[token] = time.Now().Add(1 * time.Hour)
	csrfTokens.Unlock()

	go cleanupCSRFTokens()

	return token
}

func cleanupCSRFTokens() {
	csrfTokens.Lock()
	defer csrfTokens.Unlock()
	now := time.Now()
	for token, expiry := range csrfTokens.tokens {
		if now.After(expiry) {
			delete(csrfTokens.tokens, token)
		}
	}
}

func CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {

		if c.Request.Method == "GET" || c.Request.Method == "HEAD" || c.Request.Method == "OPTIONS" {
			c.Next()
			return
		}

		token := c.GetHeader("X-CSRF-Token")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "csrf_missing",
				"message": "CSRF token is required for this operation.",
			})
			return
		}

		csrfTokens.RLock()
		expiry, exists := csrfTokens.tokens[token]
		csrfTokens.RUnlock()

		if !exists || time.Now().After(expiry) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":   "csrf_invalid",
				"message": "CSRF token is invalid or expired. Please refresh.",
			})
			return
		}

		csrfTokens.Lock()
		delete(csrfTokens.tokens, token)
		csrfTokens.Unlock()

		c.Next()
	}
}

type rateLimiterEntry struct {
	count   int
	resetAt time.Time
}

func RateLimiter(maxRequests int, windowSecs int) gin.HandlerFunc {
	var (
		mu      sync.Mutex
		clients = make(map[string]*rateLimiterEntry)
	)

	go func() {
		for {
			time.Sleep(time.Duration(windowSecs) * time.Second)
			mu.Lock()
			now := time.Now()
			for ip, entry := range clients {
				if now.After(entry.resetAt) {
					delete(clients, ip)
				}
			}
			mu.Unlock()
		}
	}()

	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		entry, exists := clients[ip]
		if !exists || time.Now().After(entry.resetAt) {
			clients[ip] = &rateLimiterEntry{
				count:   1,
				resetAt: time.Now().Add(time.Duration(windowSecs) * time.Second),
			}
			mu.Unlock()
			c.Next()
			return
		}

		entry.count++
		if entry.count > maxRequests {
			mu.Unlock()
			retryAfter := time.Until(entry.resetAt).Seconds()
			c.Header("Retry-After", fmt.Sprintf("%.0f", retryAfter))
			c.AbortWithStatusJSON(http.StatusTooManyRequests, gin.H{
				"error":       "rate_limit_exceeded",
				"message":     "Too many requests. Please slow down.",
				"retry_after": fmt.Sprintf("%.0fs", retryAfter),
			})
			return
		}
		mu.Unlock()

		c.Next()
	}
}
