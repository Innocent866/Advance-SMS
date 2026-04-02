const mongoose = require('mongoose');
const LearningMaterial = require('./server/models/LearningMaterial');
const Teacher = require('./server/models/Teacher');
require('dotenv').config({ path: './server/.env' });

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const materials = await LearningMaterial.find().sort({ createdAt: -1 }).limit(5);
    console.log("LAST 5 MATERIALS:");
    materials.forEach(m => {
        console.log(`- Title: ${m.title}, Status: ${m.status}, hodId: ${m.hodId}, teacherId: ${m.teacherId}, createdAt: ${m.createdAt}`);
    });

    const teachers = await Teacher.find().limit(5).populate('departmentId');
    console.log("\nTEACHERS:");
    teachers.forEach(t => {
        console.log(`- Name: ${t.firstName} ${t.lastName}, departmentId: ${t.departmentId ? t.departmentId._id : 'NULL'}, hodId: ${t.departmentId ? t.departmentId.hodId : 'NULL'}`);
    });
    
    process.exit(0);
}
check();
