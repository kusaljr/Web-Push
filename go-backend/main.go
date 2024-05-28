package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"

	webpush "github.com/SherClockHolmes/webpush-go"
)

type Subscription struct {
	Endpoint string `json:"endpoint"`
	Keys     Keys   `json:"keys"`
}

type Keys struct {
	P256dh string `json:"p256dh"`
	Auth   string `json:"auth"`
}

type SubscribeRequest struct {
	UserID       string       `json:"userId"`
	Subscription Subscription `json:"subscription"`
}

type NotificationPayload struct {
	Title string `json:"title"`
	Body  string `json:"body"`
	Icon  string `json:"icon"`
	Badge string `json:"badge"`
}

type SendNotificationRequest struct {
	UserID              string              `json:"userId"`
	NotificationPayload NotificationPayload `json:"notificationPayload"`
}

var (
	userSubscriptions = make(map[string]Subscription)
	mutex             sync.Mutex
)

const (
	vapidPublicKey  = "BOK2hA7Aki5xCXc-5A9eDb5SqT-Svws371427owc5ouaJeD1hIuE7AlhDMredndaZbFsPnD1hNCyGp6HLrayu5g"
	vapidPrivateKey = "0y_rPvvQ_LoSfiVYd1wvd8PPsX2qL_ITJ7bDw2JL7QE"
)

func main() {
	http.HandleFunc("/subscribe", withCors(handleSubscribe))
	http.HandleFunc("/send-notification", withCors(handleSendNotification))

	fmt.Println("Server listening on port 3000")
	log.Fatal(http.ListenAndServe(":3000", nil))
}

func handleSubscribe(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		enableCors(&w)
		w.WriteHeader(http.StatusOK)
		return
	}

	enableCors(&w)

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req SubscribeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	userSubscriptions[req.UserID] = req.Subscription
	mutex.Unlock()

	fmt.Println(userSubscriptions)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"message": "Subscription added successfully"})
}

func handleSendNotification(w http.ResponseWriter, r *http.Request) {
	if r.Method == http.MethodOptions {
		enableCors(&w)
		w.WriteHeader(http.StatusOK)
		return
	}

	enableCors(&w)

	if r.Method != http.MethodPost {
		http.Error(w, "Invalid request method", http.StatusMethodNotAllowed)
		return
	}

	var req SendNotificationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	mutex.Lock()
	subscription, exists := userSubscriptions[req.UserID]
	mutex.Unlock()

	if !exists {
		http.Error(w, "Subscription not found", http.StatusNotFound)
		return
	}

	payload, err := json.Marshal(req.NotificationPayload)
	if err != nil {
		http.Error(w, "Error creating payload", http.StatusInternalServerError)
		return
	}

	resp, err := webpush.SendNotification(payload, &webpush.Subscription{
		Endpoint: subscription.Endpoint,
		Keys: webpush.Keys{
			P256dh: subscription.Keys.P256dh,
			Auth:   subscription.Keys.Auth,
		},
	}, &webpush.Options{
		VAPIDPublicKey:  vapidPublicKey,
		VAPIDPrivateKey: vapidPrivateKey,
		TTL:             30,
	})
	if err != nil {
		log.Println("Error sending notification:", err)
		http.Error(w, "Error sending notification", http.StatusInternalServerError)
		return
	}
	defer resp.Body.Close()

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Notification sent successfully"})
}

func withCors(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		enableCors(&w)
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}
		handler(w, r)
	}
}

func enableCors(w *http.ResponseWriter) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
	(*w).Header().Set("Content-Type", "application/json")

}
