const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../server/.env') });

const UploadSession = require('../server/models/UploadSession');

async function checkSessions() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const sessions = await UploadSession.find({ isActive: true });
        console.log(`Found ${sessions.length} active sessions`);
        sessions.forEach(s => {
            console.log(`- ID: ${s._id}, Token prefix: ${s.token.substring(0, 15)}..., Expires: ${s.expiresAt}`);
        });
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

checkSessions();
