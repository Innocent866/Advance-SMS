const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoLesson', required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: [{
        text: { type: String, required: true },
        type: { type: String, enum: ['multiple-choice', 'text'], default: 'multiple-choice' },
        options: [{ type: String }], // Array of strings for options
        correctAnswer: { type: String } // For auto-grading multiple choice
    }],
    duration: { type: Number }, // In minutes, optional
    isPublished: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
