const MedicalRecord = require('../models/MedicalRecord');
const { createNotification } = require('./notification.controller');

// @desc    Create a new medical record
// @route   POST /api/medical
// @access  Private (Nurse, Doctor)
const createRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            recordedBy: req.user._id,
            ...req.body
        });

        res.status(201).json(record);

        // Notify? Maybe parent if critical.
        if (record.status === 'Admitted' || record.status === 'Referred' || record.recordType === 'Emergency') {
             // Logic to notify parent would go here
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all records for a student
// @route   GET /api/medical/student/:studentId
// @access  Private (Nurse, Doctor, Admin, Parent/Student own)
const getStudentRecords = async (req, res) => {
    try {
        const records = await MedicalRecord.find({ 
            studentId: req.params.studentId,
            schoolId: req.user.schoolId._id || req.user.schoolId
        })
        .populate('recordedBy', 'name role')
        .sort({ createdAt: -1 });

        res.json(records);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single record
// @route   GET /api/medical/:id
// @access  Private
const getRecordById = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id)
             .populate('recordedBy', 'name role')
             .populate('studentId', 'firstName lastName studentId');
        
        if (!record) return res.status(404).json({ message: 'Record not found' });
        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update record
// @route   PUT /api/medical/:id
// @access  Private (Nurse, Doctor)
const updateRecord = async (req, res) => {
    try {
        let record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        // Update fields
        Object.assign(record, req.body);
        
        await record.save();
        res.json(record);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete record
// @route   DELETE /api/medical/:id
// @access  Private (Admin, Creator)
const deleteRecord = async (req, res) => {
    try {
        const record = await MedicalRecord.findById(req.params.id);
        if (!record) return res.status(404).json({ message: 'Record not found' });

        await MedicalRecord.deleteOne({ _id: record._id });
        res.json({ message: 'Record removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createRecord,
    getStudentRecords,
    getRecordById,
    updateRecord,
    deleteRecord
};
