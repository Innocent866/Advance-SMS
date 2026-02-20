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
    defaultStudentPassword: { type: String, default: 'student123' },
    defaultTeacherPassword: { type: String, default: 'teacher123' },
    preferences: {
        enableAfterSchoolLearning: { type: Boolean, default: true },
        autoApproveContent: { type: Boolean, default: false }
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
    },
    // Media Usage Tracking
    mediaUsage: {
        students: { type: Number, default: 50 },
        teachers: { type: Number, default: 5 },
        nurses: { type: Number, default: 1 },
        doctors: { type: Number, default: 1 },
        storageBytes: { type: Number, default: 1073741824 } // 1GB default
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
    receiptSettings: {
        showLogo: { type: Boolean, default: true },
        title: { type: String, default: 'Payment Receipt' },
        message: { type: String, default: 'Thank you for your payment.' },
        contactDetails: { type: String }, // Optional override for receipt-specific contact
        signature: { type: String, default: 'Management' },
        logoUrl: { type: String } // Specific receipt logo if different from main school logo
    },
    // Bank Details
    bankDetails: {
        bankName: { type: String, default: '' },
        bankCode: { type: String, default: '' }, // e.g. '058'
        accountName: { type: String, default: '' },
        accountNumber: { type: String, default: '' }
    },
    paystackSubaccountCode: { type: String }, // e.g. ACCT_xxxx
    receiptCounter: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false }, // Super Admin verification required
    createdAt: { type: Date, default: Date.now }
});

// Helper to update subscription based on plan name
schoolSchema.methods.updateSubscription = function(planName) {
    const plans = require('../config/subscriptionPlans');
    const planConfig = plans[planName];

    if (!planConfig) throw new Error('Invalid Plan');

    this.subscription.plan = planName;
    this.subscription.maxStudents = planConfig.maxStudents;
    this.subscription.maxTeachers = planConfig.maxStaff;
    
    // Set Expiry (e.g., 3 months from now for paid plans)
    if (planName !== 'Free') {
        const d = new Date();
        d.setMonth(d.getMonth() + 3);
        this.subscription.expiryDate = d;
        this.subscription.status = 'active';
    } else {
        this.subscription.expiryDate = null;
        this.subscription.status = 'active';
    }
};

module.exports = mongoose.model('School', schoolSchema);
