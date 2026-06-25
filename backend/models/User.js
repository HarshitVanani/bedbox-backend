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

module.exports = mongoose.model('User', UserSchema);// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    receiveSMSAlerts: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// 🎯 AUTOMATIC PASSWORD HASHING HOOK
// This hashes the plain text password safely right before it hits MongoDB
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);