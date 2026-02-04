const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Student', 
        required: true, 
        unique: true // Constraint: One parent per student
    },
    school: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'School', 
        required: true 
    },
    phone: { type: String },
    address: { type: String },
}, {
    timestamps: true
});

module.exports = mongoose.model('Parent', parentSchema);
