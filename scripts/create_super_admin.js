const mongoose = require('../server/node_modules/mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
const serverEnvPath = path.resolve(__dirname, '../server/.env');
if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
} else {
    console.error('Error: server/.env file not found.');
    process.exit(1);
}

// Ensure we use the server's models
const User = require('../server/models/User');
const School = require('../server/models/School');

const createSuperAdmin = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000
        });
        console.log('✅ Connected to MongoDB');

        const email = 'igoldima@gmail.com'.toLowerCase();
        const name = 'GT-SchoolHub Super Admin';
        const password = 'SA' + Math.random().toString(36).substring(7).toUpperCase() + '!';

        // 1. Find or Create System School
        console.log('Searching for System School...');
        let systemSchool = await School.findOne({ name: { $regex: /System/i } }).exec();
        
        if (!systemSchool) {
            console.log('System School not found, creating one...');
            systemSchool = new School({
                name: 'GT-SchoolHub System',
                contactEmail: 'system@gt-schoolhub.com.ng',
                isVerified: true,
                subscription: {
                    plan: 'Premium',
                    status: 'active'
                }
            });
            await systemSchool.save();
            console.log('✅ System School created:', systemSchool._id);
        } else {
            console.log('✅ Found System School:', systemSchool.name, '(', systemSchool._id, ')');
        }

        // 2. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Create or update user
        let user = await User.findOne({ email }).exec();
        if (user) {
            console.log(`User ${email} already exists. Updating credentials and school association...`);
            user.role = 'super_admin';
            user.schoolId = systemSchool._id;
            user.passwordHash = passwordHash;
            user.isEmailVerified = true;
            await user.save();
            console.log('✅ User updated successfully');
        } else {
            console.log(`Creating new user ${email}...`);
            user = new User({
                schoolId: systemSchool._id,
                name: name,
                email: email,
                passwordHash: passwordHash,
                role: 'super_admin',
                isEmailVerified: true
            });
            await user.save();
            console.log('✅ User created successfully');
        }

        console.log('\n==========================================');
        console.log('SUCCESS: Super Admin Account Configured');
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log(`School ID: ${systemSchool._id}`);
        console.log('==========================================\n');
        console.log('PLEASE SAVE THESE CREDENTIALS SECURELY.');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createSuperAdmin();
