/**
 * User Model - MongoDB Schema
 * 
 * Defines the structure of user documents in MongoDB.
 * Includes password hashing, validation, and security features.
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [6, 'Password must be at least 6 characters'],
        select: false // Don't return password by default in queries
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically add createdAt and updatedAt fields
});

// Note: Email index is automatically created by the 'unique: true' option above
// No need to manually create it again

/**
 * Pre-save Middleware - Hash password before saving
 * Only runs if password is modified
 */
UserSchema.pre('save', async function(next) {
    // Only hash password if it's new or modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        // Generate salt (random data for hashing)
        const salt = await bcrypt.genSalt(10);
        
        // Hash password with salt
        this.password = await bcrypt.hash(this.password, salt);
        
        next();
    } catch (error) {
        next(error);
    }
});

/**
 * Instance Method - Compare entered password with hashed password
 * @param {string} enteredPassword - Password to verify
 * @returns {Promise<boolean>} - True if passwords match
 */
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Instance Method - Generate JWT token
 * @returns {string} - Signed JWT token
 */
UserSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { 
            id: this._id,
            email: this.email 
        },
        process.env.JWT_SECRET,
        { 
            expiresIn: process.env.JWT_EXPIRE 
        }
    );
};

/**
 * Instance Method - Get public user data (without sensitive info)
 * @returns {object} - User data for client
 */
UserSchema.methods.getPublicProfile = function() {
    return {
        id: this._id,
        name: this.name,
        email: this.email,
        registeredAt: this.createdAt,
        lastLogin: this.lastLogin
    };
};

// Export User model
module.exports = mongoose.model('User', UserSchema);
