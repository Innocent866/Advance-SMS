const mongoose = require('mongoose');

const videoLessonSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classLevelId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassLevel', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    topic: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    publicId: { type: String }, // Cloudinary Public ID for deletion
    duration: { type: Number }, // Duration in seconds
    format: { type: String },   // e.g., mp4, mov
    lessonNotes: { type: String },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoLesson', videoLessonSchema);
