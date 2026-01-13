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
        if (req.user && req.user.schoolId) {
             folder = `GT_SchoolHub/${req.user.schoolId}/videos`;
        }

        return {
            folder: folder,
            resource_type: 'auto', // auto detects image or video
            allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi', 'mkv'],
            // public_id: '...', // Use default random string
        };
    },
});

// Check file type (Double check, though Cloudinary allowed_formats handles extension)
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png|mp4|mov|avi|wmv|mkv/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(file.originalname.toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Error: Invalid File Type!'));
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
