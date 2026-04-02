const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { checkFeatureAccess } = require('../middleware/subscription.middleware');
const { createOrUpdateConfig, getConfig } = require('../controllers/assessment.controller');

router.use(protect);

router.get('/', getConfig);
router.post('/', authorize('school_admin', 'super_admin'), checkFeatureAccess('continuousAssessment'), createOrUpdateConfig);


module.exports = router;
