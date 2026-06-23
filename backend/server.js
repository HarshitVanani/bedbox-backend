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
            // 🎯 FIXED PRODUCTION AUTO-RESET ENGINE
            console.log('🚀 Running production database account check & password sync...');
            
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('adminpassword123', salt);

            // This forces MongoDB to overwrite the entry and sync the password cleanly!
            await User.findOneAndUpdate(
                { username: 'admin' }, 
                { 
                    username: 'admin',
                    password: hashedPassword,
                    role: 'admin',
                    receiveSMSAlerts: true 
                },
                { upsert: true, new: true }
            );

            console.log('✅ Admin credentials successfully synchronized and locked into cloud database!');
        } catch (seedError) {
            console.error('⚠️ Auto-seeding warning:', seedError.message);
        }

        // Accept incoming connections from any interface
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 BedBox Server is running on port: ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failure error:', error.message);
    });