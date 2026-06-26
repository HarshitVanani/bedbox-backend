// backend/cleanDatabase.js
const mongoose = require('mongoose');
const User = require('./models/User');
const Resident = require('./models/Resident');
const PendingRequest = require('./models/PendingRequest');
const Invoice = require('./models/Invoice');
const Complaint = require('./models/Complaint');
const Room = require('./models/Room');

// Locate this line around line 10 and swap it to your new link:
const MONGO_URI = 'mongodb+srv://admin:G5O6wD6zuQ1JJYUg@clusterfresh.c1u7y48.mongodb.net/bedbox_hostel?retryWrites=true&w=majority&appName=ClusterFresh';

const cleanAndPreserveKrish = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('⚡ Connected to MongoDB Atlas Cloud for target database cleanup...');

        // 1. Locate the Krish user document to get his exact _id
        const krishUser = await User.findOne({ username: 'krish' });
        if (!krishUser) {
            console.log('⚠️ User "krish" not found in database. Core reset aborted to protect data.');
            process.exit(1);
        }
        const krishId = krishUser._id;
        console.log(`🎯 Found Krish User Account ID: ${krishId}`);

        // 2. Clear all other student users, keeping 'admin' and 'krish'
        const userResult = await User.deleteMany({
            _id: { $ne: krishId },
            role: { $ne: 'admin' }
        });
        console.log(`🧹 Purged ${userResult.deletedCount} corrupted student accounts.`);

        // 3. Clear all Resident profiles except Krish
        const residentResult = await Resident.deleteMany({ userId: { $ne: krishId } });
        console.log(`🧹 Purged ${residentResult.deletedCount} old resident roster rows.`);

        // 4. Wipe out old ledger history and pending requests that are breaking the UI data grids
        await PendingRequest.deleteMany({});
        await Invoice.deleteMany({});
        await Complaint.deleteMany({});
        console.log('🧹 Flushed all Pending Requests, Invoices, and Complaints logs clean.');

        // 5. Reset all room beds to 'Available' except for Krish's bed assignment (Room 103, Bed 3)
        await Room.updateMany({}, {
            $set: { "beds.$[].status": "Available", "beds.$[].occupiedBy": null }
        });

        // Re-assign Krish back to his structural grid slot: Room 103, Bed Number 3
        await Room.findOneAndUpdate(
            { roomNumber: "103", "beds.bedNumber": 3 },
            { 
                $set: { 
                    "beds.$.status": "Occupied", 
                    "beds.$.occupiedBy": krishId 
                } 
            }
        );
        console.log('🏢 Restored and locked Bed Box grid slots. Room 103 - Bed 3 is allocated to Krish.');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 DATABASE CLEANED UP SUCCESSFULLY!');
        console.log('✅ Preserved: Master Admin Account');
        console.log('✅ Preserved: User "krish" & Resident profile assignments.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error executing database scrubbing script:', error.message);
        process.exit(1);
    }
};

cleanAndPreserveKrish();