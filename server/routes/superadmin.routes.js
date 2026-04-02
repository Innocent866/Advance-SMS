const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth.middleware');
// Need a specific super_admin middleware? 
// Current admin middleware checks: role === 'admin' || 'super_admin' || 'school_admin'
// We need STRICT super_admin.

const superAdminStrict = (req, res, next) => {
    console.log(`[SuperAdmin Access Attempt] Path: ${req.originalUrl}, Method: ${req.method}`);
    if (req.user) {
        console.log(`[SuperAdmin Access Attempt] User Role: ${req.user.role}`);
        if (req.user.role && req.user.role.toLowerCase() === 'super_admin') {
            return next();
        }
    }
    console.warn(`[SuperAdmin Access Denied] Path: ${req.originalUrl}, Method: ${req.method}, Role: ${req.user?.role}`);
    res.status(401).json({ message: 'Not authorized. Super Admin only.' });
};

const { 
    getSchools, verifySchool, getPlatformStats, getAllPayments,
    deleteSchool, updateSchoolSubscription, createSchool, updateSchoolDetails
} = require('../controllers/superadmin.controller');

router.get('/schools', protect, superAdminStrict, getSchools);
router.post('/schools', protect, superAdminStrict, createSchool);
router.put('/verify-school/:id', protect, superAdminStrict, verifySchool);
router.delete('/schools/:id', protect, superAdminStrict, deleteSchool);
router.put('/schools/:id/subscription', protect, superAdminStrict, updateSchoolSubscription);
router.put('/schools/:id/details', protect, superAdminStrict, updateSchoolDetails);

router.get('/stats', protect, superAdminStrict, getPlatformStats);
router.get('/payments', protect, superAdminStrict, getAllPayments);

module.exports = router;
