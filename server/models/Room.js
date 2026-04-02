const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
    hostelId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Hostel', 
        required: true,
        index: true
    },
    roomNumber: { 
        type: String, 
        required: true 
    },
    capacity: { 
        type: Number, 
        required: true 
    },
    occupancy: { 
        type: Number, 
        default: 0 
    },
    status: { 
        type: String, 
        enum: ['available', 'full', 'under-maintenance'],
        default: 'available'
    },
    bedDetails: [{
        bedNumber: { type: String },
        isOccupied: { type: Boolean, default: false },
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
    }]
}, { 
    timestamps: true 
});

// Index to ensure unique room numbers within a hostel
roomSchema.index({ hostelId: 1, roomNumber: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
