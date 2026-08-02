package handlers

import (
	"net/http"

	"shtab-backend/internal/auth"
	"shtab-backend/internal/ws"
)

func WebSocketHandler(w http.ResponseWriter, r *http.Request) {
	claims, ok := r.Context().Value(auth.UserContextKey).(*auth.Claims)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	ws.ServeWs(w, r, claims.UserID)
}
