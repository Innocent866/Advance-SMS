const mongoose = require('mongoose');

const staffReportSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    creatorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Sender details stored snapshot-style or just derived from creatorId.
    // Requirement says "Sender (staff name & role)". We can populate name from creatorId.
    // The specific role they are reporting *as* is stored here:
    senderRole: {
        type: String,
        enum: ['Teacher', 'Class Teacher', 'HOD', 'Principal', 'Vice Principal', 'Counselor', 'Other'],
        required: true
    },
    reportType: {
        type: String,
        enum: ['Academic', 'Discipline', 'Health', 'Attendance', 'Incident', 'General'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    // Optional associations
    relatedClassId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassLevel'
    },
    relatedStudentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    
    title: {
        type: String,
        required: true
    },
    description: {
        type: String, // Rich text content
        required: true
    },
    // File & Metadata (Strict Production Requirements)
    attachment: { type: String },          // Legacy/Compatibility
    url: { type: String },                 // Explicitly requested
    attachmentFileName: { type: String },  // Legacy/Compatibility
    originalName: { type: String },        // Explicitly requested
    public_id: { type: String },           // Explicitly requested
    mimeType: { type: String },            // Explicitly requested
    resourceType: { type: String },        // Explicitly requested
    size: { type: Number },                // Explicitly requested
    attachmentFileType: { type: String },  // Legacy/Compatibility
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Explicitly requested
    
    // Departmental Oversight
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    status: {
        type: String,
        enum: ['Pending HOD', 'HOD Approved', 'HOD Rejected', 'Submitted', 'Reviewed', 'Action Required', 'Resolved'],
        default: 'Pending HOD'
    },
    
    adminComments: [{
        comment: String,
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for common filters
staffReportSchema.index({ schoolId: 1, status: 1 });
staffReportSchema.index({ schoolId: 1, senderRole: 1 });
staffReportSchema.index({ schoolId: 1, reportType: 1 });
staffReportSchema.index({ schoolId: 1, date: -1 });

module.exports = mongoose.model('StaffReport', staffReportSchema);
