const Resident = require('../models/Resident');
const User = require('../models/User');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const PendingRequest = require('../models/PendingRequest');

// Helper function to keep phone formats consistent across pipelines (+91)
const formatIndianPhoneNumber = (phone) => {
    if (!phone) return '';
    let formatted = phone.trim();
    if (formatted.length === 10 && !formatted.startsWith('+')) {
        formatted = `+91${formatted}`;
    }
    return formatted;
};

exports.addResident = async (req, res) => {
    try {
        const { fullName, username, password, roomNumber, bedNumber, phoneNumber, address, emergencyContact, emergencyRelation } = req.body;

        if (!username || !password || !roomNumber || !bedNumber || !phoneNumber || !fullName || !emergencyContact) {
            return res.status(400).json({ message: 'Missing required registration fields.' });
        }

        const cleanUsername = username.trim().toLowerCase().replace('@', '');
        const cleanRoom = roomNumber.trim();
        const targetBed = parseInt(bedNumber);
        const cleanAddress = (address || 'Not Provided').trim();
        const cleanEmergencyRelation = (emergencyRelation || 'Not Provided').trim();
        const formattedPhone = formatIndianPhoneNumber(phoneNumber);

        const userExists = await User.findOne({ username: cleanUsername });
        if (userExists) {
            return res.status(400).json({ message: 'This username is already allocated to an active account.' });
        }

        const room = await Room.findOne({ roomNumber: cleanRoom });
        if (!room) return res.status(400).json({ message: `Room ${cleanRoom} does not exist.` });

        const bed = room.beds.find(b => b.bedNumber === targetBed);
        if (!bed) return res.status(400).json({ message: `Bed slot ${targetBed} does not exist.` });
        if (bed.status !== 'Available') return res.status(400).json({ message: `Bed slot ${targetBed} is occupied.` });

        let newUserAccount;
        try {
            newUserAccount = await User.create({
                username: cleanUsername,
                password: password, 
                role: 'student',
                phoneNumber: formattedPhone
            });
        } catch (userError) {
            console.error("--- USER COLLECTION DB SAVE CRASH ---", userError);
            return res.status(500).json({ message: 'Failed creating auth account structure.', error: userError.message });
        }

        const newResident = await Resident.create({
            userId: newUserAccount._id,
            fullName: fullName.trim(),
            username: cleanUsername,
            roomNumber: cleanRoom,
            bedNumber: targetBed,
            phoneNumber: formattedPhone,
            address: cleanAddress,
            emergencyContact: emergencyContact.trim(),
            emergencyRelation: cleanEmergencyRelation,
            status: 'Active',
            checkInDate: new Date()
        });

        bed.status = 'Occupied';
        bed.occupiedBy = newUserAccount._id;
        await room.save();

        res.status(201).json({ message: 'Resident checked in cleanly!', newResident });
    } catch (error) {
        console.error("--- BACKEND REGISTRATION CRASH LOG ---", error);
        res.status(500).json({ message: 'Internal server processing error', error: error.message });
    }
};

exports.getAllResidents = async (req, res) => {
    try {
        const residents = await Resident.find().sort({ createdAt: -1 });
        res.json(residents);
    } catch (error) { 
        res.status(500).json({ message: 'Failed to fetch directory', error: error.message }); 
    }
};

exports.checkOutResident = async (req, res) => {
    try {
        const { username, phoneNumber, checkOutDate } = req.body;
        const cleanInputUsername = username ? username.trim().toLowerCase().replace('@', '') : '';
        
        let resident = null;
        if (cleanInputUsername) {
            resident = await Resident.findOne({ username: cleanInputUsername, status: 'Active' });
        }
        if (!resident && phoneNumber) {
            resident = await Resident.findOne({ phoneNumber: phoneNumber.trim(), status: 'Active' });
        }
        
        if (!resident) return res.status(404).json({ message: 'No active resident profile found.' });

        const unpaidBills = await Invoice.findOne({ studentId: resident.userId, status: 'Unpaid' });
        
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
        resident.duesCleared = !unpaidBills;
        resident.roomNumber = `${resident.roomNumber} (Archived)`;
        await resident.save();

        res.json({ message: `Resident ${resident.fullName} released successfully.` });
    } catch (error) { 
        res.status(500).json({ message: 'Gate system failure', error: error.message }); 
    }
};

