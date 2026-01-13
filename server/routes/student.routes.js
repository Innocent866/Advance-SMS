const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getTeacherStudents, getMyProfile, getStudentById } = require('../controllers/student.controller');
const { protect, admin, teacher } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
    .post(protect, admin, upload.single('profilePicture'), createStudent)
    .get(protect, getStudents);

router.get('/my-students', protect, teacher, getTeacherStudents);
router.get('/me', protect, getMyProfile);
router.get('/:id', protect, admin, getStudentById);

module.exports = router;
