const mongoose = require('mongoose');

const AIUsageLogSchema = new mongoose.Schema({
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
    action: {
        type: String,
        enum: ['generate_lesson'],
        default: 'generate_lesson'
    },
    promptType: {
        type: String, // e.g., 'Lesson Plan', 'Notes', 'Slides'
        required: true
    },
    tokensUsed: {
        type: Number,
        default: 0
    },
    modelUsed: {
        type: String, // e.g., 'gpt-3.5-turbo'
        default: 'gpt-3.5-turbo'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for aggregation efficiency (e.g., sum tokens per school per month)
AIUsageLogSchema.index({ schoolId: 1, createdAt: 1 });

module.exports = mongoose.model('AIUsageLog', AIUsageLogSchema);
