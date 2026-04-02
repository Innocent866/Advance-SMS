const mongoose = require('mongoose');

const promotionRecordSchema = new mongoose.Schema({
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true,
        index: true 
    },
    studentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true,
        index: true 
    },
    fromClassId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ClassLevel',
        required: true
    },
    toClassId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ClassLevel',
        required: true
    },
    fromArm: { type: String },
    toArm: { type: String },
    session: { type: String, required: true },
    term: { type: String, required: true },
    promotedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    reason: { type: String, default: 'End of Term Promotion' },
    date: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('PromotionRecord', promotionRecordSchema);
