const express = require('express');
const router = express.Router();
const hostelController = require('../controllers/hostel.controller');
const { protect, admin } = require('../middleware/auth.middleware');
const { checkFeature } = require('../middleware/feature.middleware');

router.use(protect);
router.use(checkFeature('boarding'));

// Hostel routes
router.post('/', admin, hostelController.createHostel);
router.get('/', hostelController.getAllHostels);
router.put('/:id', admin, hostelController.updateHostel);
router.delete('/:id', admin, hostelController.deleteHostel);

// Room routes
router.post('/rooms', admin, hostelController.addRoom);
router.get('/:hostelId/rooms', hostelController.getHostelRooms);
router.get('/:hostelId/students', hostelController.getHostelStudents);
router.put('/rooms/:id', admin, hostelController.updateRoom);
router.delete('/rooms/:id', admin, hostelController.deleteRoom);

module.exports = router;
