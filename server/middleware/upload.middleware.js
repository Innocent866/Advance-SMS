const multer = require('multer');

// Memory storage is used because we'll be uploading to Cloudinary via stream
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

module.exports = upload;
