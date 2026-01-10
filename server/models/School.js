const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    address: { type: String },
    contactEmail: { type: String, required: true },
    logoUrl: { type: String },
    branding: {
        primaryColor: { type: String, default: '#16a34a' },
        secondaryColor: { type: String, default: '#f59e0b' }
    },
    preferences: {
        enableAfterSchoolLearning: { type: Boolean, default: true },
        autoApproveContent: { type: Boolean, default: false }
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    },
    // Subscription Details (Manual Model)
    subscription: {
        plan: { type: String, enum: ['Free', 'Basic', 'Standard', 'Premium'], default: 'Free' },
        status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' }, // Default active for Free
        startDate: { type: Date, default: Date.now },
        expiryDate: { type: Date }, // Null for free, set for paid
        paymentRef: { type: String },
        maxStudents: { type: Number, default: 50 }, // Example default
        maxTeachers: { type: Number, default: 5 }
    },
    isVerified: { type: Boolean, default: false }, // Super Admin verification required
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('School', schoolSchema);
