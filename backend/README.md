# SecureSphere Backend API

Authentication API server built with Express, MongoDB, and JWT.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
PORT=5000
```

## Running the Server

**Development mode** (with auto-restart):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires auth)
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/verify` - Verify JWT token
- `GET /api/health` - Health check

## CORS Configuration

The backend allows requests from:
- `http://localhost:3000` (development frontend)
- Any localhost/127.0.0.1 origin in development mode
- Production frontend URL (when deployed)
