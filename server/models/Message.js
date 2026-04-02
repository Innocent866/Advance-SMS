const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ChatGroup',
        required: false
    },
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    content: {
        type: String,
        required: function() { return this.messageType === 'text'; }
    },
    messageType: {
        type: String,
        enum: ['text', 'file'],
        default: 'text'
    },
    category: {
        type: String,
        enum: ['official', 'casual', 'private', 'group'],
        required: true
    },
    attachment: {
        url: String,
        filename: String,
        fileType: String,
        size: Number
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Message', messageSchema);
