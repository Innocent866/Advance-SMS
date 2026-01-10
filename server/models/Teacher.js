const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
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
    email: { type: String, required: true },
    phoneNumber: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profilePicture: { type: String },
    profilePicture: { type: String }, // URL or path to image
    
    // --- Professional Details ---
    employeeId: { type: String },
    qualification: { type: String }, // e.g., B.Ed, MSc
    yearsOfExperience: { type: Number, default: 0 },
    
    // --- Academic Assignments ---
    // Subjects the teacher is qualified/assigned to teach
    subjects: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Subject' 
    }],
    // Classes the teacher is assigned to (e.g., JSS1)
    classes: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ClassLevel' 
    }],
    teachingAssignments: [{ 
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
        classId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassLevel' },
        arm: { type: String }
    }],
    level: [{ 
        type: String, 
        enum: ['JSS', 'SSS'] 
    }],

    // --- Status & Activity ---
    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    },

    // --- Teaching & AI Metadata ---
    aiUsageCount: { type: Number, default: 0 },
    lastAiGeneratedAt: { type: Date },
    lessonCount: { type: Number, default: 0 }, // Cache for analytics
    videoLessonCount: { type: Number, default: 0 }, // Cache for analytics

}, { 
    timestamps: true 
});

// Indexes for performance
teacherSchema.index({ schoolId: 1, status: 1 });
teacherSchema.index({ email: 1 });

module.exports = mongoose.model('Teacher', teacherSchema);
