package models

import "time"

type User struct {
	ID            string    `json:"id"`
	DiscordID     string    `json:"discord_id"`
	Username      string    `json:"username"`
	DisplayName   string    `json:"display_name"`
	Avatar        string    `json:"avatar"`
	Email         string    `json:"email,omitempty"`
	StaffGroup    string    `json:"staff_group,omitempty"`
	StaffRole     string    `json:"staff_role,omitempty"`
	SteamID       string    `json:"steam_id,omitempty"`
	Level         int       `json:"level"`
	Permissions   []string  `json:"permissions"`
	GuildRoles    []string  `json:"guild_roles"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	LastLogin     time.Time `json:"last_login"`
}

type StaffMember struct {
	SteamID     string `json:"steam_id"`
	Name        string `json:"name"`
	DiscordID   string `json:"discord_id"`
	DiscordName string `json:"discord_name"`
	Role        string `json:"role"`
	GroupName   string `json:"group_name"`
	UpdatedAt   string `json:"updated_at"`
}

type AuthTokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

type DiscordUser struct {
	ID            string `json:"id"`
	Username      string `json:"username"`
	Discriminator string `json:"discriminator"`
	Avatar        string `json:"avatar"`
	Email         string `json:"email"`
	GlobalName    string `json:"global_name"`
}

type DiscordGuildMember struct {
	Roles   []string       `json:"roles"`
	User    DiscordUser    `json:"user"`
	Nick    string         `json:"nick"`
	JoinedAt string        `json:"joined_at"`
}

type DashboardStats struct {
	TotalStaff      int            `json:"total_staff"`
	StaffByRole     map[string]int `json:"staff_by_role"`
	OnlineStaff     int            `json:"online_staff"`
	RecentPunishments int          `json:"recent_punishments"`
}

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   string      `json:"error,omitempty"`
	Message string      `json:"message,omitempty"`
}
