const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Direct User/School models to avoid dependency issues during reset
const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String, required: true },
    contactEmail: { type: String, required: true, unique: true },
    subscription: {
        plan: { type: String, enum: ['Free', 'Basic', 'Standard', 'Premium'], default: 'Free' },
        status: { type: String, enum: ['active', 'expired', 'trialing'], default: 'trialing' },
        expiryDate: Date
    },
    isVerified: { type: Boolean, default: false },
    isProfileSetup: { type: Boolean, default: false }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        required: true,
        enum: ['super_admin', 'school_admin', 'teacher', 'student', 'parent', 'hostel_warden', 'house_parent']
    },
    isEmailVerified: { type: Boolean, default: false }
}, { timestamps: true });

const School = mongoose.models.School || mongoose.model('School', SchoolSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const hardReset = async () => {
    try {
        console.log('Connecting to database...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB:', mongoose.connection.name);

        const collections = await mongoose.connection.db.collections();
        console.log(`Found ${collections.length} collections. Clearing all data...`);

        for (const collection of collections) {
            console.log(`Clearing collection: ${collection.collectionName}`);
            await collection.deleteMany({});
        }

        console.log('All collections cleared. Seeding System School and SuperAdmin...');

        // 1. Create System School
        const systemSchool = await School.create({
            name: 'Advance SMS System',
            address: 'Platform Headquarters',
            contactEmail: 'system@advancesms.com',
            subscription: { 
                plan: 'Premium', 
                status: 'active', 
                expiryDate: new Date(2099, 11, 31) 
            },
            isVerified: true,
            isProfileSetup: true
        });

        // 2. Create SuperAdmin
        const email = 'igoldima@gmail.com';
        const password = 'SuperAdmin@2026'; // New secure default password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const superAdmin = await User.create({
            schoolId: systemSchool._id,
            name: 'GT-SuperAdmin',
            email,
            passwordHash,
            role: 'super_admin',
            isEmailVerified: true
        });

        console.log('-----------------------------------');
        console.log('✅ DATABASE RESET COMPLETE');
        console.log('-----------------------------------');
        console.log(`System School ID: ${systemSchool._id}`);
        console.log(`SuperAdmin Email: ${email}`);
        console.log(`SuperAdmin Password: ${password}`);
        console.log('-----------------------------------');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('CRITICAL ERROR DURING RESET:', error);
        process.exit(1);
    }
};

hardReset();
