const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const { submitResults, getResults, getMyResults } = require('../controllers/result.controller');

router.post('/', protect, authorize('teacher', 'school_admin', 'super_admin'), submitResults);
router.get('/my-results', protect, authorize('student'), getMyResults);
router.get('/', protect, getResults);

module.exports = router;
