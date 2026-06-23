# 💰 FinTracker - Personal Finance Tracker

**DecodeLabs Full Stack Internship — Week 4 Project**

A full-stack Personal Finance Tracker built with React, Node.js, Express, and MongoDB.

---

## ✨ Features

- **User Authentication** — Register & Login with JWT
- **Dashboard** — Stats cards (Income, Expense, Balance) + Bar chart + Doughnut chart
- **Transactions** — Add, Edit, Delete transactions with category & date
- **Filtering** — Filter by type, month, year
- **Export CSV** — Download all transactions as CSV
- **Responsive UI** — Works on mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router, Chart.js, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT + bcryptjs |

---

## 🚀 How to Run

### Prerequisites
- Node.js (v16+)
- MongoDB (local or MongoDB Atlas)

### 1. Clone and setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env → add your MONGO_URI and JWT_SECRET
npm run dev
```

Backend runs on **http://localhost:5000**

### 2. Setup Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs on **http://localhost:3000**

---

## 📁 Project Structure

```
week4-finance-tracker/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── transactions.js
│   │   └── categories.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
└── frontend/
    ├── public/
    └── src/
        ├── context/AuthContext.js
        ├── pages/
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Dashboard.js
        │   └── Transactions.js
        ├── components/Navbar.js
        ├── App.js
        └── App.css
```

---

## 🔗 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/transactions` | Get all transactions (with filters) |
| POST | `/api/transactions` | Add transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |
| GET | `/api/transactions/summary` | Monthly summary for charts |

---

*Built by Arnav — DecodeLabs Internship Week 4*
