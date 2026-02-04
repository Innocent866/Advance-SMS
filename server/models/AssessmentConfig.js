const mongoose = require('mongoose');

const assessmentConfigSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    session: {
        type: String, // e.g., "2025/2026"
        required: true
    },
    term: {
        type: String, // "First Term", "Second Term", "Third Term"
        required: true,
        enum: ['First Term', 'Second Term', 'Third Term']
    },
    components: [{
        name: { type: String, required: true }, // "CA1", "Exam"
        maxScore: { type: Number, required: true },
        description: { type: String }
    }],
    totalMaxScore: {
        type: Number,
        default: 100
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    isActive: { // Which config is currently serving "now"
        type: Boolean,
        default: true
    },
    gradingScale: [{
        grade: { type: String, required: true }, // "A"
        minScore: { type: Number, required: true }, // 70
        maxScore: { type: Number, required: true }, // 100
        remark: { type: String } // "Excellent"
    }]
}, {
    timestamps: true
});

// Ensure one active config per term/session per school
assessmentConfigSchema.index({ schoolId: 1, session: 1, term: 1 }, { unique: true });

module.exports = mongoose.model('AssessmentConfig', assessmentConfigSchema);
