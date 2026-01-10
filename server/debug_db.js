const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Payment = require('./models/Payment');
const School = require('./models/School');

dotenv.config();

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management_db'); // Fallback literal if env missing
        console.log('Connected to DB');

        const payments = await Payment.find().sort({ createdAt: -1 }).limit(5);
        console.log(`Found ${payments.length} recent payments.`);

        for (const p of payments) {
            console.log('------------------------------------------------');
            console.log(`Payment Ref: ${p.reference}`);
            console.log(`Payment Status: ${p.status}`);
            console.log(`Payment SchoolId: ${p.schoolId}`);

            const school = await School.findById(p.schoolId);
            if (school) {
                console.log(`✅ School Found: ${school.name} (ID: ${school._id})`);
                console.log(`   Subscription Status: ${school.subscription?.status}`);
            } else {
                console.log(`❌ SCHOOL NOT FOUND for ID: ${p.schoolId}`);
            }
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Debug Error:', error);
    }
};

debug();
