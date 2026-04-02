const mongoose = require('mongoose');

const leaveRequestSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index: true
    },
    reason: { 
        type: String, 
        required: true 
    },
    leaveType: {
        type: String,
        enum: ['Weekend', 'Mid-Term', 'Emergency', 'Medical', 'Other'],
        required: true
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['Pending', 'Approved', 'Rejected', 'Out', 'Returned', 'Cancelled', 'Back from Leave'],
        default: 'Pending'
    },
    exitTime: { type: Date },
    returnTime: { type: Date },
    actualReturnTime: { type: Date },
    approvedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    parentConsent: { 
        type: Boolean, 
        default: false 
    },
    remarks: { type: String },
    comments: [{
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        text: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, { 
    timestamps: true 
});

module.exports = mongoose.model('LeaveRequest', leaveRequestSchema);
