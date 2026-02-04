const express = require('express');
const router = express.Router();
const { createTeacher, getTeachers, getTeacherById } = require('../controllers/teacher.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { checkResourceLimit } = require('../middleware/subscription.middleware');

router.route('/')
    .post(protect, admin, checkResourceLimit('Teacher'), upload.single('profilePicture'), createTeacher)
    .get(protect, admin, getTeachers);

router.get('/me', protect, require('../controllers/teacher.controller').getMyProfile);
router.get('/:id', protect, admin, getTeacherById);
router.put('/:id', protect, admin, upload.single('profilePicture'), require('../controllers/teacher.controller').updateTeacher);
router.delete('/:id', protect, admin, require('../controllers/teacher.controller').deleteTeacher);

module.exports = router;
