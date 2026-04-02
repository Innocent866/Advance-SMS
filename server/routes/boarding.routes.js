const express = require('express');
const router = express.Router();
const boardingController = require('../controllers/boarding.controller');
const { protect, admin, authorize } = require('../middleware/auth.middleware');
const { checkFeature } = require('../middleware/feature.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.use(checkFeature('boarding'));

// Room Allocation
router.post('/allocate', admin, boardingController.allocateRoom);
router.post('/deallocate', admin, boardingController.deallocateRoom);

// Hostel Attendance
router.post('/attendance', boardingController.markHostelAttendance);
router.post('/meals', boardingController.recordMealAttendance);
router.get('/meals', boardingController.getMealAttendance);

// Leave Management
router.post('/leave-request', boardingController.requestLeave);
router.put('/leave-approve/:id', authorize('school_admin', 'assistant_admin', 'super_admin', 'house_parent', 'hostel_warden'), boardingController.approveLeave);
router.get('/leaves', boardingController.getAllLeaveRequests);

// Medical Records
router.post('/medical', checkFeature('medicalRecords'), boardingController.addMedicalRecord);
router.get('/medical', checkFeature('medicalRecords'), boardingController.getAllMedicalRecords);
router.put('/medical/:id', checkFeature('medicalRecords'), boardingController.updateMedicalRecord);
router.delete('/medical/:id', checkFeature('medicalRecords'), boardingController.deleteMedicalRecord);
router.put('/medical/:id/approve', admin, checkFeature('medicalRecords'), boardingController.approveMedicalRecord);

// Discipline Records
router.post('/discipline', checkFeature('disciplineManagement'), boardingController.addDisciplineRecord);
router.get('/discipline', checkFeature('disciplineManagement'), boardingController.getAllDisciplineRecords);
router.put('/discipline/:id', checkFeature('disciplineManagement'), boardingController.updateDisciplineRecord);
router.delete('/discipline/:id', checkFeature('disciplineManagement'), boardingController.deleteDisciplineRecord);
router.put('/discipline/:id/approve', admin, checkFeature('disciplineManagement'), boardingController.approveDisciplineRecord);

// Boarding Reports
router.post('/reports', protect, upload.array('attachments', 5), boardingController.addBoardingReport);
router.get('/reports', protect, boardingController.getAllBoardingReports);
router.put('/reports/:id', protect, upload.array('attachments', 5), boardingController.updateBoardingReport);
router.delete('/reports/:id', protect, boardingController.deleteBoardingReport);
router.put('/reports/:id/approve', admin, boardingController.approveBoardingReport);
router.put('/reports/:id/unapprove', admin, boardingController.unapproveBoardingReport);
router.post('/reports/:id/comment', protect, boardingController.addBoardingReportComment);

// Analytics
router.get('/analytics', boardingController.getBoardingAnalytics);

// Notifications
router.post('/notifications', boardingController.addHostelNotification);
router.get('/notifications', boardingController.getHostelNotifications);

router.get('/house-parents', boardingController.getHouseParents);

module.exports = router;
