const mongoose = require('mongoose');

const studentUploadSessionSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    classId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ClassLevel',
        required: true
    },
    arm: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    expiresAt: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Auto-delete expired sessions
studentUploadSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('StudentUploadSession', studentUploadSessionSchema);
