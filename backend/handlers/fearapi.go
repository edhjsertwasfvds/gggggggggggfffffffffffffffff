package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"fearstaff-api/config"
)

type FearAPIHandler struct {
	cfg    *config.Config
	client *http.Client
}

func NewFearAPIHandler(cfg *config.Config) *FearAPIHandler {
	return &FearAPIHandler{
		cfg: cfg,
		client: &http.Client{
			Timeout: 15 * time.Second,
		},
	}
}

func (h *FearAPIHandler) proxyGet(w http.ResponseWriter, r *http.Request, apiURL string) {
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
	req.Header.Set("Accept", "application/json")
	req.Header.Set("Referer", "https://fearproject.ru")
	req.Header.Set("Origin", "https://fearproject.ru")

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"fear api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(resp.StatusCode)
	w.Write(body)
}

func (h *FearAPIHandler) GetServers(w http.ResponseWriter, r *http.Request) {
	h.proxyGet(w, r, "https://api.fearproject.ru/servers")
}

func (h *FearAPIHandler) GetLeaderboard(w http.ResponseWriter, r *http.Request) {
	h.proxyGet(w, r, "https://api.fearproject.ru/leaderboard")
}

func (h *FearAPIHandler) GetProfile(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]
	h.proxyGet(w, r, fmt.Sprintf("https://api.fearproject.ru/profile/%s", steamID))
}

func (h *FearAPIHandler) GetSkinchanger(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]
	h.proxyGet(w, r, fmt.Sprintf("https://api.fearproject.ru/skinchanger/player?steamid=%s&mode=public", steamID))
}

func (h *FearAPIHandler) GetPunishments(w http.ResponseWriter, r *http.Request) {
	query := r.URL.RawQuery
	apiURL := "https://api.fearproject.ru/punishments"
	if query != "" {
		apiURL += "?" + query
	}
	h.proxyGet(w, r, apiURL)
}

func (h *FearAPIHandler) SearchPunishments(w http.ResponseWriter, r *http.Request) {
	query := r.URL.RawQuery
	apiURL := "https://api.fearproject.ru/punishments/search"
	if query != "" {
		apiURL += "?" + query
	}
	h.proxyGet(w, r, apiURL)
}

func (h *FearAPIHandler) GetPunishmentsByAdmin(w http.ResponseWriter, r *http.Request) {
	adminSteamID := r.URL.Query().Get("admin_steamid")
	if adminSteamID == "" {
		http.Error(w, `{"error":"admin_steamid required"}`, http.StatusBadRequest)
		return
	}

	type punishResp struct {
		Punishments []struct {
			ID          int64  `json:"id"`
			AdminSteam  string `json:"admin_steamid"`
			SteamID     string `json:"steamid"`
			Reason      string `json:"reason"`
			Type        int    `json:"type"`
			Status      int    `json:"status"`
			Time        string `json:"time"`
			ServerID    int    `json:"server_id"`
			AdminName   string `json:"admin_name"`
			Name        string `json:"name"`
			Duration    int    `json:"duration"`
			Created     int64  `json:"created"`
		} `json:"punishments"`
		Total int `json:"total"`
	}

	allPunishments := make([]interface{}, 0)

	for ptype := 1; ptype <= 2; ptype++ {
		page := 1
		for page <= 50 {
			apiURL := fmt.Sprintf("https://api.fearproject.ru/punishments/search?q=%s&page=%d&limit=20&type=%d", adminSteamID, page, ptype)
			req, _ := http.NewRequest("GET", apiURL, nil)
			req.Header.Set("User-Agent", "Mozilla/5.0")
			req.Header.Set("Accept", "application/json")
			req.Header.Set("Referer", "https://fearproject.ru")
			req.Header.Set("Origin", "https://fearproject.ru")

			resp, err := h.client.Do(req)
			if err != nil {
				break
			}
			body, _ := io.ReadAll(resp.Body)
			resp.Body.Close()

			var data punishResp
			if err := json.Unmarshal(body, &data); err != nil {
				break
			}

			for _, p := range data.Punishments {
				if strings.TrimSpace(p.AdminSteam) == strings.TrimSpace(adminSteamID) {
					allPunishments = append(allPunishments, map[string]interface{}{
						"id":           p.ID,
						"admin_steamid": p.AdminSteam,
						"steamid":      p.SteamID,
						"reason":       p.Reason,
						"type":         p.Type,
						"status":       p.Status,
						"time":         p.Time,
						"server_id":    p.ServerID,
						"admin_name":   p.AdminName,
						"name":         p.Name,
						"duration":     p.Duration,
						"created":      p.Created,
					})
				}
			}

			if len(data.Punishments) < 20 {
				break
			}
			page++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success":      true,
		"punishments":  allPunishments,
		"total":        len(allPunishments),
	})
}

