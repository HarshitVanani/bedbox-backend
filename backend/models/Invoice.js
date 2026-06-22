// backend/models/Invoice.js
const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    studentName: {
        type: String,
        required: true
    },
    roomNumber: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    billType: {
        type: String,
        enum: ['Room Rent', 'Mess Fees', 'Caution Deposit', 'Miscellaneous'],
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);