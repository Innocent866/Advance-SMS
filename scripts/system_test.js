const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');

// Load environment variables from server/.env
const serverEnvPath = path.resolve(__dirname, '../server/.env');
if (fs.existsSync(serverEnvPath)) {
    dotenv.config({ path: serverEnvPath });
} else {
    console.error('Error: server/.env file not found. Please ensure the server is configured.');
    process.exit(1);
}

const API_URL = `http://localhost:${process.env.PORT || 5001}/api`;
console.log(`Testing API at: ${API_URL}`);

// Models (Minimal definition for verification)
const schoolSchema = new mongoose.Schema({
    contactEmail: String,
    isVerified: Boolean
}, { strict: false });
const School = mongoose.model('School', schoolSchema);

const testData = {
    school: {
        schoolName: `Test School ${Date.now()}`,
        schoolEmail: `admin${Date.now()}@testschool.com`,
        password: 'password123',
        address: '123 Test St',
        adminName: 'Admin User',
        adminEmail: `admin${Date.now()}@testschool.com`
    },
    teacher: {
        firstName: 'Test',
        lastName: 'Teacher',
        email: `teacher${Date.now()}@testschool.com`,
        password: 'password123',
        role: 'teacher'
    },
    nurse: {
        firstName: 'Test',
        lastName: 'Nurse',
        email: `nurse${Date.now()}@testschool.com`,
        password: 'password123',
        role: 'nurse'
    },
    doctor: {
        firstName: 'Test',
        lastName: 'Doctor',
        email: `doctor${Date.now()}@testschool.com`,
        password: 'password123',
        role: 'doctor',
        licenseNumber: 'DOC12345'
    },
    student: {
        firstName: 'Test',
        lastName: 'Student',
        email: `student${Date.now()}@testschool.com`,
        password: 'password123',
        role: 'student',
        dob: '2010-01-01',
        gender: 'Male',
        guardianName: 'Test Parent',
        guardianPhone: '1234567890'
    },
    classLevel: {
        name: 'JSS1',
        category: 'JSS'
    }
};

let token = '';
let schoolId = '';
let classId = '';
let studentId = '';

