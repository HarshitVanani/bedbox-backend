// backend/controllers/residentController.js
const Resident = require('../models/Resident');
const User = require('../models/User');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const bcrypt = require('bcryptjs');

// backend/controllers/residentController.js

// ==========================================
// 1. ONBOARD NEW RESIDENT & OCCUPY BED ASSET
// ==========================================
exports.addResident = async (req, res) => {
    try {
        const { fullName, username, password, roomNumber, bedNumber, phoneNumber, emergencyContact } = req.body;

        // Clean values to avoid spaces breaking credentials lookup
        const cleanUsername = username.trim().toLowerCase();
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

        // Action A: Create secure credentials account record row
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
        // Pulls both Active boarders and archived Checked-out entries sorted by most recent
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

        // Clean any potential trailing spaces or formatting symbols from the input field
        const cleanInputUsername = username.trim().replace('@', '');
        const cleanPhone = phoneNumber.trim();

        // Debug output helper printed straight to your backend log terminal block
        console.log(`[Checkout Triggered] Input Username: "${cleanInputUsername}" | Input Phone: "${cleanPhone}"`);

        // Attempt Strategy A: Multi-criteria lookup using tolerant regular expressions
        let resident = await Resident.findOne({
            username: { $regex: new RegExp("^@?" + cleanInputUsername + "$", "i") },
            status: 'Active'
        });

        // Attempt Strategy B: Fallback safety search using phone number if username formatting has initial test variations
        if (!resident) {
            resident = await Resident.findOne({
                phoneNumber: cleanPhone,
                status: 'Active'
            });
        }

        // Final Security Catch Refusal Guard
        if (!resident) {
            return res.status(404).json({
                message: `No active resident profile found matching username '${username}' and phone '${phoneNumber}'.`
            });
        }

        // Step A: Audit Outstanding Financial Liabilities
        const unpaidBills = await Invoice.findOne({ studentId: resident.userId, status: 'Unpaid' });
        const cleanFinances = unpaidBills ? false : true;

        // Step B: Re-open bed assets back to open hostel status
        const room = await Room.findOne({ roomNumber: resident.roomNumber });
        if (room) {
            const bed = room.beds.find(b => b.bedNumber === resident.bedNumber);
            if (bed) {
                bed.status = 'Available';
                bed.occupiedBy = null;
                await room.save();
                console.log(`[Asset Freed] Room ${room.roomNumber} Bed ${bed.bedNumber} is now Available.`);
            }
        }

        // Step C: Update directory data flags to move profile out of current grid into historical archives
        resident.status = 'Checked Out';
        resident.checkOutDate = checkOutDate ? new Date(checkOutDate) : new Date();
        resident.duesCleared = cleanFinances;
        
        // Append tag so it displays gracefully as a past asset footprint mapping record
        resident.roomNumber = resident.roomNumber + " (Archived)";
        await resident.save();

        res.json({
            message: `Resident ${resident.fullName} released and archived successfully.`,
            duesStatus: cleanFinances ? 'All financial bills completely clear.' : 'Warning: Profile moved to history with outstanding unpaid invoices.'
        });
    } catch (error) {
        res.status(500).json({ message: 'Critical failure running check-out gate operations', error: error.message });
    }
};