const express = require('express');
const router = express.Router();
const fileController = require('../controllers/file.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

router.post('/', upload.single('file'), fileController.uploadFile);
router.get('/', fileController.getFiles);
router.delete('/:id', fileController.deleteFile);

module.exports = router;
