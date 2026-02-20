const express = require('express');
const router = express.Router();
const { 
    createDoctor, 
    getDoctors, 
    getDoctorById, 
    updateDoctor, 
    deleteDoctor,
    getMyProfile 
} = require('../controllers/doctor.controller');
const { protect, admin, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { checkResourceLimit } = require('../middleware/subscription.middleware');

router.route('/')
    .post(protect, admin, checkResourceLimit('Doctor'), upload.single('profilePicture'), createDoctor)
    .get(protect, admin, getDoctors);

router.get('/me', protect, authorize('doctor'), getMyProfile);
router.get('/:id', protect, admin, getDoctorById);
router.put('/:id', protect, admin, upload.single('profilePicture'), updateDoctor);
router.delete('/:id', protect, admin, deleteDoctor);

module.exports = router;
