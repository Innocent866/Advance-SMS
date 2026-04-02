const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school_videos',
    resource_type: 'video', // Essential for video processing in Cloudinary
    allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    transformation: [
      { quality: 'auto', fetch_format: 'auto' }
    ]
  },
});

const videoUpload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB high-fidelity limit
  },
});

module.exports = videoUpload;
