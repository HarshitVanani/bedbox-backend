// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// =========================================================
// 1. POST: User Sign-In / Authentication Login Route
// =========================================================
// 🎯 FIXED: Direct routing pipeline abstraction shifted straight to your secure controller 
// that utilizes proper bcrypt comparison logic against hashed database records.
router.post('/login', authController.login);

// =========================================================
// 2. PATCH: Toggle Real-Time Notifications / Configuration State
// =========================================================
// Keeps your frontend alert configurations mapping working cleanly with protect middleware
router.patch('/toggle-alerts', protect, authController.changePassword); 

module.exports = router;