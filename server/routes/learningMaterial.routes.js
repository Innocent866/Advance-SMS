const express = require('express');
const router = express.Router();
const learningMaterialController = require('../controllers/learningMaterial.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public / Student Routes (Protected by login)
router.get('/', protect, learningMaterialController.getMaterials);
router.post('/:id/download', protect, learningMaterialController.incrementDownload);

// Teacher Routes
router.post('/', protect, learningMaterialController.createMaterial);
router.get('/my-materials', protect, learningMaterialController.getMyMaterials);
router.put('/:id', protect, learningMaterialController.updateMaterial);

// Admin Routes
router.put('/:id/status', protect, admin, learningMaterialController.updateStatus);

// Shared Delete (Owner or Admin)
router.delete('/:id', protect, learningMaterialController.deleteMaterial);

module.exports = router;
