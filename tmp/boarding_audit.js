const mongoose = require('../server/node_modules/mongoose');

const API_URL = 'http://127.0.0.1:5001/api';
const MONGO_URI = 'mongodb+srv://Advance-SMS:Advance-SMS@cluster0.ric8sql.mongodb.net/school_db?retryWrites=true&w=majority';
const adminCredentials = { email: "audit@test.com", password: "password123" };

const runBoardingAudit = async () => {
    try {
        console.log('--- Phase 1: setup & Feature Activation ---');
        await mongoose.connect(MONGO_URI);
        const School = mongoose.connection.db.collection('schools');
        const Student = mongoose.connection.db.collection('students');

        // Enable boarding feature
        await School.updateOne(
            { contactEmail: "audit@test.com" },
            { $set: { "features.boarding": true, "features.medicalRecords": true } }
        );
        console.log('✅ Boarding features enabled in DB');

        // Admin Login
        const adminLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminCredentials)
        });
        const adminData = await adminLogin.json();
        const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminData.token}` };
        console.log('✅ Admin Logged In');

        console.log('\n--- Phase 2: Hostel & Room Infrastructure ---');
        // Create Hostel
        const hostelRes = await fetch(`${API_URL}/hostels`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: "Audit Hostel A",
                type: "Boys",
                location: "West Wing"
            })
        });
        const hostelData = await hostelRes.json();
        const hostelId = hostelData.data._id;
        console.log('✅ Hostel created:', hostelData.data.name);

        // Create Room
        const roomRes = await fetch(`${API_URL}/hostels/rooms`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                hostelId,
                roomNumber: "101",
                capacity: 4
            })
        });
        const roomData = await roomRes.json();
        const roomId = roomData.data._id;
        console.log('✅ Room created:', roomData.data.roomNumber);

        console.log('\n--- Phase 3: Student Allocation ---');
        // Fetch the student
        const student = await Student.findOne({ email: "student_audit@test.com" });
        if (!student) throw new Error("Student not found. Run api_audit.js first.");

        const allocateRes = await fetch(`${API_URL}/boarding/allocate`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                studentId: student._id,
                hostelId,
                roomId,
                bedNumber: "Bed 1"
            })
        });
        const allocateData = await allocateRes.json();
        if (allocateRes.ok) {
            console.log('✅ Student allocated to bed. Boarder Status:', allocateData.data.isBoarder);
        } else {
            console.error('❌ Allocation failed:', allocateData.message);
        }

        // Verify occupancy in room
        const Room = mongoose.connection.db.collection('rooms');
        const updatedRoom = await Room.findOne({ _id: roomId });
        console.log('✅ Current Room Occupancy:', updatedRoom.occupancy);

        console.log('\n✅ BOARDING AUDIT COMPLETE.');

    } catch (err) {
        console.error('Audit Error:', err.message);
    } finally {
        await mongoose.disconnect();
    }
};

runBoardingAudit();
