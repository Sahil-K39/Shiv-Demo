package internal

import (
    "github.com/gin-gonic/gin"
)

// JSONResponse writes a standardized JSON payload.
func JSONResponse(c *gin.Context, status int, payload interface{}) {
    c.JSON(status, payload)
}

// ErrorResponse writes a standardized error payload.
func ErrorResponse(c *gin.Context, status int, message string) {
    c.JSON(status, gin.H{"error": message})
}
