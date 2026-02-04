const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassLevel',
        required: true
    },
    subjectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
    },
    session: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    // Flexible map for scores: e.g. { "CA1": 15, "Exam": 60 }
    // We use Map for flexibility, but keys must match AssessmentConfig components
    scores: {
        type: Map,
        of: Number
    },
    totalScore: {
        type: Number,
        required: true,
        default: 0
    },
    grade: {
        type: String, // A, B, C...
    },
    remark: {
        type: String
    },
    teacherId: { // Who uploaded it
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes for fast lookup
resultSchema.index({ schoolId: 1, studentId: 1, session: 1, term: 1 });
resultSchema.index({ schoolId: 1, classId: 1, subjectId: 1 });

module.exports = mongoose.model('Result', resultSchema);
