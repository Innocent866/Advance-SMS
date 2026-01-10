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
        const school = await School.findByIdAndUpdate(req.user.schoolId, req.body, { new: true });
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
