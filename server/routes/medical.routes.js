const express = require('express');
const router = express.Router();
const { 
    createRecord, 
    getStudentRecords, 
    getRecordById, 
    updateRecord, 
    deleteRecord 
} = require('../controllers/medicalRecord.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Records are usually created by Nurse or Doctor
router.post('/', protect, authorize('nurse', 'doctor'), upload.array('attachments'), createRecord);

// Get records for a specific student (Nurse, Doctor, Admin, or Parent/Student own)
router.get('/student/:studentId', protect, getStudentRecords);

router.route('/:id')
    .get(protect, getRecordById)
    .put(protect, authorize('nurse', 'doctor'), upload.array('attachments'), updateRecord)
    .delete(protect, authorize('nurse', 'doctor', 'school_admin'), deleteRecord);

module.exports = router;
