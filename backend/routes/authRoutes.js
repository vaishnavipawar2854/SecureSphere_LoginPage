/**
 * Authentication Routes
 * 
 * Defines all authentication-related API endpoints.
 * Includes validation middleware for request data.
 */

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

/**
 * Validation Rules
 */

// Registration validation
const registerValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2 }).withMessage('Name must be at least 2 characters')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    
    body('confirmPassword')
        .notEmpty().withMessage('Please confirm your password')
];

// Login validation
const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email')
        .normalizeEmail(),
    
    body('password')
        .notEmpty().withMessage('Password is required')
];

/**
 * Routes
 */

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, authController.register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, authController.login);

// @route   GET /api/auth/profile
// @desc    Get current user profile
// @access  Private (requires authentication)
router.get('/profile', protect, authController.getProfile);

// @route   POST /api/auth/logout
// @desc    Logout user (clear token)
// @access  Private
router.post('/logout', protect, authController.logout);

// @route   GET /api/auth/verify
// @desc    Verify if user is authenticated
// @access  Private
router.get('/verify', protect, authController.verifyToken);

module.exports = router;
