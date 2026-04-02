const express = require('express');
const router = express.Router();
const { registerSchool, loginUser, getMe, updateProfile, changePassword, forgotPassword, resetPassword, verifyEmail, verify2FA } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register-school', registerSchool); // Public
router.post('/login', loginUser); // Public
router.post('/verify-2fa', verify2FA); // Public
router.post('/forgot-password', forgotPassword); // Public
router.post('/reset-password/:token', resetPassword); // Public
router.get('/verify-email/:token', verifyEmail); // Public

router.get('/me', protect, getMe); // Private
router.put('/profile', protect, updateProfile); // Private
router.put('/password', protect, changePassword); // Private

module.exports = router;
