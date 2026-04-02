const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');
const File = require('../models/File');

/**
 * Map mimetype to Cloudinary resource_type and custom resourceType label
 */
const getCloudinaryResourceType = (mimetype) => {
    if (mimetype.startsWith('image/')) return { cloudinaryType: 'image', label: 'images' };
    if (mimetype.startsWith('video/')) return { cloudinaryType: 'video', label: 'videos' };
    return { cloudinaryType: 'raw', label: 'documents' };
};

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { buffer, originalname, mimetype, size } = req.file;
    const { title } = req.body;
    const { cloudinaryType, label } = getCloudinaryResourceType(mimetype);

    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'school_management_system/files',
            resource_type: cloudinaryType,
            // public_id should not include extension as per requirements
            public_id: `file_${Date.now()}_${originalname.split('.')[0].replace(/\s+/g, '_')}`,
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        Readable.from(buffer).pipe(stream);
      });
    };

    const result = await uploadStream();

    // Create File record in database
    const newFile = await File.create({
        title: title || originalname,
        originalName: originalname,
        public_id: result.public_id,
        url: result.secure_url,
        mimeType: mimetype,
        resourceType: label,
        size: size,
        uploadedBy: req.user._id,
        schoolId: req.user.schoolId._id || req.user.schoolId
    });

    res.status(201).json({
      message: 'File uploaded successfully',
      file: newFile
    });
  } catch (error) {
    console.error('Error in uploadFile:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
};

const getFiles = async (req, res) => {
    try {
        const query = { schoolId: req.user.schoolId._id || req.user.schoolId };
        
        // Optional filters
        if (req.query.resourceType) {
            query.resourceType = req.query.resourceType;
        }

        const files = await File.find(query)
            .sort({ createdAt: -1 })
            .populate('uploadedBy', 'name email');

        res.status(200).json(files);
    } catch (error) {
        console.error('Error in getFiles:', error);
        res.status(500).json({ message: 'Error fetching files', error: error.message });
    }
};

const deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const file = await File.findOne({
        _id: id,
        schoolId: req.user.schoolId._id || req.user.schoolId
    });

    if (!file) {
        return res.status(404).json({ message: 'File not found or unauthorized' });
    }

    // Determine cloudinary resource type for deletion
    let resource_type = 'raw';
    if (file.mimeType.startsWith('image/')) resource_type = 'image';
    else if (file.mimeType.startsWith('video/')) resource_type = 'video';

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(file.public_id, { resource_type });

    // Delete from Database
    await file.deleteOne();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Error in deleteFile:', error);
    res.status(500).json({ message: 'Error deleting file', error: error.message });
  }
};

module.exports = {
  uploadFile,
  getFiles,
  deleteFile,
};
