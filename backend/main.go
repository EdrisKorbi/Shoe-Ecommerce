package main

import (
	"fmt"
	"net/http"

	"shoe-ecommerce-backend/db"
	"shoe-ecommerce-backend/handlers"
	"shoe-ecommerce-backend/middleware"

	"github.com/joho/godotenv"
)

func enableCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func main() {
	_ = godotenv.Load()
	db.Connect()

	mux := http.NewServeMux()
	mux.HandleFunc("/auth/register", handlers.Register)
	mux.HandleFunc("/auth/login", handlers.Login)
	mux.HandleFunc("/auth/me", middleware.AuthMiddleware(handlers.Me))
	mux.HandleFunc("/auth/profile-picture", middleware.AuthMiddleware(handlers.UpdateProfilePicture))

	fmt.Println("Server running on :8080")
	err := http.ListenAndServe(":8080", enableCORS(mux))
	if err != nil {
		fmt.Println("Server error:", err)
	}
}
