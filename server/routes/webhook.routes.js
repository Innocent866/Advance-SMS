const express = require('express');
const router = express.Router();
const { paystackWebhook } = require('../controllers/payment.controller');

router.post('/paystack', paystackWebhook);

module.exports = router;
