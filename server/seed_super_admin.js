const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const School = require('./models/School');

dotenv.config();

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/school_management_db');
        console.log('Connected to DB');

        // 1. Ensure System School exists (for Super Admins)
        let systemSchool = await School.findOne({ contactEmail: 'system@advancesms.com' });
        if (!systemSchool) {
            console.log('Creating System Admin School...');
            systemSchool = await School.create({
                name: 'Advance SMS System',
                address: 'HQ',
                contactEmail: 'system@advancesms.com',
                subscription: { plan: 'Premium', status: 'active', expiryDate: new Date(2099, 11, 31) }
            });
        }

        const email = 'superAdmin@gmail.com';
        const password = 'password123'; // Default password

        // 2. Check if user exists
        let user = await User.findOne({ email });
        
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        if (user) {
            console.log('Updating existing user to Super Admin...');
            user.role = 'super_admin';
            user.passwordHash = passwordHash; // Reset password to known value
            user.schoolId = systemSchool._id;
            await user.save();
        } else {
            console.log('Creating new Super Admin user...');
            user = await User.create({
                schoolId: systemSchool._id,
                name: 'Super Admin',
                email,
                passwordHash,
                role: 'super_admin'
            });
        }

        console.log('-----------------------------------');
        console.log('✅ SUPER ADMIN CREATED/UPDATED');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log('-----------------------------------');

        mongoose.connection.close();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

createSuperAdmin();
