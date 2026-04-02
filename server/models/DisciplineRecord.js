const mongoose = require('mongoose');

const disciplineRecordSchema = new mongoose.Schema({
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
    incidentDate: {
        type: Date,
        required: true
    },
    incidentType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    actionTaken: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Low'
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'UnApproved'],
        default: 'Pending'
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    attachments: [{
        name: { type: String },
        url: { type: String }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('DisciplineRecord', disciplineRecordSchema);
