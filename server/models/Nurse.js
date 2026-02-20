const mongoose = require('mongoose');

const nurseSchema = new mongoose.Schema({
    schoolId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true,
        index: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        unique: true,
        index: true 
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    profilePicture: { type: String },
    
    // Professional Details
    employeeId: { type: String },
    qualification: { type: String }, 
    yearsOfExperience: { type: Number, default: 0 },
    specialization: { type: String }, // e.g., Pediatric, General

    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Nurse', nurseSchema);
