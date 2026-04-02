const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { checkFeature } = require('../middleware/feature.middleware');

router.use(protect);
router.use(checkFeature('attendanceTracking'));
const { markAttendance, getAttendance, getAttendanceStats } = require('../controllers/attendance.controller');

router.post('/', authorize('teacher', 'school_admin', 'super_admin'), markAttendance);
router.get('/', getAttendance);
router.get('/stats', getAttendanceStats);

module.exports = router;
