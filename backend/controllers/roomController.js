// backend/controllers/roomController.js
const Room = require('../models/Room');

// =========================================================
// 1. CREATE AND DEPLOY A NEW STRUCTURAL ROOM (WITH FLOORS)
// =========================================================
exports.createRoom = async (req, res) => {
    try {
        const { roomNumber, floorNumber, beds } = req.body;

        if (!roomNumber) {
            return res.status(400).json({ message: 'Room number field criteria is mandatory.' });
        }

        // Guard Check: Verify if this room number is already taken
        const roomExists = await Room.findOne({ roomNumber: roomNumber.trim() });
        if (roomExists) {
            return res.status(400).json({ message: `Room ${roomNumber} already exists in your inventory setup logs.` });
        }

        // Action: Compile document inside MongoDB with floor classification strings
        const newRoom = await Room.create({
            roomNumber: roomNumber.trim(),
            floorNumber: floorNumber || "1st Floor",
            beds: beds || []
        });

        res.status(201).json({ message: 'Structural room layer deployed successfully.', newRoom });
    } catch (error) {
        res.status(500).json({ message: 'Internal server failure compiling room asset structural logs.', error: error.message });
    }
};

// =========================================================
// 2. FETCH ALL ACTIVE LIVE ROOM ASSET SCHEMAS
// =========================================================
exports.getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find().sort({ roomNumber: 1 });
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: 'Could not synchronize hostel room map arrays.', error: error.message });
    }
};

// =========================================================
// 3. GET SINGLE ROOM PROFILE BY IDENTIFIER INDEX
// =========================================================
exports.getRoomById = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ message: 'Target room document reference index not found.' });
        }
        res.json(room);
    } catch (error) {
        res.status(500).json({ message: 'Error pulling room parameters profile ledger row.', error: error.message });
    }
};

// =========================================================
// 4. UPDATE ROOM ATTRIBUTES OR MODIFY STATUS MANUALLY (WITH BED SCALING)
// =========================================================
const updateRoomHandler = async (req, res) => {
    try {
        const { floorNumber, roomNumber, beds } = req.body; 
        const fields = {};
        
        if (floorNumber) fields.floorNumber = floorNumber;
        if (roomNumber) fields.roomNumber = roomNumber.trim();
        if (beds) fields.beds = beds; 

        const room = await Room.findByIdAndUpdate(
            req.params.id, 
            { $set: fields }, 
            { new: true }
        );
        
        if (!room) return res.status(404).json({ message: 'Target room not found.' });
        res.json({ message: 'Room scaling layout parameters synchronized.', room });
    } catch (error) {
        res.status(500).json({ message: 'Internal update failure', error: error.message });
    }
};
exports.updateRoom = updateRoomHandler;
exports.editRoom = updateRoomHandler;
exports.modifyRoom = updateRoomHandler;

// =========================================================
// 5. PURGE / DELETE A ROOM PERMANENTLY FROM INFRASTRUCTURE
// =========================================================
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ message: 'Target room not found in layout grid collections.' });
        res.json({ message: 'Room infrastructure block removed cleanly from active server arrays.' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing structural room assets from MongoDB database logs.', error: error.message });
    }
};