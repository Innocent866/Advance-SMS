const express = require('express');
const router = express.Router();
const { 
    createStudent, 
    getStudents, 
    getTeacherStudents, 
    getMyProfile, 
    getStudentById,
    updateStudent,
    deleteStudent,
    generateUploadLink,
    getActiveUploadLinks,
    revokeUploadSession,
    verifyUploadToken,
    bulkUpload,
    promoteStudents
} = require('../controllers/student.controller');
const { protect, admin, teacher } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { checkResourceLimit } = require('../middleware/subscription.middleware');

router.route('/')
    .post(protect, admin, checkResourceLimit('Student'), upload.single('profilePicture'), createStudent)
    .get(protect, getStudents);

// Manage Upload Links (Admin)
router.get('/active-upload-links', protect, admin, getActiveUploadLinks);
router.post('/generate-upload-link', protect, admin, generateUploadLink);
router.post('/revoke-upload-session', protect, admin, revokeUploadSession);
router.post('/promote', protect, admin, promoteStudents);

// Self Registration (Public)
router.post('/verify-upload-token', verifyUploadToken);
router.post('/bulk-upload', upload.single('profilePicture'), bulkUpload);

router.get('/my-students', protect, teacher, getTeacherStudents);
router.get('/me', protect, getMyProfile);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, admin, upload.single('profilePicture'), updateStudent);
router.delete('/:id', protect, admin, deleteStudent);

module.exports = router;
