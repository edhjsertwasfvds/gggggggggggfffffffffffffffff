package config

import (
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	DiscordClientID     string
	DiscordClientSecret string
	DiscordBotToken     string
	DiscordRedirectURL  string
	DiscordGuildID      string
	JWTSecret           string
	DatabaseURL         string
	FrontendURL         string
	Port                string

	RoleMap map[string]RolePermission
}

type RolePermission struct {
	Level       int      `json:"level"`
	RoleName    string   `json:"role_name"`
	RoleID      string   `json:"role_id"`
	Permissions []string `json:"permissions"`
}

func Load() *Config {
	_ = godotenv.Load()

	cfg := &Config{
		DiscordClientID:     getEnv("DISCORD_CLIENT_ID", "1502816475847594116"),
		DiscordClientSecret: getEnv("DISCORD_CLIENT_SECRET", "chsgcJ0x0eBkGcLuWkQKuw6qpLcZoU_K"),
		DiscordBotToken:     getEnv("DISCORD_BOT_TOKEN", ""),
		DiscordRedirectURL:  getEnv("DISCORD_REDIRECT_URL", "http://localhost:8080/api/auth/callback"),
		DiscordGuildID:      getEnv("DISCORD_GUILD_ID", "1501738174811082965"),
		JWTSecret:           getEnv("JWT_SECRET", "fearstaff-jwt-secret-2024"),
		DatabaseURL:         getEnv("DATABASE_URL", ""),
		FrontendURL:         getEnv("FRONTEND_URL", "http://localhost:5173"),
		Port:                getEnv("PORT", "8080"),
	}

	cfg.RoleMap = map[string]RolePermission{
		"OWNER": {
			Level:    5,
			RoleName: "Владелец",
			RoleID:   getEnv("DISCORD_ROLE_OWNER", "1507436855921082468"),
			Permissions: []string{
				"staff.manage", "staff.view", "punishments.manage", "punishments.view",
				"dashboard.admin", "settings.manage", "users.manage", "reports.view",
				"logs.view", "announcements.create",
			},
		},
		"OWNER_ALT": {
			Level:    5,
			RoleName: "Владелец (Alt)",
			RoleID:   getEnv("DISCORD_ROLE_OWNER_ALT", "1501738368026017912"),
			Permissions: []string{
				"staff.manage", "staff.view", "punishments.manage", "punishments.view",
				"dashboard.admin", "settings.manage", "users.manage", "reports.view",
				"logs.view", "announcements.create",
			},
		},
		"CURATOR": {
			Level:    5,
			RoleName: "Куратор",
			RoleID:   getEnv("DISCORD_ROLE_CURATOR", "1514077135588036698"),
			Permissions: []string{
				"staff.manage", "staff.view", "punishments.manage", "punishments.view",
				"dashboard.admin", "settings.manage", "users.manage", "reports.view",
				"logs.view", "announcements.create",
			},
		},
		"GLADMIN": {
			Level:    4,
			RoleName: "Гл. Администратор",
			RoleID:   getEnv("DISCORD_ROLE_GLADMIN", "1503512406301872198"),
			Permissions: []string{
				"staff.manage", "staff.view", "punishments.manage", "punishments.view",
				"dashboard.admin", "users.manage", "reports.view", "logs.view",
			},
		},
		"STADMIN": {
			Level:    4,
			RoleName: "Ст. Администратор",
			RoleID:   getEnv("DISCORD_ROLE_STADMIN", "1503512384122257408"),
			Permissions: []string{
				"staff.view", "punishments.manage", "punishments.view",
				"dashboard.admin", "reports.view",
			},
		},
		"MODER": {
			Level:    3,
			RoleName: "Модератор",
			RoleID:   getEnv("DISCORD_ROLE_MODER", "1503512364404703392"),
			Permissions: []string{
				"staff.view", "punishments.manage", "punishments.view", "reports.view",
			},
		},
		"STMODER": {
			Level:    2,
			RoleName: "Ст. Модератор",
			RoleID:   getEnv("DISCORD_ROLE_STMODER", "1503512343202758666"),
			Permissions: []string{
				"staff.view", "punishments.view", "reports.view",
			},
		},
		"MLMODER": {
			Level:    2,
			RoleName: "Мл. Модератор",
			RoleID:   getEnv("DISCORD_ROLE_MLMODER", "1503512286223138900"),
			Permissions: []string{
				"staff.view", "punishments.view",
			},
		},
		"DOSTUP": {
			Level:    2,
			RoleName: "Доступ",
			RoleID:   getEnv("DISCORD_ROLE_DOSTUP", "1509533763736965240"),
			Permissions: []string{
				"staff.view", "punishments.view",
			},
		},
		"ADMIN": {
			Level:    1,
			RoleName: "Администратор",
			RoleID:   getEnv("DISCORD_ROLE_ADMIN", "1507939408223928465"),
			Permissions: []string{
				"staff.view", "punishments.view",
			},
		},
		"ADMIN_PLUS": {
			Level:    1,
			RoleName: "Администратор+",
			RoleID:   getEnv("DISCORD_ROLE_ADMIN_PLUS", "1507939502147113000"),
			Permissions: []string{
				"staff.view", "punishments.view",
			},
		},
		"UNDEFINED": {
			Level:    -1,
			RoleName: "Заблокирован",
			RoleID:   getEnv("DISCORD_ROLE_UNDEFINED", "1507941424488910981"),
			Permissions: []string{},
		},
	}

	return cfg
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if v := os.Getenv(key); v != "" {
		if i, err := strconv.Atoi(v); err == nil {
			return i
		}
	}
	return fallback
}
