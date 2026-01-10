const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, paystackWebhook } = require('../controllers/payment.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.post('/initialize', protect, admin, initializePayment);
router.get('/verify/:reference', protect, admin, verifyPayment);

module.exports = router;
