const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ErrorLog = require('./models/ErrorLog');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_hub')
    .then(async () => {
        console.log('Connected to MongoDB');
        const logs = await ErrorLog.find().sort({ createdAt: -1 }).limit(5);
        console.log('Latest Error Logs:');
        console.log(JSON.stringify(logs, null, 2));
        process.exit(0);
    })
    .catch(err => {
        console.error('Connection error:', err);
        process.exit(1);
    });
