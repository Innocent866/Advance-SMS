const express = require('express');
const router = express.Router();
const { gradeExam } = require('../controllers/marking.controller');
const { protect, teacher } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { checkFeatureAccess } = require('../middleware/subscription.middleware');

router.post('/grade', protect, teacher, checkFeatureAccess('aiMarking'), upload.single('script'), gradeExam);

module.exports = router;
