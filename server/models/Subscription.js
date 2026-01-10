const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true 
    },
    plan: { 
        type: String, 
        enum: ['Free', 'Pro', 'Enterprise'], 
        default: 'Free' 
    },
    amount: { type: Number, required: true }, // Amount in kobo
    status: { 
        type: String, 
        enum: ['active', 'past_due', 'cancelled', 'attention', 'non_renewing'], 
        default: 'active' 
    },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
    paystackSubscriptionCode: { type: String },
    paystackEmailToken: { type: String },
    email: { type: String, required: true },
    transactionRef: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
