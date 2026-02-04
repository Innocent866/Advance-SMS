const mongoose = require('mongoose');

const learningMaterialSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['Assignment', 'Note', 'Worksheet', 'Test Prep'],
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    classLevel: {
        type: String, // e.g., "JSS1", "SSS2"
        required: true
    },
    arm: {
        type: String, // e.g., "A", "B" - Optional if material is for all arms
    },
    term: {
        type: String,
        enum: ['First Term', 'Second Term', 'Third Term'],
        required: true
    },
    session: {
        type: String, // e.g., "2023/2024"
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    fileUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Draft', 'Pending Approval', 'Approved', 'Rejected'],
        default: 'Draft',
        index: true
    },
    adminFeedback: {
        type: String
    },
    downloadCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Compound indexes for searching
learningMaterialSchema.index({ schoolId: 1, status: 1 });
learningMaterialSchema.index({ schoolId: 1, classLevel: 1, subject: 1 });

module.exports = mongoose.model('LearningMaterial', learningMaterialSchema);
