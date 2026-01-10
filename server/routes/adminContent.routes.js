const express = require('express');
const router = express.Router();
const { getAllContent, updateContentStatus } = require('../controllers/adminContent.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/', protect, admin, getAllContent);
router.post('/status', protect, admin, updateContentStatus);

module.exports = router;
