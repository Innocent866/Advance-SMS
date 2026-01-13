const express = require('express');
const router = express.Router();
const { createTeacher, getTeachers, getTeacherById } = require('../controllers/teacher.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.route('/')
    .post(protect, admin, upload.single('profilePicture'), createTeacher)
    .get(protect, admin, getTeachers);

router.get('/me', protect, require('../controllers/teacher.controller').getMyProfile);
router.get('/:id', protect, admin, getTeacherById);

module.exports = router;
