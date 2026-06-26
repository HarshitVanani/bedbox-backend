const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// backend/models/Student.js (or your equivalent model file)
const studentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roomNo: { type: String, required: true },
  bedAssignment: { type: String, required: true },
  mobile: { type: String, required: true },
  emergencyContact: { type: String, required: true },
  
  // 🆕 ADD THESE TWO FIELDS HERE:
  emergencyRelation: { type: String, required: true },
  address: { type: String, required: true }
}, { timestamps: true });

// FIXED: Clean async/await hook without 'next' callback parameter
UserSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', UserSchema);