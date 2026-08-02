package handlers

import (
	"encoding/json"
	"net/http"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/db"
	"shtab-backend/internal/models"
)

func GetUserStatsHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	userID := claims.UserID

	var stats models.UserStats

	// Total closed tasks assigned to user
	_ = db.DB.QueryRow(`
		SELECT COUNT(*) FROM tasks 
		WHERE assignee_id = $1 AND status = 'done'`, userID).Scan(&stats.TotalClosed)

	// Closed this week (last 7 days)
	_ = db.DB.QueryRow(`
		SELECT COUNT(*) FROM tasks 
		WHERE assignee_id = $1 AND status = 'done' AND completed_at >= NOW() - INTERVAL '7 days'`, userID).Scan(&stats.ClosedWeek)

	// Closed this month (last 30 days)
	_ = db.DB.QueryRow(`
		SELECT COUNT(*) FROM tasks 
		WHERE assignee_id = $1 AND status = 'done' AND completed_at >= NOW() - INTERVAL '30 days'`, userID).Scan(&stats.ClosedMonth)

	// Daily dynamics for the last 14 days
	rows, err := db.DB.Query(`
		SELECT TO_CHAR(completed_at, 'YYYY-MM-DD') as day, COUNT(*) 
		FROM tasks 
		WHERE assignee_id = $1 AND status = 'done' AND completed_at >= NOW() - INTERVAL '14 days'
		GROUP BY day
		ORDER BY day ASC`, userID)

	stats.DailyDynamics = []models.DayStat{}
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var ds models.DayStat
			if err := rows.Scan(&ds.Date, &ds.Count); err == nil {
				stats.DailyDynamics = append(stats.DailyDynamics, ds)
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}
