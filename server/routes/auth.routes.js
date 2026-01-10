const express = require('express');
const router = express.Router();
const { registerSchool, loginUser, getMe, updateProfile, changePassword } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register-school', registerSchool); // Public
router.post('/login', loginUser); // Public
router.get('/me', protect, getMe); // Private
router.put('/profile', protect, updateProfile); // Private
router.put('/password', protect, changePassword); // Private

module.exports = router;
