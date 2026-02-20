const express = require('express');
const router = express.Router();
const { 
    createNurse, 
    getNurses, 
    getNurseById, 
    updateNurse, 
    deleteNurse,
    getMyProfile 
} = require('../controllers/nurse.controller');
const { protect, admin, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { checkResourceLimit } = require('../middleware/subscription.middleware');

router.route('/')
    .post(protect, admin, checkResourceLimit('Nurse'), upload.single('profilePicture'), createNurse)
    .get(protect, admin, getNurses);

router.get('/me', protect, authorize('nurse'), getMyProfile);
router.get('/:id', protect, admin, getNurseById);
router.put('/:id', protect, admin, upload.single('profilePicture'), updateNurse);
router.delete('/:id', protect, admin, deleteNurse);

module.exports = router;
