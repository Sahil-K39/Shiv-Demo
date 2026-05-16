/*
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * SHIV SHAKTI PROJECT — Security Middleware
 * middleware.go — CORS, JWT Auth, CSRF, Rate Limiter, Secure Headers
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 */

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. STRUCTURED REQUEST LOGGER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Logger returns middleware that logs each request with timing info.
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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SECURE HTTP HEADERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// SecureHeaders injects industry-standard security headers into every response.
// Prevents clickjacking, XSS, MIME sniffing, and enforces HTTPS.
func SecureHeaders() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Prevent the page from being embedded in iframes (anti-clickjacking)
		c.Header("X-Frame-Options", "DENY")

		// Enable XSS filtering in the browser
		c.Header("X-XSS-Protection", "1; mode=block")

		// Prevent MIME type sniffing (forces declared Content-Type)
		c.Header("X-Content-Type-Options", "nosniff")

		// Referrer policy — only send origin on cross-origin requests
		c.Header("Referrer-Policy", "strict-origin-when-cross-origin")

		// Permissions policy — disable unnecessary browser features
		c.Header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")

		// Content Security Policy — restrict resource loading
		c.Header("Content-Security-Policy",
			"default-src 'self'; "+
				"script-src 'self' 'unsafe-inline'; "+
				"style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "+
				"font-src 'self' https://fonts.gstatic.com; "+
				"img-src 'self' data: blob:; "+
				"connect-src 'self' http://localhost:*",
		)

		// Strict Transport Security — force HTTPS for 1 year
		c.Header("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload")

		c.Next()
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. CORS — Cross-Origin Resource Sharing
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// CORS returns middleware that restricts API access to the specified origin.
// Only the Next.js frontend origin is allowed to make requests.
func CORS(allowedOrigin string) gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.GetHeader("Origin")

		// Only allow requests from the exact frontend origin
		if origin == allowedOrigin {
			c.Header("Access-Control-Allow-Origin", allowedOrigin)
			c.Header("Access-Control-Allow-Credentials", "true")
			c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-CSRF-Token")
			c.Header("Access-Control-Expose-Headers", "X-CSRF-Token")
			c.Header("Access-Control-Max-Age", "86400") // Cache preflight for 24h
		}

		// Handle preflight OPTIONS requests
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. JWT AUTHENTICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// JWTAuth validates the JWT token from the HttpOnly cookie.
// On success, it injects user_id and email into the request context.
func JWTAuth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Extract JWT from HttpOnly cookie (more secure than Authorization header)
		tokenStr, err := c.Cookie("shiv_session")
		if err != nil {
			// Fallback: check Authorization header for API clients
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

		// Parse and validate the JWT
		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			// Verify signing method is HMAC (prevent algorithm confusion attacks)
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

		// Extract claims and inject into context
		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error":   "invalid_claims",
				"message": "Malformed token payload.",
			})
			return
		}

		// Inject user data into request context for downstream handlers
		c.Set("user_id", int64(claims["user_id"].(float64)))
		c.Set("email", claims["email"].(string))

		c.Next()
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. CSRF PROTECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// csrfTokens stores valid tokens in-memory with expiration.
var csrfTokens = struct {
	sync.RWMutex
	tokens map[string]time.Time
}{tokens: make(map[string]time.Time)}

// GenerateCSRFToken creates a cryptographically random 32-byte hex token.
func GenerateCSRFToken() string {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		log.Printf("CSRF token generation error: %v", err)
		return ""
	}
	token := hex.EncodeToString(b)

	csrfTokens.Lock()
	csrfTokens.tokens[token] = time.Now().Add(1 * time.Hour) // 1-hour expiry
	csrfTokens.Unlock()

	// Cleanup expired tokens periodically
	go cleanupCSRFTokens()

	return token
}

// cleanupCSRFTokens removes expired CSRF tokens from the store.
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

// CSRFProtection validates the X-CSRF-Token header on state-changing requests.
func CSRFProtection() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only enforce on state-changing methods
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

		// Validate token exists and hasn't expired
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

		// Invalidate token after single use (prevents replay attacks)
		csrfTokens.Lock()
		delete(csrfTokens.tokens, token)
		csrfTokens.Unlock()

		c.Next()
	}
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 6. RATE LIMITER (Token Bucket per IP)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// rateLimiterEntry tracks request count per IP within a time window.
type rateLimiterEntry struct {
	count    int
	resetAt  time.Time
}

// RateLimiter restricts requests per IP within a sliding window.
// maxRequests: maximum allowed requests per window.
// windowSecs: duration of the window in seconds.
func RateLimiter(maxRequests int, windowSecs int) gin.HandlerFunc {
	var (
		mu      sync.Mutex
		clients = make(map[string]*rateLimiterEntry)
	)

	// Background cleanup goroutine
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
