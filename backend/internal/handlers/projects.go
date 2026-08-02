package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/db"
	"shtab-backend/internal/models"

	"github.com/go-chi/chi/v5"
)

func GetProjectsHandler(w http.ResponseWriter, r *http.Request) {
	_, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.DB.Query(`
		SELECT id, name, description, owner_id, created_at 
		FROM projects
		ORDER BY created_at DESC`)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var projects []models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt); err != nil {
			continue
		}
		projects = append(projects, p)
	}

	if projects == nil {
		projects = []models.Project{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(projects)
}

func CreateProjectHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Name        string   `json:"name"`
		Description string   `json:"description"`
		MemberIDs   []string `json:"member_ids"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Name == "" {
		http.Error(w, "Project name is required", http.StatusBadRequest)
		return
	}

	tx, err := db.DB.Begin()
	if err != nil {
		http.Error(w, "Server error", http.StatusInternalServerError)
		return
	}
	defer tx.Rollback()

	var p models.Project
	err = tx.QueryRow(
		`INSERT INTO projects (name, description, owner_id) VALUES ($1, $2, $3) RETURNING id, name, description, owner_id, created_at`,
		req.Name, req.Description, claims.UserID,
	).Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt)

	if err != nil {
		http.Error(w, "Failed to create project", http.StatusInternalServerError)
		return
	}

	// Add owner as member too
	_, _ = tx.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, p.ID, claims.UserID)

	for _, memberID := range req.MemberIDs {
		if memberID != claims.UserID {
			_, _ = tx.Exec(`INSERT INTO project_members (project_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, p.ID, memberID)
		}
	}

	if err := tx.Commit(); err != nil {
		http.Error(w, "Failed to commit project", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func GetProjectDetailsHandler(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "id")
	_, _ = r.Context().Value(auth.UserContextKey).(*auth.Claims)

	var p models.Project
	err := db.DB.QueryRow(
		`SELECT id, name, description, owner_id, created_at FROM projects WHERE id = $1`,
		projectID,
	).Scan(&p.ID, &p.Name, &p.Description, &p.OwnerID, &p.CreatedAt)

	if err == sql.ErrNoRows {
		http.Error(w, "Project not found", http.StatusNotFound)
		return
	} else if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}

	// Fetch members
	rows, err := db.DB.Query(`
		SELECT u.id, u.email, u.name, u.role, u.created_at 
		FROM users u
		JOIN project_members pm ON u.id = pm.user_id
		WHERE pm.project_id = $1`, projectID)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var u models.User
			if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Role, &u.CreatedAt); err == nil {
				p.Members = append(p.Members, u)
			}
		}
	}
	if p.Members == nil {
		p.Members = []models.User{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}
