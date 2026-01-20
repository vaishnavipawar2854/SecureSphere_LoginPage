/**
 * MongoDB Database Connection Configuration
 * 
 * Establishes connection to MongoDB using Mongoose.
 * Includes error handling and connection event listeners.
 */

const mongoose = require('mongoose');

/**
 * Connect to MongoDB database
 * @returns {Promise<void>}
 */
const connectDB = async () => {
    try {
        // Attempt connection (no options needed for modern MongoDB driver)
        const conn = await mongoose.connect(process.env.MONGODB_URI);

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        console.log(`📊 Database: ${conn.connection.name}`);

        // Connection event listeners
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️  MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to app termination');
            process.exit(0);
        });

    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.error('💡 Make sure MongoDB is running on your system');
        process.exit(1);
    }
};

module.exports = connectDB;
