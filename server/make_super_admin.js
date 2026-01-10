const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.log('Usage: node make_super_admin.js <email>');
    process.exit(1);
}

const promote = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management_db');
        console.log('Connected to DB');

        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.role = 'super_admin';
        await user.save();

        console.log(`User ${user.name} (${user.email}) is now a SUPER ADMIN.`);
        mongoose.connection.close();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

promote();
