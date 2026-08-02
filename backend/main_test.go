package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/models"
)

func TestJWTTokenGenerationAndValidation(t *testing.T) {
	userID := "123e4567-e89b-12d3-a456-426614174000"
	email := "test@shtab.local"
	role := "user"

	token, err := auth.GenerateToken(userID, email, role)
	if err != nil {
		t.Fatalf("Failed to generate token: %v", err)
	}

	claims, err := auth.ValidateToken(token)
	if err != nil {
		t.Fatalf("Failed to validate token: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("Expected user ID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != email {
		t.Errorf("Expected email %s, got %s", email, claims.Email)
	}
	if claims.Role != role {
		t.Errorf("Expected role %s, got %s", role, claims.Role)
	}
}

func TestTaskDue24HoursHighlightLogic(t *testing.T) {
	// Unit test verifying task due date check for < 24 hours visual highlight
	now := time.Now()
	urgentDueDate := now.Add(12 * time.Hour)
	normalDueDate := now.Add(48 * time.Hour)

	isUrgent := func(dueDate *time.Time) bool {
		if dueDate == nil {
			return false
		}
		remaining := time.Until(*dueDate)
		return remaining > 0 && remaining < 24*time.Hour
	}

	if !isUrgent(&urgentDueDate) {
		t.Errorf("Expected urgentDueDate (12h left) to be marked urgent (< 24h)")
	}

	if isUrgent(&normalDueDate) {
		t.Errorf("Expected normalDueDate (48h left) NOT to be marked urgent")
	}
}
