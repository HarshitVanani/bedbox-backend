// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Routes imports
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messRoutes = require('./routes/messRoutes');
const residentRoutes = require('./routes/residentRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes'); // IMPORT INVOICE ROUTE
const maintenanceNoticeRoutes = require('./routes/maintenanceNoticeRoutes'); // 🎯 NEW: Maintenance Routes

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
app.use('/api/invoices', invoiceRoutes); // PLUG IN INVOICE API PATHWAY
app.use('/api/maintenance-notices', maintenanceNoticeRoutes); // 🎯 NEW: Maintenance API Entry

app.get('/', (req, res) => {
    res.send('BedBox Hostel Management System API is running smoothly...');
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bedbox_hostel';

// backend/server.js
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('⚡ Successfully connected to MongoDB Database.');
        
        // 🎯 FIXED: Added '0.0.0.0' to accept network connections from your phone!
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 BedBox Server is running on http://192.168.1.17:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Database connection failure error:', error.message);
    });