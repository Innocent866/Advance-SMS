const Teacher = require('../models/Teacher');
const User = require('../models/User');
const School = require('../models/School'); // Import School model
const bcrypt = require('bcryptjs');

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private (School Admin)
const createTeacher = async (req, res) => {
    const { firstName, lastName, email, password, gender, qualification, phoneNumber, subjects, classification } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'teacher',
            subjects // Keep for simple auth/access check if needed, or rely on Teacher model
        });

        // 2. Create Teacher Profile
        const teacher = await Teacher.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            userId: user._id,
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            profilePicture: req.file ? req.file.path : null, // Cloudinary URL
            qualification,
            subjects,
            status: 'active'
        });

        // Update School Usage
        if (req.file) {
            await School.findByIdAndUpdate(req.user.schoolId._id || req.user.schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        res.status(201).json({
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            role: 'teacher'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all teachers for the school
// @route   GET /api/teachers
// @access  Private (School Admin)
const getTeachers = async (req, res) => {
    try {
        // Fetch from Teacher collection to get full details
        const teachers = await Teacher.find({ schoolId: req.user.schoolId }).populate('subjects', 'name');
        res.json(teachers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Private (School Admin)
const getTeacherById = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id)
            .populate('subjects', 'name code')
            .populate('classes', 'name')
            .populate('teachingAssignments.subjectId', 'name code')
            .populate('teachingAssignments.classId', 'name');
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Verify school ownership (Skip for Super Admin)
        if (req.user.role !== 'super_admin') {
            const userSchoolId = req.user.schoolId._id ? req.user.schoolId._id.toString() : req.user.schoolId.toString();
            if (teacher.schoolId.toString() !== userSchoolId) {
                 return res.status(401).json({ message: 'Not authorized' });
            }
        }

        res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current teacher profile
// @route   GET /api/teachers/me
// @access  Private (Teacher)
const getMyProfile = async (req, res) => {
    try {
        const teacher = await Teacher.findOne({ userId: req.user._id })
            .populate('subjects', 'name code')
            .populate('teachingAssignments.subjectId', 'name code')
            .populate('teachingAssignments.classId', 'name');
        
        if (!teacher) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById,
    getMyProfile
};
