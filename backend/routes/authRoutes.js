const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// 1. POST: User Sign-In / Authentication Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) { // Replace with bcrypt comparison if hashing is implemented
            return res.status(401).json({ message: 'Invalid username or access credentials.' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secretkey123', { expiresIn: '30d' });

        // 🎯 DEFENSIVE PAYLOAD: Ensure receiveSMSAlerts is strictly present with a fallback
        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                phoneNumber: user.phoneNumber || '',
                receiveSMSAlerts: user.receiveSMSAlerts !== undefined ? user.receiveSMSAlerts : true
            }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error parsing user authentication logs.' });
    }
});

// 2. PATCH: Toggle real-time notifications state dynamically (Step 2 Implementation)
router.patch('/toggle-alerts', protect, async (req, res) => {
    try {
        // req.user is populated cleanly by your working protect middleware
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User profile non-existent.' });
        }

        // Initialize safely if missing in DB, then invert the boolean setting flag
        const currentSetting = user.receiveSMSAlerts !== undefined ? user.receiveSMSAlerts : true;
        user.receiveSMSAlerts = !currentSetting;
        
        await user.save();

        res.json({ 
            message: `Real-time notifications successfully ${user.receiveSMSAlerts ? 'activated' : 'muted'}.`, 
            receiveSMSAlerts: user.receiveSMSAlerts 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error shifting alert configurations.' });
    }
});

module.exports = router;