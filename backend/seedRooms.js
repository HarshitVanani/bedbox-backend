// backend/seedRooms.js
const mongoose = require('mongoose');
const Room = require('./models/Room');
const dotenv = require('dotenv');

dotenv.config();
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bedbox_hostel';

const sampleRooms = [
    {
        roomNumber: "101",
        floorNumber: 1,
        roomType: "AC Sharing",
        beds: [
            { bedNumber: 1, status: "Available" },
            { bedNumber: 2, status: "Available" },
            { bedNumber: 3, status: "Maintenance" },
            { bedNumber: 4, status: "Available" }
        ]
    },
    {
        roomNumber: "102",
        floorNumber: 1,
        roomType: "Non-AC Sharing",
        beds: [
            { bedNumber: 1, status: "Available" },
            { bedNumber: 2, status: "Available" },
            { bedNumber: 3, status: "Available" },
            { bedNumber: 4, status: "Available" }
        ]
    },
    {
        roomNumber: "201",
        floorNumber: 2,
        roomType: "AC Sharing",
        beds: [
            { bedNumber: 1, status: "Available" },
            { bedNumber: 2, status: "Available" },
            { bedNumber: 3, status: "Available" },
            { bedNumber: 4, status: "Available" }
        ]
    }
];

const seedRoomsDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        // Clear any old room configurations to prevent crashes
        await Room.deleteMany();
        
        // Insert our sample room map rows
        await Room.insertMany(sampleRooms);
        console.log('🎉 HOSTEL VISUAL ROOM GRID SEEDED SUCCESSFULLY WITH SAMPLE BEDS!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Room seeding failed:', error.message);
        process.exit(1);
    }
};

seedRoomsDB();