const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    // --- Identity & Auth Links ---
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true,
        index: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true,
        index: true 
    },

    // --- Personal Information ---
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String }, // Optional for students? Request says required field in list.
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profilePicture: { type: String }, // Cloudinary URL
    
    // --- Academic Details ---
    studentId: { type: String, required: true }, // e.g. Admission Number
    classId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ClassLevel',
        required: true,
        index: true
    },
    level: { 
        type: String, 
        enum: ['JSS', 'SSS'],
        required: true
    },
    arm: { type: String }, // e.g., 'A', 'B', 'Gold'
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }],

    // --- Status ---
    status: { 
        type: String, 
        enum: ['active', 'suspended', 'graduated'], 
        default: 'active' 
    },
    enrollmentStatus: {
        type: String,
        enum: ['Day', 'Border'],
        default: 'Day'
    },

    // --- Boarding Details (Active Allocation) ---
    isBoarder: {
        type: Boolean,
        default: false
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    bedNumber: {
        type: String
    },
    boardingCheckInDate: {
        type: Date
    },

    // --- Academic & Learning Tracking ---
    // Note: In high-volume systems, these might be better as separate collections (VideoProgress, Submission).
    // Keeping as embedded arrays per user request for Profile aggregation, 
    // but recommend limiting size or offloading to separate collections for analytics.
    videosWatched: [{
        videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'VideoLesson' },
        watchedAt: { type: Date, default: Date.now },
        watchDuration: { type: Number } // in seconds or percent
    }],
    tasksCompleted: [{
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        score: { type: Number },
        submittedAt: { type: Date, default: Date.now }
    }],

    // --- Document Repository ---
    documents: [{
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String },
        uploadedAt: { type: Date, default: Date.now },
        status: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
        adminComment: { type: String }
    }],

    // --- Parent Info (Future Phase) ---
    parentName: { type: String },
    parentPhone: { type: String },
    parentEmail: { type: String },

}, { 
    timestamps: true 
});

// Indexes for performance
studentSchema.index({ schoolId: 1, classId: 1 });
studentSchema.index({ studentId: 1 });
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ schoolId: 1, isBoarder: 1 });
studentSchema.index({ schoolId: 1, level: 1 });

module.exports = mongoose.model('Student', studentSchema);
