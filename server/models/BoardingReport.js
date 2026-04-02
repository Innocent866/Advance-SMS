const mongoose = require('mongoose');

const boardingReportSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    hostelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hostel'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['Daily', 'Weekly', 'Monthly', 'Incident', 'Other'],
        default: 'Daily'
    },
    status: {
        type: String,
        enum: ['Sent', 'Read', 'Approved', 'Archived'],
        default: 'Sent'
    },
    attachments: [String],
    isPublic: {
        type: Boolean,
        default: false
    },
    comments: [{
        text: String,
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        senderRole: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

boardingReportSchema.index({ schoolId: 1, createdAt: -1 });

module.exports = mongoose.model('BoardingReport', boardingReportSchema);
