const express = require('express');
const router = express.Router();
const residentController = require('../controllers/residentController');

router.post('/', residentController.addResident);
router.post('/register', residentController.addResident);
router.get('/', residentController.getAllResidents);
router.post('/checkout', residentController.checkOutResident);
router.delete('/:id', residentController.forceDeleteResident);

// Approval Routes
router.post('/request-access', residentController.requestAccess);
router.get('/pending-requests', residentController.getPendingRequests);
router.post('/process-approval', residentController.handleAdminApproval);

module.exports = router;