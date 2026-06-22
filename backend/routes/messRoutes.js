// backend/routes/messRoutes.js
const express = require('express');
const router = express.Router();
const messCtrl = require('../controllers/messController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. GET base menu mapping sheet
router.get('/', protect, messCtrl.getMenu);

// 2. PUT edit/update dish links
router.put('/update', protect, authorize('admin'), messCtrl.updateMeal);

// 3. 🔥 POST link to support our new structural template bootstrapper button
// New accessible line (Temporarily remove authorize for the template build)
router.post('/init-day-template-xyz', protect, messCtrl.initDayTemplate);
module.exports = router;