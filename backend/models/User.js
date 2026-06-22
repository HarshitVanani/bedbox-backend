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
        sparse: true // Allows multiple students to not have a phone number during setup
    }
}, { timestamps: true }); // Automatically manages createdAt and updatedAt fields

module.exports = mongoose.model('User', UserSchema);