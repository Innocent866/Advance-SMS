const mongoose = require('mongoose');
const dotenv = require('dotenv');
const ErrorLog = require('./models/ErrorLog');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_hub')
    .then(async () => {
        const log = await ErrorLog.findOne().sort({ createdAt: -1 });
        if (log) {
            console.log('--- MESSAGE ---');
            console.log(log.message);
            console.log('--- STACK ---');
            console.log(log.stack);
            console.log('--- DETAILS ---');
            console.log(`Path: ${log.path}, Method: ${log.method}, StatusCode: ${log.statusCode}, Date: ${log.createdAt}`);
            console.log('--- BODY ---');
            console.log(JSON.stringify(log.body, null, 2));
        } else {
            console.log('No error logs found');
        }
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