exports.forceDeleteResident = async (req, res) => {
    try {
        const { id } = req.params;
        const resident = await Resident.findById(id);
        if (!resident) return res.status(404).json({ message: "Profile not found." });

        const room = await Room.findOne({ roomNumber: resident.roomNumber });
        if (room) {
            const bed = room.beds.find(b => b.bedNumber === resident.bedNumber);
            if (bed) { 
                bed.status = 'Available'; 
                bed.occupiedBy = null; 
                await room.save(); 
            }
        }
        if (resident.userId) await User.findByIdAndDelete(resident.userId);
        await Resident.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: "Resident structure purged." });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

// --- NEW APPROVAL PIPELINE OPERATIONS ---
exports.requestAccess = async (req, res) => {
    try {
        const { fullName, username, password, roomNumber, bedNumber, phoneNumber, address, emergencyContact, emergencyRelation } = req.body;
        
        // Form Validation Check
        if (!username || !password || !roomNumber || !bedNumber || !phoneNumber || !fullName || !address || !emergencyContact || !emergencyRelation) {
            return res.status(400).json({ message: 'Please completely fill in all registration fields.' });
        }
        
        const cleanUsername = username.trim().toLowerCase().replace('@', '');
        const formattedPhone = formatIndianPhoneNumber(phoneNumber);

        if (await User.findOne({ username: cleanUsername }) || await PendingRequest.findOne({ username: cleanUsername, status: 'Pending' })) {
            return res.status(400).json({ message: 'Username is already active or pending approval.' });
        }
        
        const newRequest = await PendingRequest.create({
            fullName: fullName.trim(), 
            username: cleanUsername, 
            password, 
            roomNumber: roomNumber.trim(), 
            bedNumber: parseInt(bedNumber),
            phoneNumber: formattedPhone, 
            address: address.trim(), 
            emergencyContact: emergencyContact.trim(), 
            emergencyRelation: emergencyRelation.trim()
        });
        
        res.status(201).json({ message: 'Access request submitted to Admin successfully!', newRequest });
    } catch (error) { 
        res.status(500).json({ message: 'Request pipeline failed', error: error.message }); 
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const requests = await PendingRequest.find({ status: 'Pending' }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

exports.handleAdminApproval = async (req, res) => {
    try {
        const { requestId, action } = req.body;
        const requestDoc = await PendingRequest.findById(requestId);
        if (!requestDoc || requestDoc.status !== 'Pending') {
            return res.status(404).json({ message: 'Request active profile not found.' });
        }

        if (action === 'Rejected') {
            requestDoc.status = 'Rejected';
            await requestDoc.save();
            return res.json({ message: 'Registration request successfully rejected.' });
        }

        const room = await Room.findOne({ roomNumber: requestDoc.roomNumber.trim() });
        if (!room) return res.status(400).json({ message: `Room ${requestDoc.roomNumber} does not exist.` });
        
        const bed = room.beds.find(b => b.bedNumber === requestDoc.bedNumber);
        if (!bed || bed.status !== 'Available') return res.status(400).json({ message: 'Bed slot is no longer available.' });

        // Check if username was taken while the request sat in the queue
        const userExists = await User.findOne({ username: requestDoc.username });
        if (userExists) {
            return res.status(400).json({ message: 'This username was allocated to another account while pending.' });
        }

        const newUserAccount = await User.create({
            username: requestDoc.username, 
            password: requestDoc.password, 
            role: 'student', 
            phoneNumber: requestDoc.phoneNumber
        });

        await Resident.create({
            userId: newUserAccount._id, 
            fullName: requestDoc.fullName, 
            username: requestDoc.username,
            roomNumber: requestDoc.roomNumber, 
            bedNumber: requestDoc.bedNumber, 
            phoneNumber: requestDoc.phoneNumber,
            address: requestDoc.address || 'Not Provided', 
            emergencyContact: requestDoc.emergencyContact, 
            emergencyRelation: requestDoc.emergencyRelation || 'Not Provided',
            status: 'Active',
            checkInDate: new Date()
        });

        bed.status = 'Occupied';
        bed.occupiedBy = newUserAccount._id;
        await room.save();

        requestDoc.status = 'Approved';
        await requestDoc.save();
        
        res.status(200).json({ message: 'Resident approved and auto-registered cleanly!' });
    } catch (error) { 
        res.status(500).json({ error: error.message }); 
    }
};

exports.getMyProfile = async (req, res) => {
    try {
        const resident = await Resident.findOne({ userId: req.user.id });
        if (!resident) {
            return res.status(404).json({ message: "No resident profile found for this user." });
        }
        res.json(resident);
    } catch (error) {
        res.status(500).json({ message: "Failed to load profile", error: error.message });
    }
};