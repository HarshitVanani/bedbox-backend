// backend/seedRooms.js
const mongoose = require('mongoose');
const Room = require('./models/Room');
const dotenv = require('dotenv');
const dns = require('dns');

// 🎯 FORCE NODE TO BYPASS YOUR LOCAL ISP'S DNS BLOCKS ONLY FOR THIS SCRIPT
dns.setServers(['8.8.8.8', '8.8.4.4']);

dotenv.config();

// Pulls your real working cluster link directly from your .env file
const MONGO_URI = process.env.MONGO_URI;

const seedRooms = async () => {
    try {
        console.log('🔄 Connecting to your fresh cluster to seed rooms...');
        await mongoose.connect(MONGO_URI);
        
        // Clear out any half-created room collections if any exist
        await Room.deleteMany({});

        const structuralRooms = [
            {
                roomNumber: "101",
                roomType: "Non-AC",
                capacity: 4,
                beds: [
                    { bedNumber: 1, status: "Available", occupiedBy: null },
                    { bedNumber: 2, status: "Available", occupiedBy: null },
                    { bedNumber: 3, status: "Available", occupiedBy: null },
                    { bedNumber: 4, status: "Available", occupiedBy: null }
                ]
            },
            {
                roomNumber: "102",
                roomType: "AC",
                capacity: 4,
                beds: [
                    { bedNumber: 1, status: "Available", occupiedBy: null },
                    { bedNumber: 2, status: "Available", occupiedBy: null },
                    { bedNumber: 3, status: "Available", occupiedBy: null },
                    { bedNumber: 4, status: "Available", occupiedBy: null }
                ]
            },
            {
                roomNumber: "103",
                roomType: "AC",
                capacity: 4,
                beds: [
                    { bedNumber: 1, status: "Available", occupiedBy: null },
                    { bedNumber: 2, status: "Available", occupiedBy: null },
                    { bedNumber: 3, status: "Available", occupiedBy: null },
                    { bedNumber: 4, status: "Available", occupiedBy: null }
                ]
            },
            {
                roomNumber: "201",
                roomType: "Non-AC",
                capacity: 2,
                beds: [
                    { bedNumber: 1, status: "Available", occupiedBy: null },
                    { bedNumber: 2, status: "Available", occupiedBy: null }
                ]
            }
        ];

        await Room.insertMany(structuralRooms);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 HOSTEL VISUAL ROOM GRID SEEDED SUCCESSFULLY WITH SAMPLE BEDS!');
        console.log('✅ Rooms 101, 102, 103, and 201 are fully live and empty.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        process.exit(0);
    } catch (error) {
        console.error('❌ Room seeding failed:', error.message);
        process.exit(1);
    }
};

seedRooms();