const runTests = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB for verification');

        // 1. Initial Health Check
        console.log('\n--- 1. Health Check ---');
        try {
            const health = await axios.get(`http://localhost:${process.env.PORT || 5001}/`);
            console.log('✅ Server is running:', health.data);
        } catch (error) {
            console.error('❌ Server is NOT running. Please start the server first.');
            process.exit(1);
        }

        // 2. Register School
        console.log('\n--- 2. Register School & Admin ---');
        try {
            const registerRes = await axios.post(`${API_URL}/auth/register-school`, {
                schoolName: testData.school.schoolName,
                schoolEmail: testData.school.schoolEmail,
                adminName: testData.school.adminName,
                adminEmail: testData.school.adminEmail,
                password: testData.school.password, // Corrected field name
                address: testData.school.address
            });
            console.log('✅ School Registered:', registerRes.data.message);
            
            // Manually verify school in DB
            const school = await School.findOne({ contactEmail: testData.school.schoolEmail });
            if (school) {
                school.isVerified = true;
                await school.save();
                schoolId = school._id;
                console.log('✅ School Manually Verified in DB');
            } else {
                throw new Error('School not found in DB after registration');
            }

        } catch (error) {
            console.error('❌ Registration Failed:', error.response?.data || error.message);
        }

        // 3. Login as Admin
        console.log('\n--- 3. Login as Admin ---');
        try {
            const loginRes = await axios.post(`${API_URL}/auth/login`, {
                email: testData.school.adminEmail,
                password: testData.school.password
            });
            token = loginRes.data.token;
            console.log('✅ Admin Logged In. Token received.');
        } catch (error) {
            console.error('❌ Login Failed:', error.response?.data || error.message);
            return; // Cannot proceed without token
        }

        // 3.5 Create Class (Required for Student)
        console.log('\n--- 3.5 Create Class ---');
        try {
            // Check if Academic/Class routes exist and how they are structured.
            // Assuming /api/academic/classes based on common patterns or /api/classes
            // Let's check academic.routes.js content later if this fails, but guessing standard path.
            // Actually, usually it's /api/academic/classes
            const classRes = await axios.post(`${API_URL}/academic/classes`, {
                name: testData.classLevel.name,
                category: testData.classLevel.category
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Class Created:', classRes.data.name);
            classId = classRes.data._id;
        } catch (error) {
            console.error('❌ Create Class Failed:', error.response?.data || error.message);
            // Fallback: try to find existing class
            try {
                const classes = await axios.get(`${API_URL}/academic/classes`, { headers: { Authorization: `Bearer ${token}` } });
                if (classes.data.length > 0) {
                    classId = classes.data[0]._id;
                    console.log('ℹ️ Using existing class:', classes.data[0].name);
                }
            } catch (err) { console.error('Could not fetch classes'); }
        }

        // 4. Create Teacher (Check Resource Limit)
        console.log('\n--- 4. Create Teacher (Resource Limit Check) ---');
        try {
            const teacherRes = await axios.post(`${API_URL}/teachers`, {
                firstName: testData.teacher.firstName,
                lastName: testData.teacher.lastName,
                email: testData.teacher.email,
                password: testData.teacher.password,
                qualification: 'B.Ed',
                phoneNumber: '1234567890',
                gender: 'Male'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Teacher Created:', teacherRes.data.email);
        } catch (error) {
             console.error('❌ Create Teacher Failed:', error.response?.data || error.message);
        }

        // 5. Create Student
        console.log('\n--- 5. Create Student ---');
        try {
            const studentRes = await axios.post(`${API_URL}/students`, {
                firstName: testData.student.firstName,
                lastName: testData.student.lastName,
                email: testData.student.email,
                password: testData.student.password,
                // dateOfBirth vs dob
                dob: testData.student.dob, 
                gender: testData.student.gender,
                guardianName: testData.student.guardianName,
                guardianPhone: testData.student.guardianPhone,
                classId: classId,
                level: 'JSS' // example
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Student Created:', studentRes.data.firstName);
            studentId = studentRes.data._id;
        } catch (error) {
            console.error('❌ Create Student Failed:', error.response?.data || error.message);
        }

        // 6. Create Nurse
        console.log('\n--- 6. Create Nurse ---');
        try {
            const nurseRes = await axios.post(`${API_URL}/nurses`, {
                firstName: testData.nurse.firstName,
                lastName: testData.nurse.lastName,
                email: testData.nurse.email,
                password: testData.nurse.password,
                phoneNumber: '1234567890',
                gender: 'Female',
                qualification: 'B.Nsc'
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('✅ Nurse Created:', nurseRes.data.email);
        } catch (error) {
            console.error('❌ Create Nurse Failed:', error.response?.data || error.message);
        }

        // 7. Login as Nurse & Create Medical Record
        console.log('\n--- 7. Nurse Flow (Login & Record) ---');
        try {
            // Login
            const nurseLogin = await axios.post(`${API_URL}/auth/login`, {
                email: testData.nurse.email,
                password: testData.nurse.password
            });
            const nurseToken = nurseLogin.data.token;
            console.log('✅ Nurse Logged In');

            // Create Record
            if (studentId) {
                const recordRes = await axios.post(`${API_URL}/medical`, {
                    studentId: studentId,
                    recordType: 'Routine Checkup',
                    symptoms: 'Headache',
                    temperature: '38.5',
                    status: 'Under Observation'
                }, {
                    headers: { Authorization: `Bearer ${nurseToken}` }
                });
                console.log('✅ Medical Record Created:', recordRes.data._id);
            } else {
                console.log('⚠️ Skipping Medical Record (No Student ID)');
            }

        } catch (error) {
            console.error('❌ Nurse Flow Failed:', error.response?.data || error.message);
        }

         // 6. Test Security - Token without School
         // ... (Can add more negative tests)

    } catch (error) {
        console.error('Unexpected Error:', error);
    } finally {
        await mongoose.disconnect();
    }
};

runTests();
