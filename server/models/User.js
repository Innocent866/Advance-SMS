const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // Unique generally, or unique per school? Usually unique globally for login.
    passwordHash: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['super_admin', 'school_admin', 'teacher', 'student'], 
        required: true 
    },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassLevel' }, // For students
    // For teachers: Specific assignment to Subject + Class + Arm
    subjects: [{ 
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassLevel' },
        arm: { type: String } // Optional specific arm
    }], 
    createdAt: { type: Date, default: Date.now }
});

// Compound index to ensure email is unique? Or just single index.
// If implementing multi-tenancy where same email can be in different schools, we need compound. 
// For this MVP, let's keep email unique globally to simplify login (email + password).
module.exports = mongoose.model('User', userSchema);
