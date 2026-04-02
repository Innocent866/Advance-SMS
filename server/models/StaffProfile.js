const mongoose = require('mongoose');

const staffProfileSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profilePicture: { type: String },
    designation: { type: String }, // e.g., "Senior Houseparent", "Assistant Admin"
    assignedHouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    dateAssigned: { type: Date },
    emergencyContact: {
        name: String,
        relationship: String,
        phone: String
    },
    bio: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('StaffProfile', staffProfileSchema);
