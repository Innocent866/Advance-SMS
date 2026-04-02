const mongoose = require('mongoose');

const mealTrackingSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        required: true
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        required: true
    },
    attended: { 
        type: Boolean, 
        default: false 
    },
    dietaryNotes: { type: String },
    markedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { 
    timestamps: true 
});

// Ensure one entry per student per meal per day
mealTrackingSchema.index({ studentId: 1, date: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('MealTracking', mealTrackingSchema);
