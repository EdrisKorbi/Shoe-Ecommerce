# 🛒 ShoeHub – E-commerce Web App

ShoeHub is a full-stack e-commerce application built with:

- ⚡ Frontend: TypeScript (Vite)
- 🐹 Backend: Go (Golang)
- 🗄️ Database: MySQL (XAMPP)
- ✉️ Email Service: EmailJS

---

## 🚀 Features

### 👤 Authentication
- User registration & login
- JWT-based authentication
- Password hashing (bcrypt)
- Persistent sessions

### 🛍️ Shopping
- Product listing
- Product details page
- Select size, color, quantity
- Add to cart

### 🛒 Cart
- Add/remove items
- Quantity management
- Dynamic total calculation

### 👤 Profile
- Update name
- Upload & crop profile picture
- Image stored in database

### 📧 Orders
- Order confirmation email
- Detailed order summary
- Price × quantity calculation
- Clean email UI

---

## 🧱 Project Structure

shoe-ecommerce/
│
├── backend/ # Go backend
│ ├── handlers/
│ ├── middleware/
│ ├── db/
│ ├── utils/
│ ├── main.go
│ └── .env
│
├── src/ # Frontend (TypeScript)
│ ├── auth.ts
│ ├── main.ts
│ ├── state.ts
│ ├── data.ts
│ └── types.ts
│
├── public/
├── index.html
├── package.json
├── .env # Frontend env (EmailJS)
└── README.md

---

## ⚙️ Setup

### Clone project
git clone https://github.com/your-username/shoehub.git
cd shoehub

---

## 🗄️ Backend Setup

CREATE DATABASE shoe_store;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    password_hash TEXT,
    profile_picture MEDIUMTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

▶ Run backend
cd backend
go build -o server.exe .
./server.exe

---

## 🌐 Frontend Setup

npm install
npm run dev

---

## 🔐 Environment Variables

Frontend:
VITE_EMAILJS_SERVICE_ID=...
VITE_EMAILJS_TEMPLATE_ID=...
VITE_EMAILJS_PUBLIC_KEY=...

Backend:
DB_USER=root
DB_PASSWORD=
DB_NAME=shoe_store
JWT_SECRET=your_secret_key

---

## 🧑‍💻 Author

Korbi Edris  

Computer Science Student