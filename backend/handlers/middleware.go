package handlers

import (
	"context"

	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"

	"fearstaff-api/config"
)

type contextKey string

const (
	UserContextKey contextKey = "user"
)

type JWTClaims struct {
	DiscordID   string   `json:"discord_id"`
	Username    string   `json:"username"`
	Level       int      `json:"level"`
	StaffGroup  string   `json:"staff_group"`
	Permissions []string `json:"permissions"`
	jwt.RegisteredClaims
}

func GenerateJWT(cfg *config.Config, discordID, username, staffGroup string, level int, permissions []string) (string, error) {
	claims := JWTClaims{
		DiscordID:   discordID,
		Username:    username,
		Level:       level,
		StaffGroup:  staffGroup,
		Permissions: permissions,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "fearstaff",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(cfg.JWTSecret))
}

func ParseJWT(cfg *config.Config, tokenStr string) (*JWTClaims, error) {
	token, err := jwt.ParseWithClaims(tokenStr, &JWTClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(cfg.JWTSecret), nil
	})
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JWTClaims); ok && token.Valid {
		return claims, nil
	}
	return nil, jwt.ErrTokenInvalidClaims
}

func AuthMiddleware(cfg *config.Config, next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			http.Error(w, `{"error":"invalid token format"}`, http.StatusUnauthorized)
			return
		}

		claims, err := ParseJWT(cfg, tokenStr)
		if err != nil {
			http.Error(w, `{"error":"invalid token"}`, http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), UserContextKey, claims)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func OptionalAuth(cfg *config.Config, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader != "" {
			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			if claims, err := ParseJWT(cfg, tokenStr); err == nil {
				ctx := context.WithValue(r.Context(), UserContextKey, claims)
				next(w, r.WithContext(ctx))
				return
			}
		}
		next(w, r)
	}
}

func RequirePermission(permission string, next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		claims, ok := r.Context().Value(UserContextKey).(*JWTClaims)
		if !ok {
			http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
			return
		}

		for _, p := range claims.Permissions {
			if p == permission || p == "staff.manage" {
				next(w, r)
				return
			}
		}

		http.Error(w, `{"error":"forbidden","message":"insufficient permissions"}`, http.StatusForbidden)
	}
}
