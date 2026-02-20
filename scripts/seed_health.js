const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('../server/models/User');
const Nurse = require('../server/models/Nurse');
const Doctor = require('../server/models/Doctor');
const School = require('../server/models/School');

dotenv.config({ path: './server/.env' });

const seedHealth = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Wait for connection to be ready
        if (mongoose.connection.readyState !== 1) {
             await new Promise(resolve => mongoose.connection.once('open', resolve));
        }

        // 1. Get a School (First one found)
        const school = await School.findOne();
        if (!school) {
            console.error('No school found. Please register a school first.');
            process.exit(1);
        }
        console.log(`Using School: ${school.name}`);

        // 2. Create Nurse
        const nurseEmail = 'nurse@test.com';
        let nurseUser = await User.findOne({ email: nurseEmail });
        
        if (!nurseUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            
            nurseUser = await User.create({
                name: 'Test Nurse',
                email: nurseEmail,
                passwordHash: hashedPassword,
                role: 'nurse',
                schoolId: school._id
            });
            
            await Nurse.create({
                userId: nurseUser._id,
                schoolId: school._id,
                firstName: 'Test',
                lastName: 'Nurse',
                email: nurseEmail,
                qualification: 'B.Nsc',
                status: 'active'
            });
            console.log('✅ Nurse Created: nurse@test.com / password123');
        } else {
            console.log('ℹ️ Nurse already exists');
        }

        // 3. Create Doctor
        const doctorEmail = 'doctor@test.com';
        let doctorUser = await User.findOne({ email: doctorEmail });
        
        if (!doctorUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('password123', salt);
            
            doctorUser = await User.create({
                name: 'Test Doctor',
                email: doctorEmail,
                passwordHash: hashedPassword,
                role: 'doctor',
                schoolId: school._id
            });
            
            await Doctor.create({
                userId: doctorUser._id,
                schoolId: school._id,
                firstName: 'Test',
                lastName: 'Doctor',
                email: doctorEmail,
                licenseNumber: 'DOC-TEST-001',
                status: 'active'
            });
            console.log('✅ Doctor Created: doctor@test.com / password123');
        } else {
            console.log('ℹ️ Doctor already exists');
        }

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedHealth();
