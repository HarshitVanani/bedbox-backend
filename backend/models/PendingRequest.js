const mongoose = require('mongoose');

const PendingRequestSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true }, 
    roomNumber: { type: String, required: true, trim: true },
    bedNumber: { type: Number, required: true },
    phoneNumber: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true }, // Added field
    emergencyContact: { type: String, required: true, trim: true }, // Contact Name/Phone
    emergencyRelation: { type: String, required: true, trim: true }, // Added field (e.g., Father)
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
}, { timestamps: true });

module.exports = mongoose.model('PendingRequest', PendingRequestSchema);
