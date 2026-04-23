package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"

	"shoe-ecommerce-backend/db"
	"shoe-ecommerce-backend/middleware"
	"shoe-ecommerce-backend/utils"

	"golang.org/x/crypto/bcrypt"
)

type RegisterRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Name == "" || req.Email == "" || req.Password == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	var existingID int
	err := db.DB.QueryRow("SELECT id FROM users WHERE email = ?", req.Email).Scan(&existingID)
	if err != nil && err != sql.ErrNoRows {
		http.Error(w, "Database error", http.StatusInternalServerError)
		return
	}
	if err == nil {
		http.Error(w, "Email already exists", http.StatusConflict)
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Could not hash password", http.StatusInternalServerError)
		return
	}

	result, err := db.DB.Exec(
		"INSERT INTO users(name, email, password_hash) VALUES(?, ?, ?)",
		req.Name, req.Email, string(hashedPassword),
	)
	if err != nil {
		http.Error(w, "Could not create user", http.StatusInternalServerError)
		return
	}

	userID, err := result.LastInsertId()
	if err != nil {
		http.Error(w, "Could not get new user id", http.StatusInternalServerError)
		return
	}

	token, err := utils.GenerateToken(int(userID), req.Email)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message": "User created successfully",
		"token":   token,
		"user": map[string]any{
			"id":             userID,
			"name":           req.Name,
			"email":          req.Email,
			"profilePicture": "",
		},
	})
}

func Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	if req.Email == "" || req.Password == "" {
		http.Error(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	var id int
	var name, email, passwordHash string
	var profilePicture sql.NullString

	err := db.DB.QueryRow(
		"SELECT id, name, email, password_hash, profile_picture FROM users WHERE email = ?",
		req.Email,
	).Scan(&id, &name, &email, &passwordHash, &profilePicture)

	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(passwordHash), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	token, err := utils.GenerateToken(id, email)
	if err != nil {
		http.Error(w, "Could not generate token", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message": "Login successful",
		"token":   token,
		"user": map[string]any{
			"id":             id,
			"name":           name,
			"email":          email,
			"profilePicture": profilePicture.String,
		},
	})
}

func Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var id int
	var name, email string
	var profilePicture sql.NullString

	err := db.DB.QueryRow(
		"SELECT id, name, email, profile_picture FROM users WHERE id = ?",
		userID,
	).Scan(&id, &name, &email, &profilePicture)

	if err != nil {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"id":             id,
		"name":           name,
		"email":          email,
		"profilePicture": profilePicture.String,
	})
}

func UpdateProfilePicture(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPut && r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	userID, ok := r.Context().Value(middleware.UserIDKey).(int)
	if !ok {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req struct {
		ProfilePicture string `json:"profilePicture"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid body", http.StatusBadRequest)
		return
	}

	_, err := db.DB.Exec(
		"UPDATE users SET profile_picture = ? WHERE id = ?",
		req.ProfilePicture,
		userID,
	)

	if err != nil {
		http.Error(w, "Could not update profile picture", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{
		"message":        "Profile picture updated",
		"profilePicture": req.ProfilePicture,
	})
}
