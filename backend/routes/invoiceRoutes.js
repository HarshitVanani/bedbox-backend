// backend/routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, markAsPaid } = require('../controllers/invoiceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/generate', protect, authorize('admin'), createInvoice);
router.get('/', protect, getInvoices);
router.put('/settle', protect, authorize('admin'), markAsPaid);

module.exports = router;