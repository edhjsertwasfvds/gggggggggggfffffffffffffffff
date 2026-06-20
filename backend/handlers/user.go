package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"fearstaff-api/config"
	"fearstaff-api/database"
)

type UserHandler struct {
	cfg *config.Config
	db  *database.DB
}

func NewUserHandler(cfg *config.Config, db *database.DB) *UserHandler {
	return &UserHandler{cfg: cfg, db: db}
}

func (h *UserHandler) GetStaff(w http.ResponseWriter, r *http.Request) {
	staff, err := h.db.GetStaffFromFile()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    map[string]interface{}{},
		})
		return
	}

	result := make([]map[string]interface{}, 0)
	for _, s := range staff {
		rp, ok := h.cfg.RoleMap[s.GroupName]
		level := 0
		if ok {
			level = rp.Level
		}
		result = append(result, map[string]interface{}{
			"steam_id":     s.SteamID,
			"name":         s.Name,
			"discord_id":   s.DiscordID,
			"discord_name": s.DiscordName,
			"role":         s.Role,
			"group_name":   s.GroupName,
			"level":        level,
			"updated_at":   s.UpdatedAt,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

func (h *UserHandler) GetStaffByGroup(w http.ResponseWriter, r *http.Request) {
	group := r.URL.Query().Get("group")
	if group == "" {
		http.Error(w, `{"error":"group parameter required"}`, http.StatusBadRequest)
		return
	}

	staff, err := h.db.GetStaffFromFile()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data":    []interface{}{},
		})
		return
	}

	result := make([]map[string]interface{}, 0)
	for _, s := range staff {
		if s.GroupName == group {
			rp, _ := h.cfg.RoleMap[s.GroupName]
			result = append(result, map[string]interface{}{
				"steam_id":     s.SteamID,
				"name":         s.Name,
				"discord_id":   s.DiscordID,
				"discord_name": s.DiscordName,
				"role":         s.Role,
				"group_name":   s.GroupName,
				"level":        rp.Level,
				"updated_at":   s.UpdatedAt,
			})
		}
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    result,
	})
}

func (h *UserHandler) GetRoles(w http.ResponseWriter, r *http.Request) {
	roles := make([]map[string]interface{}, 0)
	for name, rp := range h.cfg.RoleMap {
		if name == "UNDEFINED" {
			continue
		}
		roles = append(roles, map[string]interface{}{
			"key":         name,
			"name":        rp.RoleName,
			"level":       rp.Level,
			"permissions": rp.Permissions,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    roles,
	})
}

func (h *UserHandler) GetDashboardStats(w http.ResponseWriter, r *http.Request) {
	staff, err := h.db.GetStaffFromFile()
	if err != nil {
		json.NewEncoder(w).Encode(map[string]interface{}{
			"success": true,
			"data": map[string]interface{}{
				"total_staff":      0,
				"staff_by_role":    map[string]int{},
				"online_staff":     0,
			},
		})
		return
	}

	byRole := make(map[string]int)
	total := 0
	for _, s := range staff {
		total++
		byRole[s.GroupName]++
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data": map[string]interface{}{
			"total_staff":   total,
			"staff_by_role": byRole,
		},
	})
}

func (h *UserHandler) GetAllUsers(w http.ResponseWriter, r *http.Request) {
	limitStr := r.URL.Query().Get("limit")
	limit := 50
	if limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	users, err := h.db.GetAllUsers()
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusInternalServerError)
		return
	}

	if len(users) > limit {
		users = users[:limit]
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    users,
	})
}
