const express = require('express');
const router = express.Router();
const { gradeExam, saveResult, getHistory } = require('../controllers/marking.controller');
const { protect, teacher } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

const { checkFeatureAccess } = require('../middleware/subscription.middleware');

router.use(protect);
router.post('/grade', teacher, checkFeatureAccess('aiMarking'), upload.single('script'), gradeExam);
router.post('/save', teacher, saveResult);
router.get('/history', teacher, getHistory);

module.exports = router;
