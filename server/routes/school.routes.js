const express = require('express');
const router = express.Router();
const { getMySchool, updateSchool } = require('../controllers/school.controller');
const { protect, admin } = require('../middleware/auth.middleware');

const upload = require('../middleware/upload.middleware');

router.get('/my-school', protect, getMySchool);
router.put('/my-school', protect, admin, upload.single('logo'), updateSchool);

module.exports = router;
