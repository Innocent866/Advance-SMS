const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    schoolId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    hodId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Avoid duplicate department names per school
departmentSchema.index({ schoolId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);
