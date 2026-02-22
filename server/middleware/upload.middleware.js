const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinary');

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Dynamic folder based on school/teacher (Requires req.user populated by auth middleware previously)
        // If auth middleware runs before upload, we have req.user.
        // If not, we use a generic 'uploads' folder.
        
        let folder = 'GT_SchoolHub/general';
        const isVideo = file.mimetype.startsWith('video');
        const subFolder = isVideo ? 'videos' : 'images';

        if (req.user && req.user.schoolId) {
             const schoolId = req.user.schoolId._id ? req.user.schoolId._id.toString() : req.user.schoolId.toString();
             folder = `GT_SchoolHub/${schoolId}/${subFolder}`;
        }

        return {
            folder: folder,
            resource_type: 'auto', // auto detects image or video
            allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp', 'mp4', 'mov', 'avi', 'mkv', 'pdf', 'docx', 'doc'],
            // public_id: '...', // Use default random string
        };
    },
});

// Check file type (Double check, though Cloudinary allowed_formats handles extension)
// Check file type (Double check, though Cloudinary allowed_formats handles extension)
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|jfif|jpe|png|gif|webp|svg|mp4|mov|avi|wmv|mkv|pdf|doc|docx|csv|xls|xlsx/;
    const extname = filetypes.test(file.originalname.toLowerCase());
    // Accept any standard image, video, or PDF MIME type
    const mimetype = file.mimetype.startsWith('image/') ||
                     file.mimetype.startsWith('video/') ||
                     file.mimetype === 'application/pdf' ||
                     file.mimetype === 'application/msword' ||
                     file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        const errorMsg = `Invalid File Type: ${file.originalname} (${file.mimetype}). Allowed: images, videos, documents.`;
        console.error(errorMsg);
        cb(new Error(errorMsg));
    }
}

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit (Should match Free plan max file size)
    fileFilter: function(req, file, cb) {
        checkFileType(file, cb);
    }
});

module.exports = upload;
