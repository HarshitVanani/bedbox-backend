// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// 1. Standard Login Endpoint (Points to line 7 error location)
router.post('/login', authCtrl.login);

// 2. New Secure Change Password Endpoint
router.put('/change-password', protect, authCtrl.changePassword);

// 3. Root Admin Seeding Setup Endpoint (Matches our updated controller function)
router.post('/setup-root-admin-xyz', authCtrl.registerAdmin || authCtrl.setupAdmin || ((req, res) => res.json({ message: "Fallback Admin Setup" })));

module.exports = router;