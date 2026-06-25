const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true,
        trim: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['admin', 'student'], 
        default: 'student' 
    },
    phoneNumber: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    receiveSMSAlerts: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    autoIndex: true // Forces Mongoose to rebuild/sync mismatched database indexes on startup
});

// AUTOMATIC PASSWORD HASHING HOOK
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model('User', UserSchema);