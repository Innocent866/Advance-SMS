const express = require('express');
const router = express.Router();
const staffReportController = require('../controllers/staffReport.controller');
const { protect, teacher, admin } = require('../middleware/auth.middleware');
const { checkFeatureAccess } = require('../middleware/subscription.middleware');

// Apply to all routes or specific ones? Prompt says: "Report Writing & Staff-to-Admin Communication" -> Standard Plan
// Staff reports seem to be the feature.
router.use(protect, checkFeatureAccess('staffAdminComm'));

// Base path: /api/staff-reports (to be configured in server.js)

// Staff Routes
router.post('/', protect, staffReportController.createReport);
router.get('/my-reports', protect, staffReportController.getMyReports);
router.post('/:id/reply', protect, staffReportController.addReply);
router.put('/:id', protect, staffReportController.updateReport);

// Admin Routes
router.get('/', protect, admin, staffReportController.getAllReports);
router.put('/:id/status', protect, admin, staffReportController.updateReportStatus);

// Optional
router.delete('/:id', protect, admin, staffReportController.deleteReport);

module.exports = router;
