const express = require('express');
const router = express.Router();
const { getLearningStats } = require('../controllers/analytics.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/', protect, admin, getLearningStats);

module.exports = router;
