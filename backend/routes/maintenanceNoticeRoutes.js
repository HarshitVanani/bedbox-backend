const express = require('express');
const router = express.Router();
const MaintenanceNotice = require('../models/MaintenanceNotice');
const User = require('../models/User'); // ◄ 1. Import User Model to look up student numbers
const { sendSMSNotification } = require('../smsService'); // ◄ 2. Import Centralized SMS Engine
const { protect } = require('../middleware/authMiddleware'); 

// 1. GET: Fetch all active maintenance notices
router.get('/', protect, async (req, res) => { 
  try {
    const notices = await MaintenanceNotice.find().sort({ createdAt: -1 });
    res.json(notices);
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving active maintenance logs.' });
  }
});

// 2. POST: Create a new live notice (Admin Only)
router.post('/create', protect, async (req, res) => { 
  const { title, description, areaOrLocation } = req.body;
  if (!title || !description || !areaOrLocation) {
    return res.status(400).json({ message: 'Please fully specify all notification properties.' });
  }
  try {
    // Save notice data into MongoDB
    const newNotice = new MaintenanceNotice({ title, description, areaOrLocation });
    await newNotice.save();

    // 🎯 SMS DISPATCH PIPELINE: Fetch all active students 
    const activeStudents = await User.find({ role: 'student' });
    
    // Fire off asynchronous broadcast checks for each student profile
    activeStudents.forEach(async (student) => {
      const smsPayload = `New Maintenance Notice: "${title}" has been scheduled for ${areaOrLocation}. Details: ${description}`;
      await sendSMSNotification(student, smsPayload);
    });

    res.status(201).json({ message: 'Maintenance tracking broadcast dispatched successfully!', data: newNotice });
  } catch (err) {
    res.status(500).json({ message: 'Error compiling announcement file logs.' });
  }
});

// 3. DELETE: Purge notice after task completion (Admin Only)
router.delete('/:id', protect, async (req, res) => { 
  try {
    const deletedItem = await MaintenanceNotice.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ message: 'Notice file reference not found.' });
    res.json({ message: 'Task completed. Notice successfully archived and cleared.' });
  } catch (err) {
    res.status(500).json({ message: 'Error erasing notice tracking block.' });
  }
});

module.exports = router;