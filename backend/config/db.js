const mongoose = require('mongoose');
const env = require('./env');

const connectDB = async () => {
    try {
        if (mongoose.connection.readyState >= 1) {
            console.log('MongoDB already connected.');
            return;
        }
        const conn = await mongoose.connect(env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
