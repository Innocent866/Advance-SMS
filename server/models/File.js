const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    public_id: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    resourceType: {
        type: String,
        required: true,
        enum: ['images', 'videos', 'documents']
    },
    size: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    }
}, {
    timestamps: true
});

// Security index for school-based access
fileSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('File', fileSchema);
