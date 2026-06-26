// backend/seedAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

// 🎯 FIXED: Hardcoded your exact cloud connection string to target MongoDB Atlas directly
// Locate this line around line 10 and swap it to your new link:
const MONGO_URI = 'mongodb+srv://admin:G5O6wD6zuQ1JJYUg@clusterfresh.c1u7y48.mongodb.net/bedbox_hostel?retryWrites=true&w=majority&appName=ClusterFresh';
const seedInitialAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('⚡ Connected to MongoDB Atlas Cloud for account provisioning...');

        // Define your desired Admin login credentials here
        const adminUsername = 'admin'; 
        const adminPassword = 'adminpassword123'; // This will be your password on the app login screen

        // Check if an admin user already exists to avoid duplication
        const existingAdmin = await User.findOne({ username: adminUsername });
        if (existingAdmin) {
            console.log(`⚠️ An admin user with username "${adminUsername}" already exists inside your database.`);
            console.log('💡 TIP: If you need to update the password, delete the old user inside Atlas Collections first, then run this script again.');
            process.exit(0);
        }

        // Encrypt the password securely exactly like our registration route does
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        // Save the Admin profile into MongoDB
        await User.create({
            username: adminUsername,
            password: hashedPassword,
            role: 'admin'
        });

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 INITIAL MASTER ADMIN ACCOUNT PROVISIONED SUCCESSFULLY!');
        console.log(`👤 Username: ${adminUsername}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error executing database seeding script:', error.message);
        process.exit(1);
    }
};

seedInitialAdmin();