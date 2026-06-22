// backend/smsService.js
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

/**
 * Dispatches an SMS alert to a user's mobile number if they have enabled notifications.
 */
const sendSMSNotification = async (user, messageContent) => {
    // 🛡️ THE MASTER RULE: If the student muted system alerts, kill execution immediately
    const isAlertsEnabled = user.receiveSMSAlerts !== undefined ? user.receiveSMSAlerts : true;
    if (!isAlertsEnabled) {
        console.log(`📡 Broadcast Aborted: ${user.username} has muted real-time system alerts.`);
        return { success: false, status: 'muted_by_user' };
    }

    // Defensive check: Make sure the profile actually has a phone number recorded
    if (!user.phoneNumber) {
        console.log(`📡 Broadcast Skipped: No registered mobile contact data found for ${user.username}.`);
        return { success: false, status: 'missing_phone_number' };
    }

    try {
        if (!accountSid || !authToken || !twilioPhone) {
            console.error('❌ SMS Config Error: Missing API credentials in environment variables.');
            return { success: false, status: 'missing_credentials' };
        }

        const client = twilio(accountSid, authToken);
        
        const message = await client.messages.create({
            body: `[BedBox Alert] ${messageContent}`,
            from: twilioPhone,
            to: user.phoneNumber
        });

        console.log(`✅ SMS Broadcast delivered successfully to ${user.username} (ID: ${message.sid})`);
        return { success: true, messageId: message.sid };
    } catch (error) {
        console.error(`❌ SMS Carrier Pipeline Failure for ${user.username}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = { sendSMSNotification };