// backend/routes/residentRoutes.js
const express = require('express');
const router = express.Router();
const { addResident, getAllResidents, checkOutResident } = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, authorize('admin'), addResident);
router.get('/', protect, authorize('admin'), getAllResidents);
router.post('/checkout', protect, authorize('admin'), checkOutResident); // NEW CHECKOUT GAP API LINK

module.exports = router;