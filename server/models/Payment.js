const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true 
    },
    amount: { type: Number, required: true }, // in kobo
    currency: { type: String, default: 'NGN' },
    reference: { type: String, required: true, unique: true },
    status: { 
        type: String, 
        enum: ['success', 'failed', 'pending', 'abandoned'], 
        default: 'pending' 
    },
    plan: { type: String },
    paidAt: { type: Date },
    channel: { type: String }, // card, bank, etc.
    metadata: { type: Object }
}, {
    timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);
