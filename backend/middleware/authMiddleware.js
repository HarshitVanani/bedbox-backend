// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token signature from Header array
            token = req.headers.authorization.split(' ')[1];

            // Decode payload structure
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey123');

            // DEFENSIVE FIX: Check both decoded.id and decoded._id dynamically so it NEVER fails validation
            const userId = decoded.id || decoded._id;
            
            req.user = await User.findById(userId).select('-password');
            
            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user profile session non-existent.' });
            }

            return next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token validation failed.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, token signature is missing.' });
    }
};

// Authorization Role Guard
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: `Role (${req.user?.role || 'Guest'}) is not permitted to access this sector resource.` });
        }
        next();
    };
};

module.exports = { protect, authorize };