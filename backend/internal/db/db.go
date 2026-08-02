package db

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func InitDB() error {
	host := getEnv("DB_HOST", "localhost")
	port := getEnv("DB_PORT", "5432")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbname := getEnv("DB_NAME", "shtab_db")
	sslmode := getEnv("DB_SSLMODE", "disable")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode)

	var err error
	for i := 0; i < 15; i++ {
		DB, err = sql.Open("postgres", connStr)
		if err == nil {
			if err = DB.Ping(); err == nil {
				log.Println("Successfully connected to PostgreSQL database")
				break
			}
		}
		log.Printf("Waiting for database connection... (attempt %d/15): %v", i+1, err)
		time.Sleep(2 * time.Second)
	}

	if err != nil {
		return fmt.Errorf("failed to connect to database after retries: %v", err)
	}

	// Auto-run schema.sql to ensure tables exist
	schemaBytes, err := os.ReadFile("schema.sql")
	if err != nil {
		schemaBytes, err = os.ReadFile("/app/schema.sql")
	}
	if err == nil && len(schemaBytes) > 0 {
		_, err = DB.Exec(string(schemaBytes))
		if err != nil {
			log.Printf("Warning during schema execution: %v", err)
		} else {
			log.Println("Database schema verified/executed successfully")
		}
	}

	return nil
}

func getEnv(key, fallback string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return fallback
}
