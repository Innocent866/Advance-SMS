const mongoose = require('mongoose');

const medicalRecordSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now
    },
    symptoms: { type: String, required: true },
    diagnosis: { type: String },
    treatment: { type: String },
    medications: [{
        name: { type: String },
        dosage: { type: String },
        frequency: { type: String },
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    allergies: [{ type: String }],
    bloodGroup: { type: String },
    genotype: { type: String },
    emergencyContact: {
        name: { type: String },
        relationship: { type: String },
        phone: { type: String }
    },
    outcome: {
        type: String,
        enum: ['Returned to Class', 'Sent to Hostel', 'Hostel Rest', 'Sent Home', 'Referred to Hospital', 'Hospital Referral', 'Observation'],
        required: true
    },
    attendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Nurse or Admin
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'UnApproved'],
        default: 'Pending'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    remarks: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
