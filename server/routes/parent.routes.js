const express = require('express');
const router = express.Router();
const { 
    registerParent, 
    getParentDashboard, 
    getChildProfile,
    getChildVideos,
    getChildResults,
    getChildHistory,
    getChildMaterials
} = require('../controllers/parent.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Public: Register via Invite
router.post('/register', registerParent);

// Private: Parent Dashboard
router.get('/dashboard', protect, authorize('parent'), getParentDashboard);
router.get('/child-profile', protect, authorize('parent'), getChildProfile);
router.get('/child-videos', protect, authorize('parent'), getChildVideos);
router.get('/child-results', protect, authorize('parent'), getChildResults);
router.get('/child-history', protect, authorize('parent'), getChildHistory);
router.get('/child-materials', protect, authorize('parent'), getChildMaterials);

module.exports = router;
