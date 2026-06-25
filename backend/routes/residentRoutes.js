// backend/routes/residentRoutes.js
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

const { 
  addResident, 
  getAllResidents, 
  checkOutResident 
} = require('../controllers/residentController');

router.post('/register', protect, authorize('admin'), addResident);
router.get('/', protect, authorize('admin'), getAllResidents);
router.post('/checkout', protect, authorize('admin'), checkOutResident);

module.exports = router;