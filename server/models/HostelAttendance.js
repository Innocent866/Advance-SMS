const mongoose = require('mongoose');

const hostelAttendanceSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true
    },
    type: {
        type: String,
        enum: ['Night Roll Call', 'Morning Check', 'Weekend'],
        required: true
    },
    markedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
            enum: ['Present', 'Absent', 'Late', 'On Leave'],
            default: 'Present'
        },
        remark: {
            type: String
        }
    }]
}, {
    timestamps: true
});

// Ensure one attendance record per hostel per type per day
hostelAttendanceSchema.index({ hostelId: 1, date: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('HostelAttendance', hostelAttendanceSchema);
