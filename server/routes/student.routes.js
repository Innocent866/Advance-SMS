const express = require('express');
const router = express.Router();
const { createStudent, getStudents, getTeacherStudents, getMyProfile, getStudentById } = require('../controllers/student.controller');
const { protect, admin, teacher } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { checkResourceLimit } = require('../middleware/subscription.middleware');

router.route('/')
    .post(protect, admin, checkResourceLimit('Student'), upload.single('profilePicture'), createStudent)
    .get(protect, getStudents);

router.get('/my-students', protect, teacher, getTeacherStudents);
router.get('/me', protect, getMyProfile);
router.get('/:id', protect, getStudentById);
router.put('/:id', protect, admin, upload.single('profilePicture'), require('../controllers/student.controller').updateStudent);
router.delete('/:id', protect, admin, require('../controllers/student.controller').deleteStudent);

module.exports = router;
