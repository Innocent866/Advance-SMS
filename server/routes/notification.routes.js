const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead 
} = require('../controllers/notification.controller');

router.get('/', protect, getUserNotifications);
router.put('/:id/read', protect, markAsRead);
router.put('/read-all', protect, markAllAsRead);

module.exports = router;
