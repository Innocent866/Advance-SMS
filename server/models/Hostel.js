const mongoose = require('mongoose');

const hostelSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true,
        index: true
    },
    type: { 
        type: String, 
        enum: ['Boys', 'Girls', 'Mixed'],
        required: true
    },
    capacity: { 
        type: Number, 
        default: 0 
    },
    wardenId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    houseParentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    },
    location: { type: String },
    description: { type: String },
    status: { 
        type: String, 
        enum: ['active', 'inactive', 'under-maintenance'],
        default: 'active'
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Hostel', hostelSchema);
