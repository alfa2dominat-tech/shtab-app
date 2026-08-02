package main

import (
	"log"
	"net/http"
	"os"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/db"
	"shtab-backend/internal/handlers"
	"shtab-backend/internal/ws"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"golang.org/x/crypto/bcrypt"
)

func seedAdmin() {
	if db.DB == nil {
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
	if err != nil {
		return
	}
	_, _ = db.DB.Exec(`
		INSERT INTO users (id, email, password_hash, name, role)
		VALUES ('00000000-0000-0000-0000-000000000001', 'admin@shtab.local', $1, 'Administrator', 'admin')
		ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'admin'`,
		string(hashedPassword),
	)
}

func main() {
	if err := db.InitDB(); err != nil {
		log.Printf("Warning: Database connection failed at startup: %v. Will rely on connection retries or env config.", err)
	} else {
		seedAdmin()
	}

	go ws.GlobalHub.Run()

	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Route("/api", func(r chi.Router) {
		// Auth
		r.Post("/auth/register", handlers.RegisterHandler)
		r.Post("/auth/login", handlers.LoginHandler)

		r.Group(func(r chi.Router) {
			r.Use(auth.JWTMiddleware)
			r.Get("/auth/me", handlers.MeHandler)

			// Projects
			r.Get("/projects", handlers.GetProjectsHandler)
			r.Post("/projects", handlers.CreateProjectHandler)
			r.Get("/projects/{id}", handlers.GetProjectDetailsHandler)

			// Tasks
			r.Get("/projects/{projectId}/tasks", handlers.GetTasksHandler)
			r.Post("/projects/{projectId}/tasks", handlers.CreateTaskHandler)
			r.Put("/tasks/{taskId}", handlers.UpdateTaskHandler)
			r.Delete("/tasks/{taskId}", handlers.DeleteTaskHandler)

			// Notifications
			r.Get("/notifications", handlers.GetNotificationsHandler)
			r.Post("/notifications/{id}/read", handlers.MarkNotificationReadHandler)

			// User Stats
			r.Get("/stats", handlers.GetUserStatsHandler)

			// Admin
			r.Group(func(r chi.Router) {
				r.Use(auth.AdminMiddleware)
				r.Get("/admin/users", handlers.GetAdminUsersHandler)
				r.Put("/admin/users/{userId}/role", handlers.UpdateUserRoleHandler)
			})
		})
	})

	// WebSocket endpoint
	r.Route("/ws", func(r chi.Router) {
		r.Use(auth.JWTMiddleware)
		r.Get("/", handlers.WebSocketHandler)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal(err)
	}
}
