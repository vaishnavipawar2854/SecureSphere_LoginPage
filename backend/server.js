/**
 * SecureSphere Authentication System - Main Server
 * 
 * This is the entry point for the Express server.
 * It sets up middleware, connects to MongoDB, and defines routes.
 */

const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware Configuration
// ========================

// CORS - Allow cross-origin requests from frontend
const allowedOrigins = [
    "https://secure-sphere-login-page.vercel.app",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://localhost:5173"
];

// Configure CORS with helpful development shortcuts
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, or server-to-server requests)
        if (!origin) return callback(null, true);

        // In development, allow localhost / 127.0.0.1 on any port to simplify testing
        if (process.env.NODE_ENV !== 'production') {
            if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
                console.log('CORS allowed (dev localhost):', origin);
                return callback(null, true);
            }
        }

        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        console.warn('CORS blocked for origin:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true // Allow cookies to be sent
}));

// Body parser - Parse JSON request bodies
app.use(express.json());

// URL-encoded parser - Parse form data
app.use(express.urlencoded({ extended: true }));

// Cookie parser - Parse cookies
app.use(cookieParser());

// Routes Configuration
// ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));

// 404 Handler - Catch all unmatched routes
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
// ====================
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start Server
// ============
const PORT = process.env.PORT || 5000;

// Only start server if not in serverless environment (Vercel)
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    const server = app.listen(PORT, () => {
        console.log(`\n🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
        console.log(`📡 API: http://localhost:${PORT}/api/auth`);
        console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
        console.error('❌ Unhandled Rejection:', err.message);
        server.close(() => process.exit(1));
    });
}

// Export app for Vercel serverless
module.exports = app;
