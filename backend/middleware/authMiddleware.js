/**
 * Authentication Middleware
 * 
 * Protects routes by verifying JWT tokens.
 * Extracts token from cookies or Authorization header.
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - Verify JWT token
 * Attaches user to request object if token is valid
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in cookies first (more secure)
        if (req.cookies.token) {
            token = req.cookies.token;
        }
        // Fallback to Authorization header
        else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        // Check if token exists
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route. Please login.'
            });
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Find user by ID from token payload
            const user = await User.findById(decoded.id);

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found. Token invalid.'
                });
            }

            // Attach user to request object
            req.user = {
                id: user._id,
                name: user.name,
                email: user.email
            };

            next();

        } catch (error) {
            // Token verification failed
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid token. Please login again.'
                });
            }
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired. Please login again.'
                });
            }

            throw error;
        }

    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error during authentication'
        });
    }
};

/**
 * Optional authentication - Doesn't fail if no token
 * Used for routes that can be accessed by both authenticated and unauthenticated users
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                
                if (user) {
                    req.user = {
                        id: user._id,
                        name: user.name,
                        email: user.email
                    };
                }
            } catch (error) {
                // Token invalid or expired - just continue without user
                req.user = null;
            }
        }

        next();

    } catch (error) {
        console.error('Optional auth middleware error:', error);
        next();
    }
};
