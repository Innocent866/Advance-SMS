const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload.middleware');
const { 
    createVideo, 
    getVideos, 
    getVideoById, 
    updateVideo, 
    deleteVideo, 
    getVideoStats 
} = require('../controllers/video.controller');
const { protect, teacher } = require('../middleware/auth.middleware');
const { checkSubscription } = require('../middleware/subscription.middleware');
const { checkQuota } = require('../middleware/quota.middleware');

router.post('/', protect, teacher, checkSubscription, checkQuota, upload.single('video'), createVideo);
router.get('/', protect, checkSubscription, getVideos);

router.get('/:id', protect, getVideoById);
router.put('/:id', protect, teacher, checkSubscription, updateVideo);
router.delete('/:id', protect, teacher, checkSubscription, deleteVideo);

router.get('/:id/stats', protect, teacher, getVideoStats);

module.exports = router;

