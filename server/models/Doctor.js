const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
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
    licenseNumber: { type: String, required: true },
    qualification: { type: String }, // MBBS, MD
    specialization: { type: String }, // General Practitioner, etc.
    consultationHours: { type: String }, // e.g., "Mon-Fri 9am-1pm"

    status: { 
        type: String, 
        enum: ['active', 'inactive'], 
        default: 'active' 
    }
}, { 
    timestamps: true 
});

module.exports = mongoose.model('Doctor', doctorSchema);
