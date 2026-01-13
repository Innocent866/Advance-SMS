const School = require('../models/School');
const User = require('../models/User');

// @desc    Get school details (for dashboard)
// @route   GET /api/schools/my-school
// @access  Private (Admin)
const getMySchool = async (req, res) => {
    try {
        const school = await School.findById(req.user.schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update school details
// @route   PUT /api/schools/my-school
// @access  Private (Admin)
const updateSchool = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Parse JSON fields if they come as strings (Multipart/form-data quirk)
        if (typeof updateData.branding === 'string') {
            try { updateData.branding = JSON.parse(updateData.branding); } catch (e) {}
        }
        if (typeof updateData.preferences === 'string') {
            try { updateData.preferences = JSON.parse(updateData.preferences); } catch (e) {}
        }
        if (typeof updateData.notificationPreferences === 'string') {
            try { updateData.notificationPreferences = JSON.parse(updateData.notificationPreferences); } catch (e) {}
        }

        if (req.file) {
            updateData.logoUrl = req.file.path; // Cloudinary URL
            
            // Update School Usage
            await School.findByIdAndUpdate(req.user.schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        const school = await School.findByIdAndUpdate(req.user.schoolId, updateData, { new: true });
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMySchool,
    updateSchool,
};
