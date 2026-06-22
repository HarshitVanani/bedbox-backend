// backend/models/Resident.js
const mongoose = require('mongoose');

const ResidentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    bedNumber: {
        type: Number,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Active', 'Checked Out'],
        default: 'Active'
    },
    checkInDate: {
        type: Date,
        default: Date.now
    },
    checkOutDate: {
        type: Date
    },
    duesCleared: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Resident', ResidentSchema);