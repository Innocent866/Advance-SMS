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
router.post('/', staffReportController.createReport);
router.get('/my-reports', staffReportController.getMyReports);
router.post('/:id/reply', staffReportController.addReply);
router.put('/:id', staffReportController.updateReport);

// HOD & Admin Review Routes
router.get('/', teacher, staffReportController.getAllReports); 
router.post('/hod-review/:id', teacher, staffReportController.hodReview);
router.put('/:id/status', admin, staffReportController.updateReportStatus);

// Optional
router.delete('/:id', admin, staffReportController.deleteReport);

module.exports = router;
