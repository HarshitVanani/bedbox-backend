const express = require('express');
const router = express.Router();
const Student = require('../models/Student'); // Make sure your model import path is correct

// Paste the updated route block right here:
router.post('/register', async (req, res) => {
  try {
    const { 
      fullName, 
      username, 
      password, 
      roomNumber, 
      bedNumber, 
      phoneNumber, 
      emergencyContact,
      emergencyRelation, 
      address 
    } = req.body;

    const existingStudent = await Student.findOne({ username });
    if (existingStudent) {
      return res.status(400).json({ message: 'Username already registered.' });
    }

    const newStudent = new Student({
      fullName,
      username,
      password, 
      roomNumber,
      bedNumber,
      phoneNumber,
      emergencyContact,
      emergencyRelation, 
      address 
    });

    await newStudent.save();
    res.status(201).json({ message: 'Resident onboarded successfully!' });

  } catch (error) {
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
});

module.exports = router;