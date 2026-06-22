// backend/models/Room.js
const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    floorNumber: {
        type: String,
        required: true,
        default: "1" // Default to 1st Floor if not specified
    },
    beds: [{
        bedNumber: { type: Number, required: true },
        status: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
        occupiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);