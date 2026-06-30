// backend/server.js
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const User = require('./models/User'); 

// Routes imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messRoutes = require('./routes/messRoutes');
const residentRoutes = require('./routes/residentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); 
const maintenanceNoticeRoutes = require('./routes/maintenanceNoticeRoutes'); 
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
            console.log('🚀 Running production database account check & validation sync...');

            // 🎯 FIXED: Seeding accounts with raw strings so UserSchema pre-save encryption hook handles hashing safely
            const adminUser = await User.findOne({ username: 'admin' });
            if (!adminUser) {
                await User.create({
                    username: 'admin',
                    password: 'adminpassword123',
                    role: 'admin',
                    receiveSMSAlerts: true
                });
                console.log('👑 Root admin account successfully seeded.');
            }

            const residentUser = await User.findOne({ username: 'harshit3' });
            if (!residentUser) {
                await User.create({
                    username: 'harshit3',
                    password: 'password123',
                    role: 'student',
                    phoneNumber: '+919999999999'
                });
                console.log('👤 Fallback testing resident seeded cleanly.');
            }

            // Seed Mess Menu Days
            const MessMenu = require('./models/MessMenu');
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
            for (const day of days) {
                const dayExists = await MessMenu.findOne({ day });
                if (!dayExists) {
                    await MessMenu.create({
                        day,
                        breakfast: 'Not Configured',
                        lunch: 'Not Configured',
                        dinner: 'Not Configured'
                    });
                }
            }
            console.log('📅 Mess Menu days successfully synchronized.');

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