const mongoose = require('mongoose');

const classLevelSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g., JSS1, JSS2, SSS1
    category: { type: String, enum: ['JSS', 'SSS'], required: true },
    arms: [{ 
        name: { type: String, required: true }, // A, B, Gold, etc.
        classTeacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Assigned class teacher
        subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }] // Arm-specific subjects
    }], 
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Subjects offered by this class
    
    // After-School Settings
    hasAfterSchoolLearning: { type: Boolean, default: true },
    videoSubjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }], // Subjects enabled for video lessons
    
    createdAt: { type: Date, default: Date.now }
});

classLevelSchema.index({ schoolId: 1 });

module.exports = mongoose.model('ClassLevel', classLevelSchema);
