const fs = require('fs');
const path = require('path');
const User = require('../models/User'); // ◄ 1. Import User Model to fetch student database records
const { sendSMSNotification } = require('../smsService'); // ◄ 2. Import Centralized SMS dispatch system

// Auto-Detecting Engine: Automatically searches backend/models/ for your mess/menu file
let Mess;
const modelsDir = path.join(__dirname, '../models');
const files = fs.readdirSync(modelsDir);

// Find any file that contains 'mess' or 'menu' or 'diet' (case-insensitive)
const modelFile = files.find(f => {
    const name = f.toLowerCase();
    return name.includes('mess') || name.includes('menu') || name.includes('diet');
});

if (modelFile) {
    // Dynamically require the file that matches your folder storage layout name
    Mess = require(path.join(modelsDir, modelFile));
    console.log(`⚡ BedBox Auto-Loader: Successfully linked to model file: "${modelFile}"`);
} else {
    // Fallback emergency configuration mapping sheet if no naming conventions match
    console.log("⚠️ BedBox Warning: No explicit mess/menu model file found. Using generic schema fallback mapping handles.");
    const mongoose = require('mongoose');
    Mess = mongoose.models.Mess || mongoose.models.Menu || mongoose.model('Mess', new mongoose.Schema({}, { strict: false }));
}

// =========================================================
// 1. FETCH ALL ACTIVE WEEKLY MEAL DOCUMENTS
// =========================================================
const getMenu = async (req, res) => {
    try {
        const menu = await Mess.find({});
        res.status(200).json(menu || []);
    } catch (error) {
        res.status(500).json({ message: "Error syncing mess menu registry collections.", error: error.message });
    }
};

// =========================================================
// 2. MODIFY/UPDATE A SPECIFIC MEAL SLOT WITHIN A DAY
// =========================================================
const updateMeal = async (req, res) => {
    try {
        const { day, mealType, updatedDishes } = req.body;
        
        const updatedMenu = await Mess.findOneAndUpdate(
            { day: day },
            { $set: { [mealType.toLowerCase()]: updatedDishes } },
            { new: true }
        );

        if (!updatedMenu) {
            return res.status(404).json({ message: "Target calendar day row not found." });
        }

        // 🎯 REAL-TIME MESS NOTIFICATION DISPATCH ENGINE
        try {
            // Fetch all active students in the hostel system
            const activeStudents = await User.find({ role: 'student' });
            
            // Loop through each student asynchronously to filter mute preferences and send SMS
            activeStudents.forEach(async (student) => {
                try {
                    const smsPayload = `The Mess Menu for ${day} (${mealType}) has been updated. New Menu: ${updatedDishes}. Check your dashboard to view the full tracking layout.`;
                    await sendSMSNotification(student, smsPayload);
                } catch (smsErr) {
                    console.error(`❌ Async SMS dispatch error for ${student?.username || 'unknown'}:`, smsErr.message);
                }
            });
        } catch (smsOuterErr) {
            console.error("❌ SMS Dispatch pipeline outer failure:", smsOuterErr.message);
        }

        res.status(200).json({ message: "Dish updated successfully", updatedMenu });
    } catch (error) {
        res.status(500).json({ message: "Server error during dish modification runtime.", error: error.message });
    }
};

// =========================================================
// 3. BOOTSTRAP BLANK DAY SCRIPT TEMPLATE
// =========================================================
const initDayTemplate = async (req, res) => {
    try {
        const { day, breakfast, lunch, dinner } = req.body;
        
        const dayExists = await Mess.findOne({ day });
        if (dayExists) {
            return res.status(400).json({ message: "Day rows already compiled." });
        }

        const newDayRow = await Mess.create({
            day,
            breakfast: breakfast || 'Not Configured',
            lunch: lunch || 'Not Configured',
            dinner: dinner || 'Not Configured'
        });

        res.status(201).json(newDayRow);
    } catch (error) {
        res.status(500).json({ message: "Error generating initial calendar documents.", error: error.message });
    }
};

module.exports = {
    getMenu,
    updateMeal,
    initDayTemplate
};