const mongoose = require('../server/node_modules/mongoose');
const bcrypt = require('../server/node_modules/bcryptjs');

const MONGO_URI = 'mongodb+srv://Advance-SMS:Advance-SMS@cluster0.ric8sql.mongodb.net/school_db?retryWrites=true&w=majority';

const setupDirectly = async () => {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(MONGO_URI);
        const School = mongoose.connection.db.collection('schools');
        const User = mongoose.connection.db.collection('users');

        const schoolName = "Audit Test School";
        const email = "audit@test.com";
        const password = "password123";

        // Check if school already exists
        const existingSchool = await School.findOne({ contactEmail: email });
        let sId;
        if (existingSchool) {
            console.log('School already exists, updating...');
            sId = existingSchool._id;
            await School.updateOne({ _id: sId }, { $set: { isVerified: true } });
        } else {
            console.log('Creating school...');
            const schoolResult = await School.insertOne({
                name: schoolName,
                contactEmail: email,
                isVerified: true,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            sId = schoolResult.insertedId;
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists, updating password and schoolId...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            await User.updateOne({ _id: existingUser._id }, { $set: { schoolId: sId, passwordHash, role: 'school_admin' } });
        } else {
            console.log('Creating user...');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            await User.insertOne({
                schoolId: sId,
                name: "Audit Admin",
                email: email,
                passwordHash: passwordHash,
                role: 'school_admin',
                createdAt: new Date(),
                updatedAt: new Date()
            });
        }

        console.log('✅ Setup complete. Login with audit@test.com / password123');
    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

setupDirectly();
