const mongoose = require('mongoose');

const feePaymentSchema = new mongoose.Schema({
    school: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true 
    },
    parent: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Parent' 
        // Optional, maybe paid by student directly or admin? But for this flow, usually parent.
    },
    baseAmount: { type: Number, required: true }, // The original tuition amount
    gatewayFee: { type: Number, default: 0 }, // The Paystack surcharge added
    amount: { type: Number, required: true }, // Total paid (base + fee)
    reference: { type: String, required: true, unique: true }, // Paystack Ref
    receiptNumber: { type: String, unique: true, sparse: true }, // Generated on success
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    },
    type: { type: String, default: 'tuition' }, // e.g., tuition, uniform, exam_fee
    term: { type: String },
    session: { type: String },
    paidAt: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('FeePayment', feePaymentSchema);
