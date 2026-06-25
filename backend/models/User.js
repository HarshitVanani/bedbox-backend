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
    autoIndex: true 
});

// FIXED: Clean async/await hook without 'next' callback parameter
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);