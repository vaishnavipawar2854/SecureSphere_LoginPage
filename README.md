# SecureSphere Login System

Full-stack authentication system with separate frontend and backend projects.

## Project Structure

```
-SecureSphere_LoginPage-main/
├── backend/          # Express API server
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   ├── package.json
│   └── README.md
│
└── frontend/         # Client application
    ├── index.html
    ├── register.html
    ├── dashboard.html
    ├── script.js
    ├── style.css
    ├── package.json
    └── README.md
```

## Quick Start

### 1. Start Backend (Terminal 1)

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5000`

### 2. Start Frontend (Terminal 2)

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`

## Features

- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Protected dashboard routes
- ✅ Modern, responsive UI
- ✅ Password visibility toggle
- ✅ Form validation
- ✅ Toast notifications
- ✅ MongoDB integration

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- bcryptjs for password hashing

**Frontend:**
- Vanilla JavaScript
- HTML5 + CSS3
- Live Server for development

## Development

Both projects are completely independent:
- Backend serves only API endpoints
- Frontend is a standalone client
- CORS configured for local development
- Each has its own `package.json` and dependencies

See individual README files in `backend/` and `frontend/` for detailed setup instructions.
