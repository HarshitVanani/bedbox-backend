// backend/controllers/residentController.js
const Resident = require('../models/Resident');
const User = require('../models/User');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. ONBOARD NEW RESIDENT & OCCUPY BED ASSET
// ==========================================
// backend/controllers/residentController.js

// backend/controllers/residentController.js

exports.addResident = async (req, res) => {
    try {
        const { fullName, username, password, roomNumber, bedNumber, phoneNumber, emergencyContact } = req.body;

        const cleanUsername = username.trim().toLowerCase().replace('@', '');
        const cleanRoom = roomNumber.trim();
        const targetBed = parseInt(bedNumber);

        let formattedPhone = phoneNumber.trim();
        if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
            formattedPhone = `+91${formattedPhone}`;
        }

        const userExists = await User.findOne({ username: cleanUsername });
        if (userExists) {
            return res.status(400).json({ message: 'This username is already allocated to an active account.' });
        }

        const room = await Room.findOne({ roomNumber: cleanRoom });
        if (!room) {
            return res.status(400).json({ message: `Room ${cleanRoom} does not exist.` });
        }

        const bed = room.beds.find(b => b.bedNumber === targetBed);
        if (!bed) {
            return res.status(400).json({ message: `Bed slot ${targetBed} does not exist.` });
        }
        
        if (bed.status !== 'Available') {
            return res.status(400).json({ message: `Bed slot ${targetBed} is occupied.` });
        }

        // 🎯 FIXED: Send the PLAIN TEXT password straight to User.create.
        // Do not use bcrypt here; your User schema pre-save middleware will hash it correctly once!
        const newUserAccount = await User.create({
            username: cleanUsername,
            password: password, // ◄ PASS RAW PLAIN TEXT
            role: 'student',
            phoneNumber: formattedPhone,
            receiveSMSAlerts: true 
        });

        const newResident = await Resident.create({
            userId: newUserAccount._id,
            fullName: fullName.trim(),
            username: cleanUsername,
            roomNumber: cleanRoom,
            bedNumber: targetBed,
            phoneNumber: formattedPhone,
            emergencyContact: emergencyContact.trim(),
            status: 'Active',
            checkInDate: new Date()
        });

        bed.status = 'Occupied';
        bed.occupiedBy = newUserAccount._id;
        await room.save();

        res.status(201).json({ message: 'Resident checked in cleanly!', newResident });
    } catch (error) {
        console.error("--- BACKEND REGISTRATION CRASH LOG ---", error.message);
        res.status(500).json({ message: 'Internal server processing error', error: error.message });
    }
};
exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().sort({ createdAt: -1 });
        res.json(residents);
    } catch (error) {
        res.status(500).json({ message: 'Failed to synchronize directory collections', error: error.message });
    }
};

// ==========================================
// 3. COMPLETE STUDENT CHECK-OUT GATE ROUTE
// ==========================================
exports.checkOutResident = async (req, res) => {
    try {
        const { username, phoneNumber, checkOutDate } = req.body;

        const cleanInputUsername = username.trim().toLowerCase().replace('@', '');
        const cleanPhone = phoneNumber.trim();

        let resident = await Resident.findOne({
            username: cleanInputUsername,
            status: 'Active'
        });

        if (!resident) {
            resident = await Resident.findOne({
                phoneNumber: cleanPhone,
                status: 'Active'
            });
        }

        if (!resident) {
            return res.status(404).json({
                message: `No active resident profile found matching username '${username}' and phone '${phoneNumber}'.`
            });
        }

        const unpaidBills = await Invoice.findOne({ studentId: resident.userId, status: 'Unpaid' });
        const cleanFinances = unpaidBills ? false : true;

        const room = await Room.findOne({ roomNumber: resident.roomNumber });
        if (room) {
            const bed = room.beds.find(b => b.bedNumber === resident.bedNumber);
            if (bed) {
                bed.status = 'Available';
                bed.occupiedBy = null;
                await room.save();
            }
        }

        resident.status = 'Checked Out';
        resident.checkOutDate = checkOutDate ? new Date(checkOutDate) : new Date();
        resident.duesCleared = cleanFinances;
        
        resident.roomNumber = resident.roomNumber + " (Archived)";
        await resident.save();

        res.json({ message: `Resident ${resident.fullName} released successfully.` });
    } catch (error) {
        res.status(500).json({ message: 'Critical failure running check-out gate operations', error: error.message });
    }
};

// ==========================================
// 4. EMERGENCY FORCE PURGE / DELETE RESIDENT
// ==========================================