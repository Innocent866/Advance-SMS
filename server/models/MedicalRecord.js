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
    recordedBy: { // Nurse or Doctor
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recordType: {
        type: String,
        enum: ['Observation', 'Consultation', 'Emergency', 'Routine Checkup'],
        required: true
    },
    
    // Vitals
    temperature: { type: String }, // e.g. 37.5 C
    bloodPressure: { type: String }, // e.g. 120/80
    pulseRate: { type: String },
    weight: { type: String },
    height: { type: String },

    // Diagnosis & Treatment
    symptoms: { type: String, required: true },
    diagnosis: { type: String }, // Doctor only usually
    prescription: { type: String }, // Doctor only
    comments: { type: String },

    // Status
    status: {
        type: String,
        enum: ['Under Observation', 'Admitted', 'Referred', 'Discharged', 'Healthy'],
        default: 'Under Observation'
    },
    
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },

    // Attachments (Lab results etc)
    attachments: [{ type: String }] // URLs

}, { 
    timestamps: true 
});

// Index for fast lookup by student
medicalRecordSchema.index({ schoolId: 1, studentId: 1, createdAt: -1 });

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
