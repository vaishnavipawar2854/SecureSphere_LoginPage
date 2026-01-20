# SecureSphere Frontend

Modern authentication UI with login, registration, and dashboard features.

## Prerequisites

- Node.js (v14 or higher)
- Running backend API server

## Setup

1. Install dependencies:
```bash
npm install
```

2. Ensure backend is running on `http://localhost:5000`

## Running the Application

**Start development server**:
```bash
npm start
```

or

```bash
npm run dev
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Features

- **Login Page** (`index.html`) - User authentication
- **Registration Page** (`register.html`) - New user signup
- **Dashboard** (`dashboard.html`) - Protected user dashboard

## Development

The application uses `live-server` which provides:
- Auto-reload on file changes
- Local development server
- Easy testing across devices on same network

## API Configuration

The frontend connects to the backend API at:
- Development: `http://localhost:5000/api/auth`
- Production: Configured for Vercel deployment

## Project Structure

```
frontend/
├── index.html          # Login page
├── register.html       # Registration page
├── dashboard.html      # Dashboard (requires auth)
├── script.js           # Main JavaScript logic
├── style.css           # Styles
├── package.json        # Dependencies
└── assets/            # Images and static files
```
