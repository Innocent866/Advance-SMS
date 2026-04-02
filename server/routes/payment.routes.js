const express = require('express');
const router = express.Router();
const { initializePayment, verifyPayment, getMyPaymentHistory, getAllPayments, getFinancialStats, getBanks } = require('../controllers/payment.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { checkFeature } = require('../middleware/feature.middleware');

router.use(protect);
router.use(checkFeature('financials'));

router.post('/initialize', initializePayment);
router.post('/verify', verifyPayment);
router.get('/verify/:reference', verifyPayment);
router.get('/history', authorize('parent'), getMyPaymentHistory);

router.get('/admin/all', authorize('school_admin', 'super_admin'), getAllPayments);
router.get('/admin/stats', authorize('school_admin', 'super_admin'), getFinancialStats);
router.get('/banks', authorize('school_admin', 'super_admin'), getBanks);

module.exports = router;
