const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    action: {
        type: String,
        required: true
    },
    category: {
        type: String, // e.g., 'Student', 'Teacher', 'Academic', 'Finance'
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    ipAddress: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
