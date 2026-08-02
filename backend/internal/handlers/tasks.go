package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/db"
	"shtab-backend/internal/models"
	"shtab-backend/internal/ws"

	"github.com/go-chi/chi/v5"
)

func GetTasksHandler(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "projectId")

	rows, err := db.DB.Query(`
		SELECT t.id, t.project_id, t.title, t.description, t.due_date, t.status, t.priority, 
		       t.assignee_id, t.author_id, t.created_at, t.updated_at, t.completed_at,
		       ua.id, ua.email, ua.name, ua.role, ua.created_at,
		       ut.id, ut.email, ut.name, ut.role, ut.created_at
		FROM tasks t
		LEFT JOIN users ua ON t.assignee_id = ua.id
		LEFT JOIN users ut ON t.author_id = ut.id
		WHERE t.project_id = $1
		ORDER BY t.created_at DESC`, projectID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var tasks []models.Task
	for rows.Next() {
		var t models.Task
		var assignee models.User
		var author models.User
		var assigneeID sql.NullString
		var assigneeEmail, assigneeName, assigneeRole sql.NullString
		var assigneeCreated sql.NullTime
		var completedAt sql.NullTime
		var dueDate sql.NullTime
		var desc sql.NullString

		err := rows.Scan(
			&t.ID, &t.ProjectID, &t.Title, &desc, &dueDate, &t.Status, &t.Priority,
			&assigneeID, &t.AuthorID, &t.CreatedAt, &t.UpdatedAt, &completedAt,
			&assigneeID, &assigneeEmail, &assigneeName, &assigneeRole, &assigneeCreated,
			&author.ID, &author.Email, &author.Name, &author.Role, &author.CreatedAt,
		)
		if err != nil {
			continue
		}

		if desc.Valid {
			t.Description = desc.String
		}
		if dueDate.Valid {
			t.DueDate = &dueDate.Time
		}
		if completedAt.Valid {
			t.CompletedAt = &completedAt.Time
		}
		if assigneeID.Valid {
			t.AssigneeID = &assigneeID.String
			assignee.ID = assigneeID.String
			if assigneeEmail.Valid {
				assignee.Email = assigneeEmail.String
			}
			if assigneeName.Valid {
				assignee.Name = assigneeName.String
			}
			if assigneeRole.Valid {
				assignee.Role = assigneeRole.String
			}
			if assigneeCreated.Valid {
				assignee.CreatedAt = assigneeCreated.Time
			}
			t.Assignee = &assignee
		}
		t.Author = &author

		tasks = append(tasks, t)
	}

	if tasks == nil {
		tasks = []models.Task{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

func CreateTaskHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	projectID := chi.URLParam(r, "projectId")

	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		DueDate     *time.Time `json:"due_date"`
		Priority    string     `json:"priority"`
		AssigneeID  *string    `json:"assignee_id"`
		Status      string     `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if req.Title == "" {
		http.Error(w, "Task title is required", http.StatusBadRequest)
		return
	}

	status := "new"
	if req.Status != "" {
		status = req.Status
	}
	priority := "medium"
	if req.Priority != "" {
		priority = req.Priority
	}

	var t models.Task
	var dueDateVal interface{}
	if req.DueDate != nil {
		dueDateVal = *req.DueDate
	} else {
		dueDateVal = nil
	}

	var assigneeVal interface{}
	if req.AssigneeID != nil && *req.AssigneeID != "" {
		assigneeVal = *req.AssigneeID
	} else {
		assigneeVal = nil
	}

	err := db.DB.QueryRow(`
		INSERT INTO tasks (project_id, title, description, due_date, status, priority, assignee_id, author_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, project_id, title, description, due_date, status, priority, assignee_id, author_id, created_at, updated_at`,
		projectID, req.Title, req.Description, dueDateVal, status, priority, assigneeVal, claims.UserID,
	).Scan(&t.ID, &t.ProjectID, &t.Title, &t.Description, &t.DueDate, &t.Status, &t.Priority, &t.AssigneeID, &t.AuthorID, &t.CreatedAt, &t.UpdatedAt)

	if err != nil {
		http.Error(w, "Failed to create task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Fetch author details
	_ = db.DB.QueryRow(`SELECT id, email, name, role, created_at FROM users WHERE id = $1`, t.AuthorID).
		Scan(&t.AuthorID, &struct{}{}, new(string), new(string), new(time.Time)) // simplified or full fetch

	// If assigned to another user, send notification via WebSocket
	if t.AssigneeID != nil && *t.AssigneeID != claims.UserID {
		notifTitle := "New Task Assigned"
		notifMsg := "You were assigned to task: " + t.Title
		var notif models.Notification
		err = db.DB.QueryRow(`
			INSERT INTO notifications (user_id, title, message, type)
			VALUES ($1, $2, $3, 'assignment')
			RETURNING id, user_id, title, message, type, read, created_at`,
			*t.AssigneeID, notifTitle, notifMsg,
		).Scan(&notif.ID, &notif.UserID, &notif.Title, &notif.Message, &notif.Type, &notif.Read, &notif.CreatedAt)

		if err == nil {
			ws.SendNotification(*t.AssigneeID, map[string]interface{}{
				"type":         "notification",
				"notification": notif,
			})
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(t)
}

func UpdateTaskHandler(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskId")
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		DueDate     *time.Time `json:"due_date"`
		Status      string     `json:"status"`
		Priority    string     `json:"priority"`
		AssigneeID  *string    `json:"assignee_id"`
		ProjectID   string     `json:"project_id"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Fetch old task state
	var oldAssigneeID sql.NullString
	var oldStatus string
	var oldTitle, oldDesc, oldPriority, oldProjectID string
	var oldDueDate sql.NullTime
	err := db.DB.QueryRow(`SELECT assignee_id, status, title, description, priority, due_date, project_id FROM tasks WHERE id = $1`, taskID).
		Scan(&oldAssigneeID, &oldStatus, &oldTitle, &oldDesc, &oldPriority, &oldDueDate, &oldProjectID)
	if err != nil {
		http.Error(w, "Task not found", http.StatusNotFound)
		return
	}

	var updatedTask models.Task

	// If title is empty and status is provided, treat as partial update (drag-and-drop status change)
	if req.Title == "" && req.Status != "" && req.ProjectID == "" {
		err = db.DB.QueryRow(`
			UPDATE tasks 
			SET status = $1::TEXT,
			    updated_at = CURRENT_TIMESTAMP,
			    completed_at = CASE WHEN $1::TEXT = 'done' AND status != 'done' THEN CURRENT_TIMESTAMP ELSE completed_at END
			WHERE id = $2
			RETURNING id, project_id, title, description, due_date, status, priority, assignee_id, author_id, created_at, updated_at`,
			req.Status, taskID,
		).Scan(&updatedTask.ID, &updatedTask.ProjectID, &updatedTask.Title, &updatedTask.Description, &updatedTask.DueDate, &updatedTask.Status, &updatedTask.Priority, &updatedTask.AssigneeID, &updatedTask.AuthorID, &updatedTask.CreatedAt, &updatedTask.UpdatedAt)
	} else {
		title := req.Title
		if title == "" {
			title = oldTitle
		}
		description := req.Description
		priority := req.Priority
		if priority == "" {
			priority = oldPriority
		}
		status := req.Status
		if status == "" {
			status = oldStatus
		}
		projectID := req.ProjectID
		if projectID == "" {
			projectID = oldProjectID
		}

		var dueDateVal interface{}
		if req.DueDate != nil {
			dueDateVal = *req.DueDate
		} else if oldDueDate.Valid {
			dueDateVal = oldDueDate.Time
		} else {
			dueDateVal = nil
		}

		var assigneeVal interface{}
		if req.AssigneeID != nil && *req.AssigneeID != "" {
			assigneeVal = *req.AssigneeID
		} else if oldAssigneeID.Valid {
			assigneeVal = oldAssigneeID.String
		} else {
			assigneeVal = nil
		}

		err = db.DB.QueryRow(`
			UPDATE tasks 
			SET title = $1::TEXT,
			    description = $2::TEXT,
			    due_date = $3,
			    status = $4::TEXT,
			    priority = $5::TEXT,
			    assignee_id = $6,
			    project_id = $7::UUID,
			    updated_at = CURRENT_TIMESTAMP,
			    completed_at = CASE WHEN $4::TEXT = 'done' AND status != 'done' THEN CURRENT_TIMESTAMP ELSE completed_at END
			WHERE id = $8
			RETURNING id, project_id, title, description, due_date, status, priority, assignee_id, author_id, created_at, updated_at`,
			title, description, dueDateVal, status, priority, assigneeVal, projectID, taskID,
		).Scan(&updatedTask.ID, &updatedTask.ProjectID, &updatedTask.Title, &updatedTask.Description, &updatedTask.DueDate, &updatedTask.Status, &updatedTask.Priority, &updatedTask.AssigneeID, &updatedTask.AuthorID, &updatedTask.CreatedAt, &updatedTask.UpdatedAt)
	}

	if err != nil {
		http.Error(w, "Failed to update task: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Notify new assignee if changed
	if req.AssigneeID != nil && *req.AssigneeID != "" && (!oldAssigneeID.Valid || oldAssigneeID.String != *req.AssigneeID) {
		if *req.AssigneeID != claims.UserID {
			notifTitle := "Task Assigned"
			notifMsg := "You were assigned to task: " + updatedTask.Title
			var notif models.Notification
			err = db.DB.QueryRow(`
				INSERT INTO notifications (user_id, title, message, type)
				VALUES ($1, $2, $3, 'assignment')
				RETURNING id, user_id, title, message, type, read, created_at`,
				*req.AssigneeID, notifTitle, notifMsg,
			).Scan(&notif.ID, &notif.UserID, &notif.Title, &notif.Message, &notif.Type, &notif.Read, &notif.CreatedAt)

			if err == nil {
				ws.SendNotification(*req.AssigneeID, map[string]interface{}{
					"type":         "notification",
					"notification": notif,
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

func DeleteTaskHandler(w http.ResponseWriter, r *http.Request) {
	taskID := chi.URLParam(r, "taskId")
	_, err := db.DB.Exec(`DELETE FROM tasks WHERE id = $1`, taskID)
	if err != nil {
		http.Error(w, "Failed to delete task", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})
}

func GetNotificationsHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	rows, err := db.DB.Query(`
		SELECT id, user_id, title, message, type, read, created_at
		FROM notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50`, claims.UserID)
	if err != nil {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var notifs []models.Notification
	for rows.Next() {
		var n models.Notification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Message, &n.Type, &n.Read, &n.CreatedAt); err == nil {
			notifs = append(notifs, n)
		}
	}
	if notifs == nil {
		notifs = []models.Notification{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notifs)
}

func MarkNotificationReadHandler(w http.ResponseWriter, r *http.Request) {
	notifID := chi.URLParam(r, "id")
	_, err := db.DB.Exec(`UPDATE notifications SET read = TRUE WHERE id = $1`, notifID)
	if err != nil {
		http.Error(w, "Failed to update notification", http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}
