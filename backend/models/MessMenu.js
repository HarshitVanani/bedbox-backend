// backend/models/MessMenu.js
const mongoose = require('mongoose');

const MessMenuSchema = new mongoose.Schema({
    day: { 
        type: String, 
        required: true, 
        unique: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    breakfast: { type: String, default: 'Not Configured' },
    lunch: { type: String, default: 'Not Configured' },
    dinner: { type: String, default: 'Not Configured' }
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', MessMenuSchema);