const mongoose = require('mongoose');

const videoProgressSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoLesson', required: true },
    completed: { type: Boolean, default: false },
    watchedAt: { type: Date, default: Date.now }
});

// Avoid duplicate records for same student-video
videoProgressSchema.index({ studentId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('VideoProgress', videoProgressSchema);
