const mongoose = require('mongoose');

const HostelNotificationSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' }, // Optional: null for all hostels
    title: { type: String, required: true },
    message: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date },
    status: { type: String, enum: ['Active', 'Expired', 'Archived'], default: 'Active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HostelNotification', HostelNotificationSchema);
