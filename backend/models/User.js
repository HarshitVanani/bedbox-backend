// backend/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'student'], default: 'student' },
    phoneNumber: { type: String, trim: true }
}, { timestamps: true });

// 🎯 Ensure this matches 'userSchema' exactly!
userSchema.pre('save', async function (next) {
    // If you have bcrypt password hashing logic, it sits here safely
    next();
});

module.exports = mongoose.model('User', userSchema);