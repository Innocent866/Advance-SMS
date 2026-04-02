const express = require('express');
const router = express.Router();
const { getLearningStats } = require('../controllers/analytics.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { checkFeature } = require('../middleware/feature.middleware');

const { checkFeatureAccess } = require('../middleware/subscription.middleware');

router.use(protect);
router.use(checkFeature('advancedAnalytics'));

router.get('/', admin, getLearningStats);

module.exports = router;