func (h *FearAPIHandler) GetAllPunishments(w http.ResponseWriter, r *http.Request) {
	pType := r.URL.Query().Get("type")
	status := r.URL.Query().Get("status")
	page := r.URL.Query().Get("page")
	search := r.URL.Query().Get("search")
	if page == "" {
		page = "1"
	}

	apiURL := fmt.Sprintf("https://api.fearproject.ru/punishments/search?page=%s&limit=50", page)
	if pType != "" {
		apiURL += "&type=" + pType
	}
	if status != "" {
		apiURL += "&status=" + status
	}
	if search != "" {
		apiURL += "&q=" + search
	}

	h.proxyGet(w, r, apiURL)
}

func (h *FearAPIHandler) CheckBan(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]
	h.proxyGet(w, r, fmt.Sprintf("https://api.fearproject.ru/bans/check/%s", steamID))
}

func (h *FearAPIHandler) GetYoomaBans(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://yooma.su/api/public/read/punishments?punish_type=0&search=%s&page=1&mobile=1", steamID)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
	req.Header.Set("Accept", "application/json, text/plain, */*")
	req.Header.Set("Referer", "https://yooma.su/ru/punishments")
	req.Header.Set("Origin", "https://yooma.su")

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"yooma api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (h *FearAPIHandler) GetSteamSummary(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/?key=9EA60BC3158081747D77604EB9819F19&steamids=%s", steamID)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"steam api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (h *FearAPIHandler) GetSteamBans(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=9EA60BC3158081747D77604EB9819F19&steamids=%s", steamID)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"steam api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (h *FearAPIHandler) GetSteamFriends(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://api.steampowered.com/ISteamUser/GetFriendList/v1/?key=9EA60BC3158081747D77604EB9819F19&steamid=%s&relationship=friend", steamID)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"steam api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (h *FearAPIHandler) GetSteamLevel(w http.ResponseWriter, r *http.Request) {
	path := r.URL.Path
	parts := strings.Split(path, "/")
	if len(parts) < 5 {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}
	steamID := parts[len(parts)-1]

	apiURL := fmt.Sprintf("https://api.steampowered.com/IPlayer/GetSteamLevel/v1/?key=9EA60BC3158081747D77604EB9819F19&steamid=%s", steamID)
	req, _ := http.NewRequest("GET", apiURL, nil)
	req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
	req.Header.Set("Accept", "application/json")

	resp, err := h.client.Do(req)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"steam api error: %s"}`, err.Error()), http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)
}

func (h *FearAPIHandler) GetStaffStats(w http.ResponseWriter, r *http.Request) {
	adminSteamIDs := r.URL.Query().Get("steamids")
	if adminSteamIDs == "" {
		http.Error(w, `{"error":"steamids required"}`, http.StatusBadRequest)
		return
	}

	type punishment struct {
		AdminSteam  string `json:"admin_steamid"`
		SteamID     string `json:"steamid"`
		Reason      string `json:"reason"`
		Type        int    `json:"type"`
		Status      int    `json:"status"`
		Time        string `json:"time"`
		ServerID    int    `json:"server_id"`
		AdminName   string `json:"admin_name"`
		Duration    int    `json:"duration"`
		Created     int64  `json:"created"`
	}

	type punishResp struct {
		Punishments []punishment `json:"punishments"`
		Total       int          `json:"total"`
	}

	ids := strings.Split(adminSteamIDs, ",")
	statsMap := make(map[string]map[string]interface{})

	for _, sid := range ids {
		sid = strings.TrimSpace(sid)
		if sid == "" {
			continue
		}
		statsMap[sid] = map[string]interface{}{
			"steamid":      sid,
			"total_bans":   0,
			"total_mutes":  0,
			"active_bans":  0,
			"active_mutes": 0,
			"removed_bans": 0,
			"removed_mutes": 0,
			"expired_bans": 0,
			"expired_mutes": 0,
			"ban_perm":     0,
			"ban_week":     0,
			"ban_day":      0,
			"ban_short":    0,
			"name":         "",
		}
	}

	for ptype := 1; ptype <= 2; ptype++ {
		for status := 1; status <= 4; status++ {
			if status == 3 {
				continue
			}
			for page := 1; page <= 10; page++ {
				apiURL := fmt.Sprintf("https://api.fearproject.ru/punishments?page=%d&limit=100&type=%d&status=%d", page, ptype, status)
				req, _ := http.NewRequest("GET", apiURL, nil)
				req.Header.Set("User-Agent", "FearStaff-Panel/1.0")
				req.Header.Set("Accept", "application/json")
				req.Header.Set("Referer", "https://fearproject.ru")
				req.Header.Set("Origin", "https://fearproject.ru")

				resp, err := h.client.Do(req)
				if err != nil {
					break
				}
				body, _ := io.ReadAll(resp.Body)
				resp.Body.Close()

				var data punishResp
				if err := json.Unmarshal(body, &data); err != nil {
					break
				}

				for _, p := range data.Punishments {
					adminID := strings.TrimSpace(p.AdminSteam)
					if _, ok := statsMap[adminID]; !ok {
						continue
					}
					if p.Type == 1 {
						statsMap[adminID]["total_bans"] = statsMap[adminID]["total_bans"].(int) + 1
						if status == 1 {
							statsMap[adminID]["active_bans"] = statsMap[adminID]["active_bans"].(int) + 1
						} else if status == 2 {
							statsMap[adminID]["removed_bans"] = statsMap[adminID]["removed_bans"].(int) + 1
						} else if status == 4 {
							statsMap[adminID]["expired_bans"] = statsMap[adminID]["expired_bans"].(int) + 1
						}
						dur := p.Duration
						if status == 1 {
							if dur <= 0 || dur >= 5184000 {
								statsMap[adminID]["ban_perm"] = statsMap[adminID]["ban_perm"].(int) + 1
							} else if dur >= 604800 {
								statsMap[adminID]["ban_week"] = statsMap[adminID]["ban_week"].(int) + 1
							} else if dur >= 86400 {
								statsMap[adminID]["ban_day"] = statsMap[adminID]["ban_day"].(int) + 1
							} else {
								statsMap[adminID]["ban_short"] = statsMap[adminID]["ban_short"].(int) + 1
							}
						}
					} else if p.Type == 2 {
						statsMap[adminID]["total_mutes"] = statsMap[adminID]["total_mutes"].(int) + 1
						if status == 1 {
							statsMap[adminID]["active_mutes"] = statsMap[adminID]["active_mutes"].(int) + 1
						} else if status == 2 {
							statsMap[adminID]["removed_mutes"] = statsMap[adminID]["removed_mutes"].(int) + 1
						} else if status == 4 {
							statsMap[adminID]["expired_mutes"] = statsMap[adminID]["expired_mutes"].(int) + 1
						}
					}
					if statsMap[adminID]["name"] == "" && p.AdminName != "" {
						statsMap[adminID]["name"] = p.AdminName
					}
				}

				if len(data.Punishments) < 100 {
					break
				}
			}
		}
	}

	result := make([]interface{}, 0)
	for _, v := range statsMap {
		v["total"] = v["total_bans"].(int) + v["total_mutes"].(int)
		v["active_total"] = v["active_bans"].(int) + v["active_mutes"].(int)
		v["expired_total"] = v["expired_bans"].(int) + v["expired_mutes"].(int)
		v["removed_total"] = v["removed_bans"].(int) + v["removed_mutes"].(int)
		result = append(result, v)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"stats":   result,
	})
}
