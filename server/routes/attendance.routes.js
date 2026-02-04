const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { markAttendance, getAttendance } = require('../controllers/attendance.controller');

router.post('/', protect, authorize('teacher', 'school_admin', 'super_admin'), markAttendance);
router.get('/', protect, getAttendance);

module.exports = router;
