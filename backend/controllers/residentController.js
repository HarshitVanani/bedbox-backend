// backend/controllers/residentController.js
const Resident = require('../models/Resident');
const User = require('../models/User');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const bcrypt = require('bcryptjs');

// ==========================================
// 1. ONBOARD NEW RESIDENT & OCCUPY BED ASSET
// ==========================================
exports.addResident = async (req, res) => {
    try {
        const { fullName, username, password, roomNumber, bedNumber, phoneNumber, emergencyContact } = req.body;

        // Strip symbols and force lowercase to guarantee authentication tracking matches
        const cleanUsername = username.trim().toLowerCase().replace('@', '');
        const cleanRoom = roomNumber.trim();
        const targetBed = parseInt(bedNumber);

        // Guard Check A: Verify username uniqueness across User Collection
        const userExists = await User.findOne({ username: cleanUsername });
        if (userExists) {
            return res.status(400).json({ message: 'This username is already allocated to an active account.' });
        }

        // Guard Check B: Verify the target room document exists inside MongoDB
        const room = await Room.findOne({ roomNumber: cleanRoom });
        if (!room) {
            return res.status(400).json({ message: `Room ${cleanRoom} does not exist in your Rooms & Bed Grid yet. Please create it first.` });
        }

        // Guard Check C: Verify the bed index number exists inside that specific room array
        const bed = room.beds.find(b => b.bedNumber === targetBed);
        if (!bed) {
            return res.status(400).json({ message: `Bed slot ${targetBed} does not exist inside Room ${cleanRoom}.` });
        }
        
        // Guard Check D: Verify that the slot is not already Occupied
        if (bed.status !== 'Available') {
            return res.status(400).json({ message: `Bed slot ${targetBed} in Room ${cleanRoom} is currently occupied by another student.` });
        }

        // Action A: Create secure credentials account record row for student login
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const newUserAccount = await User.create({
            username: cleanUsername,
            password: hashedPassword,
            role: 'student',
            phoneNumber: phoneNumber.trim()
        });

        // Action B: Compile comprehensive resident profile record document
        const newResident = await Resident.create({
            userId: newUserAccount._id,
            fullName: fullName.trim(),
            username: cleanUsername,
            roomNumber: cleanRoom,
            bedNumber: targetBed,
            phoneNumber: phoneNumber.trim(),
            emergencyContact: emergencyContact.trim(),
            status: 'Active',
            checkInDate: new Date()
        });

        // Action C: Flip asset tracking parameter state inside target room document array
        bed.status = 'Occupied';
        bed.occupiedBy = newUserAccount._id;
        await room.save();

        res.status(201).json({ message: 'Resident checked in cleanly!', newResident });
    } catch (error) {
        console.error("--- BACKEND REGISTRATION CRASH LOG ---", error.message);
        res.status(500).json({ message: 'Internal server processing error', error: error.message });
    }
};

// ==========================================
// 2. FETCH ALL HISTORIC DIRECTORY RECORDS
// ==========================================
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
exports.forceDeleteResident = async (req, res) => {
    try {
        const { id } = req.params;

        const resident = await Resident.findById(id);
        if (!resident) {
            return res.status(404).json({ success: false, message: "Resident profile record not found." });
        }

        if (resident.userId) {
            await User.findByIdAndDelete(resident.userId);
        }

        const room = await Room.findOne({ roomNumber: resident.roomNumber });
        if (room) {
            const bed = room.beds.find(b => b.bedNumber === resident.bedNumber);
            if (bed) {
                bed.status = 'Available';
                bed.occupiedBy = null;
                await room.save();
            }
        }

        await Resident.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Resident profile completely purged." });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Wipe routing failure.', error: error.message });
    }
};