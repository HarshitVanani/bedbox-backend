// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'student'], 
        default: 'student' 
    },
    phoneNumber: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    // 🎯 ADD THIS EXACT LINE HERE
    receiveSMSAlerts: {
        type: Boolean,
        default: true // Means "Alerts Enabled" by default when they create an account
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);