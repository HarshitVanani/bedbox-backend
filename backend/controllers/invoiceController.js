// backend/controllers/invoiceController.js
const Invoice = require('../models/Invoice');
const Resident = require('../models/Resident');

// 1. Generate a brand new invoice bill (Admin Only)
exports.createInvoice = async (req, res) => {
    try {
        const { username, amount, billType, dueDate } = req.body;

        // Find the resident by username to grab their actual profile parameters safely
        const resident = await Resident.findOne({ username });
        if (!resident) {
            return res.status(404).json({ message: `No active resident profile found matching username: ${username}` });
        }

        const newInvoice = await Invoice.create({
            studentId: resident.userId,
            studentName: resident.fullName,
            roomNumber: resident.roomNumber,
            amount: parseFloat(amount),
            billType,
            dueDate: new Date(dueDate)
        });

        res.status(201).json({ message: 'Invoice bill item generated successfully inside ledger registries.', newInvoice });
    } catch (error) {
        res.status(500).json({ message: 'Failed to execute invoice generation pipeline', error: error.message });
    }
};

// 2. Pull invoices polymorphically (Admin sees all, Student sees their own bills)
exports.getInvoices = async (req, res) => {
    try {
        let invoices;
        if (req.user.role === 'admin') {
            invoices = await Invoice.find().sort({ createdAt: -1 });
        } else {
            invoices = await Invoice.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        }
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Error pulling financial transaction registries', error: error.message });
    }
};

// 3. Update billing status to Paid (Admin Only)
exports.markAsPaid = async (req, res) => {
    try {
        const { invoiceId } = req.body;

        const invoice = await Invoice.findById(invoiceId);
        if (!invoice) return res.status(404).json({ message: 'Target ledger row invoice reference not found.' });

        invoice.status = 'Paid';
        await invoice.save();

        res.json({ message: 'Transaction cleared! Bill marked as Paid successfully.', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Failed to update ledger accounting status', error: error.message });
    }
};