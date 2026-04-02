const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staff.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);
router.use(authorize('school_admin', 'super_admin'));

router.route('/unified')
    .get(staffController.getUnifiedStaff);

router.route('/')
    .get(staffController.getStaff)
    .post(upload.single('profilePicture'), staffController.createStaff);

router.route('/:id')
    .put(upload.single('profilePicture'), staffController.updateStaff)
    .delete(staffController.deleteStaff);

module.exports = router;
