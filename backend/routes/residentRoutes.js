const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', residentController.addResident);
router.post('/register', residentController.addResident);
router.get('/', residentController.getAllResidents);
router.post('/checkout', residentController.checkOutResident);
router.delete('/:id', residentController.forceDeleteResident);

// Profile Route for Students
router.get('/me', protect, residentController.getMyProfile);

// Approval Routes
router.post('/request-access', residentController.requestAccess);
router.get('/pending-requests', residentController.getPendingRequests);
router.post('/process-approval', residentController.handleAdminApproval);

module.exports = router;