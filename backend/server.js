// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); 
const User = require('./models/User'); 

// Routes imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messRoutes = require('./routes/messRoutes');
const residentRoutes = require('./routes/residentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); 
const maintenanceNoticeRoutes = require('./routes/maintenanceNoticeRoutes'); 

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// API Middleware Routing Links
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/residents', residentRoutes);
app.use('/api/invoices', invoiceRoutes); 
app.use('/api/maintenance-notices', maintenanceNoticeRoutes); 

app.get('/', (req, res) => {
    res.send('BedBox Hostel Management System API is running smoothly...');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bedbox_hostel';

mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('⚡ Successfully connected to MongoDB Database.');
        
        try {
            console.log('🚀 Running production database account check & password sync...');
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);

            // 🎯 FORCED RESIDENT PASSWORD SYNC
            await User.findOneAndUpdate(
                { username: 'harshit3' }, 
                { 
                    password: hashedPassword, // Forces a clean, correctly-hashed password
                    role: 'student'
                },
                { upsert: false } // Only updates if the user already exists
            );

            // Existing admin sync code...
            const adminPassword = await bcrypt.hash('adminpassword123', salt);
            await User.findOneAndUpdate(
                { username: 'admin' }, 
                { 
                    username: 'admin',
                    password: adminPassword,
                    role: 'admin',
                    receiveSMSAlerts: true 
                },
                { upsert: true, new: true }
            );

            console.log('✅ Account credentials successfully synchronized into cloud database!');
        } catch (seedError) {
            console.error('⚠️ Auto-seeding warning:', seedError.message);
        }

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 BedBox Server is running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failure error:', error.message);
    });