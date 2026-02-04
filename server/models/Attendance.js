const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassLevel',
        required: true,
        index: true
    },
    arm: {
        type: String, // e.g. "Gold", "A"
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    session: {
        type: String, // e.g., "2025/2026"
        required: true
    },
    term: {
        type: String, // "First Term"
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Teacher
        required: true
    },
    records: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        status: {
            type: String,
            enum: ['Present', 'Absent', 'Late'],
            default: 'Present'
        },
        remark: {
            type: String
        }
    }]
}, {
    timestamps: true
});

// Ensure one attendance record per class per day
// Ensure one attendance record per class + arm per day
attendanceSchema.index({ classId: 1, arm: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
