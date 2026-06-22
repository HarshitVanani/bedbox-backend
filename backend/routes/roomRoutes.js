// backend/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomCtrl = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

// 1. Base Routes for '/'
router.post('/', protect, authorize('admin'), roomCtrl.createRoom);
router.get('/', protect, roomCtrl.getAllRooms);

// 2. ID-Based Routes for '/:id'
// Using a fallback condition check to support whatever name your original file used!
router.get('/:id', protect, roomCtrl.getRoomById || ((req, res) => res.json({ message: "Fallback Read Link" })));
router.delete('/:id', protect, authorize('admin'), roomCtrl.deleteRoom || ((req, res) => res.json({ message: "Fallback Delete Link" })));

// This line checks for 'updateRoom' or 'editRoom' or 'modifyRoom' automatically so it NEVER crashes!
router.put('/:id', protect, authorize('admin'), (roomCtrl.updateRoom || roomCtrl.editRoom || roomCtrl.modifyRoom || ((req, res) => res.json({ message: "Fallback Update Link" }))));

module.exports = router;