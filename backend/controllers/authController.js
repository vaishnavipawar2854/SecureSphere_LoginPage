/**
 * Authentication Controller
 * 
 * Handles all authentication-related business logic:
 * - User registration
 * - User login
 * - User profile retrieval
 * - User logout
 */

const User = require('../models/User');
const { validationResult } = require('express-validator');

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { name, email, password, confirmPassword } = req.body;

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered. Please use a different email or login.'
            });
        }

        // Create new user
        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password
        });

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set httpOnly cookie for security
        const cookieExpire = process.env.COOKIE_EXPIRE || 7; // Default 7 days
        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
            httpOnly: true, // Prevents XSS attacks
            secure: process.env.NODE_ENV === 'production', // HTTPS only in production
            sameSite: 'strict' // Prevents CSRF attacks
        };

        res.cookie('token', token, cookieOptions);

        // Send response
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    try {
        // Validate request
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user and include password field
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Update last login time
        user.lastLogin = Date.now();
        await user.save({ validateBeforeSave: false });

        // Generate JWT token
        const token = user.generateAuthToken();

        // Set httpOnly cookie for security
        const cookieExpire = process.env.COOKIE_EXPIRE || 7; // Default 7 days
        const cookieOptions = {
            expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        };

        res.cookie('token', token, cookieOptions);

        // Send response
        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/profile
 * @access  Private (requires authentication)
 */
exports.getProfile = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.getPublicProfile()
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
    try {
        // Clear the authentication cookie
        res.cookie('token', 'none', {
            expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
            httpOnly: true
        });

        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });

    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during logout'
        });
    }
};

/**
 * @desc    Verify token (check if user is authenticated)
 * @route   GET /api/auth/verify
 * @access  Private
 */
exports.verifyToken = async (req, res) => {
    try {
        // User is already attached to req by auth middleware
        res.status(200).json({
            success: true,
            authenticated: true,
            user: req.user
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            authenticated: false,
            message: 'Not authenticated'
        });
    }
};
