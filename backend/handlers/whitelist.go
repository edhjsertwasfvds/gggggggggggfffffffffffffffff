package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"

	"fearstaff-api/config"
)

type WhitelistEntry struct {
	ID      string `json:"id"`
	SteamID string `json:"steam_id"`
	Name    string `json:"name"`
	AddedBy string `json:"added_by"`
	Date    string `json:"date"`
}

type WhitelistHandler struct {
	cfg      *config.Config
	entries  []WhitelistEntry
	mu       sync.RWMutex
}

func NewWhitelistHandler(cfg *config.Config) *WhitelistHandler {
	return &WhitelistHandler{
		cfg:     cfg,
		entries: make([]WhitelistEntry, 0),
	}
}

func (h *WhitelistHandler) GetEntries(w http.ResponseWriter, r *http.Request) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    h.entries,
		"total":   len(h.entries),
	})
}

func (h *WhitelistHandler) AddEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	claims, _ := r.Context().Value(UserContextKey).(*JWTClaims)
	if claims == nil {
		http.Error(w, `{"error":"unauthorized"}`, http.StatusUnauthorized)
		return
	}

	var req struct {
		SteamID string `json:"steam_id"`
		Name    string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	if req.SteamID == "" {
		http.Error(w, `{"error":"steam_id required"}`, http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for _, e := range h.entries {
		if e.SteamID == req.SteamID {
			http.Error(w, `{"error":"already in whitelist"}`, http.StatusConflict)
			return
		}
	}

	entry := WhitelistEntry{
		ID:      fmt.Sprintf("wl_%d", time.Now().UnixNano()),
		SteamID: req.SteamID,
		Name:    req.Name,
		AddedBy: claims.Username,
		Date:    time.Now().UTC().Format("02.01.2006 15:04"),
	}
	h.entries = append(h.entries, entry)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"data":    entry,
	})
}

func (h *WhitelistHandler) DeleteEntry(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost && r.Method != http.MethodDelete {
		http.Error(w, `{"error":"method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error":"invalid body"}`, http.StatusBadRequest)
		return
	}

	h.mu.Lock()
	defer h.mu.Unlock()

	for i, e := range h.entries {
		if e.ID == req.ID {
			h.entries = append(h.entries[:i], h.entries[i+1:]...)
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(map[string]interface{}{
				"success": true,
				"message": "Entry removed",
			})
			return
		}
	}

	http.Error(w, `{"error":"entry not found"}`, http.StatusNotFound)
}
