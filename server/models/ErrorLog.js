const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    },
    stack: {
        type: String
    },
    statusCode: {
        type: Number
    },
    path: {
        type: String
    },
    method: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    body: {
        type: Object // Store request body for debugging (be careful with sensitive data)
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 60 * 24 * 30 // Auto-delete after 30 days
    }
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);
