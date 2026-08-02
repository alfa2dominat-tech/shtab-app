package handlers

import (
	"encoding/json"
	"net/http"

	"shtab-backend/internal/db"
	"shtab-backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func GetAdminUsersHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.DB.Query(`
		SELECT u.id, u.email, u.name, u.role, u.created_at,
		       (SELECT COUNT(*) FROM tasks t WHERE t.assignee_id = u.id) as task_count
		FROM users u
		ORDER BY u.created_at DESC`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var u models.User
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt, &u.TaskCount); err == nil {
			users = append(users, u)
		}
	}

	if users == nil {
		users = []models.User{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(users)
}

func UpdateUserRoleHandler(w http.ResponseWriter, r *http.Request) {
	userID := chi.URLParam(r, "userId")
	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || (req.Role != "user" && req.Role != "admin") {
		http.Error(w, "Invalid role", http.StatusBadRequest)
		return
	}

	_, err := db.DB.Exec(`UPDATE users SET role = $1 WHERE id = $2`, req.Role, userID)
	if err != nil {
		http.Error(w, "Failed to update user role", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "updated"})
}
