const Complaint = require('../models/Complaint');
const User = require('../models/User'); 
const { sendSMSNotification } = require('../smsService'); // ◄ Import our centralized SMS dispatcher

// 1. File a brand new complaint ticket (Student Access)
exports.fileComplaint = async (req, res) => {
    try {
        const { title, description, roomNumber } = req.body;
        
        // req.user is populated by our protect middleware gatekeeper
        const newComplaint = await Complaint.create({
            studentId: req.user.id,
            studentName: req.user.username,
            roomNumber,
            title,
            description
        });

        res.status(201).json({ message: 'Complaint filed successfully inside system registries.', newComplaint });
    } catch (error) {
        res.status(500).json({ message: 'Failed to process complaint file', error: error.message });
    }
};

// 2. Retrieve complaints list (Polymorphic: Students see their own logs, Admins see everything!)
exports.getComplaints = async (req, res) => {
    try {
        let complaints;
        
        if (req.user.role === 'admin') {
            // Admin reads every ticket registered inside the database sorted by oldest pending first
            complaints = await Complaint.find().sort({ createdAt: -1 });
        } else {
            // Students can strictly only view records linked directly to their personal account ID
            complaints = await Complaint.find({ studentId: req.user.id }).sort({ createdAt: -1 });
        }
        
        res.json(complaints);
    } catch (error) {
        res.status(500).json({ message: 'Failed to pull complaint listings', error: error.message });
    }
};

// 3. Update status ticket tracking (Admin Access Only)
exports.resolveComplaint = async (req, res) => {
    try {
        const { complaintId, nextStatus } = req.body;

        const complaint = await Complaint.findById(complaintId);
        if (!complaint) return res.status(404).json({ message: 'Target ticket reference not found' });

        complaint.status = nextStatus; // Set to 'In Progress' or 'Resolved'
        await complaint.save();

        // 🎯 TARGETED COMPLAINT STATUS UPDATER HOOK
        // Fetch the individual student who logged this specific ticket
        const ticketOwner = await User.findById(complaint.studentId);
        
        if (ticketOwner) {
            const smsPayload = `Your complaint ticket regarding "${complaint.title}" has been updated to: [${nextStatus}]. Check your BedBox dashboard panel for progress logs.`;
            // This natively honors their 'Mute Real-time System Alerts' preference state!
            await sendSMSNotification(ticketOwner, smsPayload);
        }

        res.json({ message: `Ticket reference status updated to: ${nextStatus}`, complaint });
    } catch (error) {
        res.status(500).json({ message: 'Failed to alter complaint tracking tag', error: error.message });
    }
};