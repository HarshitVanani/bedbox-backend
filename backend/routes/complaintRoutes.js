// backend/routes/complaintRoutes.js
const express = require('express');
const router = express.Router();
const { fileComplaint, getComplaints, resolveComplaint } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Secure endpoints linked to role validation tokens
router.post('/', protect, fileComplaint);
router.get('/', protect, getComplaints);
router.put('/resolve', protect, authorize('admin'), resolveComplaint);

module.exports = router;