package models

import (
	"time"
)

type User struct {
	ID        string    `json:"id"`
	Email     string    `json:"email"`
	Password  string    `json:"password,omitempty"`
	Name      string    `json:"name"`
	Role      string    `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	TaskCount int       `json:"task_count,omitempty"`
}

type Project struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     string    `json:"owner_id"`
	CreatedAt   time.Time `json:"created_at"`
	Members     []User    `json:"members,omitempty"`
}

type Task struct {
	ID          string     `json:"id"`
	ProjectID   string     `json:"project_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	DueDate     *time.Time `json:"due_date"`
	Status      string     `json:"status"`   // 'new', 'in_progress', 'review', 'done'
	Priority    string     `json:"priority"` // 'low', 'medium', 'high', 'urgent'
	AssigneeID  *string    `json:"assignee_id"`
	Assignee    *User      `json:"assignee,omitempty"`
	AuthorID    string     `json:"author_id"`
	Author      *User      `json:"author,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	CompletedAt *time.Time `json:"completed_at,omitempty"`
}

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type UserStats struct {
	TotalClosed   int              `json:"total_closed"`
	ClosedWeek    int              `json:"closed_week"`
	ClosedMonth   int              `json:"closed_month"`
	DailyDynamics []DayStat        `json:"daily_dynamics"`
}

type DayStat struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}
