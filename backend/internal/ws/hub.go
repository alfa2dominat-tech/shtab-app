package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	Clients    map[string]map[*Client]bool
	Register   chan *Client
	Unregister chan *Client
	Broadcast  chan BroadcastMessage
	mu         sync.Mutex
}

type BroadcastMessage struct {
	UserID  string          `json:"user_id,omitempty"` // if empty, broadcast to all or specific project
	Payload json.RawMessage `json:"payload"`
}

var GlobalHub = &Hub{
	Clients:    make(map[string]map[*Client]bool),
	Register:   make(chan *Client),
	Unregister: make(chan *Client),
	Broadcast:  make(chan BroadcastMessage),
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.Register:
			h.mu.Lock()
			if h.Clients[client.UserID] == nil {
				h.Clients[client.UserID] = make(map[*Client]bool)
			}
			h.Clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("WebSocket client connected for user: %s", client.UserID)

		case client := <-h.Unregister:
			h.mu.Lock()
			if clients, ok := h.Clients[client.UserID]; ok {
				if _, ok := clients[client]; ok {
					delete(clients, client)
					close(client.Send)
					if len(clients) == 0 {
						delete(h.Clients, client.UserID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("WebSocket client disconnected for user: %s", client.UserID)

		case msg := <-h.Broadcast:
			h.mu.Lock()
			if clients, ok := h.Clients[msg.UserID]; ok {
				for client := range clients {
					select {
					case client.Send <- []byte(msg.Payload):
					default:
						close(client.Send)
						delete(clients, client)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}

func ServeWs(w http.ResponseWriter, r *http.Request, userID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade error: %v", err)
		return
	}

	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 256),
	}

	GlobalHub.Register <- client

	go func() {
		defer func() {
			GlobalHub.Unregister <- client
			client.Conn.Close()
		}()
		for {
			_, _, err := client.Conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()

	go func() {
		defer func() {
			client.Conn.Close()
		}()
		for message := range client.Send {
			err := client.Conn.WriteMessage(websocket.TextMessage, message)
			if err != nil {
				break
			}
		}
	}()
}

func SendNotification(userID string, notification interface{}) {
	data, err := json.Marshal(notification)
	if err != nil {
		return
	}
	GlobalHub.Broadcast <- BroadcastMessage{
		UserID:  userID,
		Payload: data,
	}
}
