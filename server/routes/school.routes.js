const express = require('express');
const router = express.Router();
const { getMySchool, updateSchool } = require('../controllers/school.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.get('/my-school', protect, admin, getMySchool);
router.put('/my-school', protect, admin, updateSchool);

module.exports = router;
