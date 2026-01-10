const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classLevelId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClassLevel', required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    term: { type: String, required: true }, // First, Second, Third
    week: { type: Number, required: true },
    topic: { type: String, required: true },
    content: { type: Object, required: true }, // JSON structure of the plan
    lessonNotes: { type: String }, // AI Generated Notes
    slideOutline: { type: [String] }, // Array of slide points
    status: { 
        type: String, 
        enum: ['Draft', 'Pending', 'Approved', 'Rejected'], 
        default: 'Draft' 
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
