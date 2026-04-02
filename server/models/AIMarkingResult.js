const mongoose = require('mongoose');

const AIMarkingResultSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    teacherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    examType: {
        type: String,
        required: true
    },
    question: {
        type: String,
        required: true
    },
    markingScheme: {
        type: String,
        required: true
    },
    studentAnswer: {
        type: String
    },
    scriptUrl: {
        type: String
    },
    scoreBreakdown: [{
        point: String,
        marksAwarded: Number,
        maxMarks: Number,
        reason: String
    }],
    totalSuggestedScore: {
        type: Number,
        required: true
    },
    finalizedScore: {
        type: Number
    },
    maxPossibleScore: {
        type: Number,
        required: true
    },
    feedback: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fetching history
AIMarkingResultSchema.index({ teacherId: 1, createdAt: -1 });

module.exports = mongoose.model('AIMarkingResult', AIMarkingResultSchema);
