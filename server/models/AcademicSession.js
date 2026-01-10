const mongoose = require('mongoose');

const academicSessionSchema = new mongoose.Schema({
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
    name: { type: String, required: true }, // e.g. "2025/2026"
    terms: [{
        name: { type: String, required: true }, // "First Term", "Second Term"
        startDate: { type: Date },
        endDate: { type: Date }
    }],
    currentTerm: { type: String }, // Name of the active term
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AcademicSession', academicSessionSchema);
