const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, getMyPaymentHistory, getAllPayments, getFinancialStats, getBanks } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

router.post('/initialize', protect, authorize('parent'), initializePayment);
router.post('/verify', protect, authorize('parent'), verifyPayment);
router.get('/history', protect, authorize('parent'), getMyPaymentHistory);

router.get('/admin/all', protect, authorize('school_admin', 'super_admin'), getAllPayments);
router.get('/admin/stats', protect, authorize('school_admin', 'super_admin'), getFinancialStats);
router.get('/banks', protect, authorize('school_admin', 'super_admin'), getBanks);

module.exports = router;
