const Teacher = require('../models/Teacher');
const User = require('../models/User');
const School = require('../models/School'); // Import School model
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notification.controller');

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private (School Admin)
const createTeacher = async (req, res) => {
    let { firstName, lastName, email, password, gender, qualification, phoneNumber, subjects, classification } = req.body;

    // Handle subjects from FormData (empty string or JSON string)
    if (typeof subjects === 'string') {
        if (subjects === '' || subjects === '[]') {
            subjects = [];
        } else {
            try {
                subjects = JSON.parse(subjects);
            } catch (e) {
                subjects = [];
            }
        }
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        
        const finalPassword = password || school.defaultTeacherPassword || 'teacher123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

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

        // Notify Admin
        await createNotification(
            req.user._id,
            `New Teacher Added: ${firstName} ${lastName}`,
            'success'
        );

    } catch (error) {
        console.error('Create Teacher Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }
        res.status(500).json({ message: error.message || 'Server error creating teacher' });
    }
};

// @desc    Get all teachers for the school
// @route   GET /api/teachers
// @access  Private (School Admin)
const getTeachers = async (req, res) => {
    try {
        // Fetch from Teacher collection to get full details
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const teachers = await Teacher.find({ schoolId }).populate('subjects', 'name');
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

// @desc    Update teacher details
// @route   PUT /api/teachers/:id
// @access  Private (School Admin)
const updateTeacher = async (req, res) => {
    try {
        let teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Verify school ownership
        const userSchoolIdRaw = req.user.schoolId;
        const userSchoolId = userSchoolIdRaw?._id ? userSchoolIdRaw._id.toString() : userSchoolIdRaw.toString();
        const teacherSchoolId = teacher.schoolId.toString();

        if (req.user.role !== 'super_admin' && teacherSchoolId !== userSchoolId) {
             return res.status(401).json({ message: 'Not authorized to update this teacher' });
        }

        // Update fields if provided
        if (req.file) {
            teacher.profilePicture = req.file.path; // Cloudinary URL
            
            // Update School Usage (Optimistic: +1 upload, +size)
            await School.findByIdAndUpdate(userSchoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        if (req.body.firstName) teacher.firstName = req.body.firstName;
        if (req.body.lastName) teacher.lastName = req.body.lastName;
        if (req.body.email) teacher.email = req.body.email;
        if (req.body.phoneNumber) teacher.phoneNumber = req.body.phoneNumber;
        if (req.body.qualification) teacher.qualification = req.body.qualification;
        if (req.body.gender) teacher.gender = req.body.gender;

        // Handle subjects update with sanitization
        if (req.body.subjects !== undefined) {
            let subjects = req.body.subjects;
            if (typeof subjects === 'string') {
                if (subjects === '' || subjects === '[]') {
                    subjects = [];
                } else {
                    try {
                        subjects = JSON.parse(subjects);
                    } catch (e) {
                        subjects = [];
                    }
                }
            }
            teacher.subjects = subjects;
        }
        
        // Also update the linked User account if name/email/password changed
        if (req.body.firstName || req.body.lastName || req.body.email || req.body.password) {
            const user = await User.findById(teacher.userId);
            if (user) {
                if (req.body.firstName || req.body.lastName) {
                    user.name = `${req.body.firstName || teacher.firstName} ${req.body.lastName || teacher.lastName}`;
                }
                if (req.body.email) user.email = req.body.email;
                if (req.body.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.passwordHash = await bcrypt.hash(req.body.password, salt);
                }
                await user.save();
            }
        }

        await teacher.save();

        res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (School Admin)
const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Verify school ownership
        const userSchoolIdRaw = req.user.schoolId;
        const userSchoolId = userSchoolIdRaw?._id ? userSchoolIdRaw._id.toString() : userSchoolIdRaw.toString();
        const teacherSchoolId = teacher.schoolId.toString();

        if (req.user.role !== 'super_admin' && teacherSchoolId !== userSchoolId) {
             return res.status(401).json({ message: 'Not authorized to delete this teacher' });
        }

        // Delete linked User account
        if (teacher.userId) {
            await User.findByIdAndDelete(teacher.userId);
        }

        await Teacher.deleteOne({ _id: teacher._id });

        res.json({ message: 'Teacher removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createTeacher,
    getTeachers,
    getTeacherById,
    getMyProfile,
    updateTeacher,
    deleteTeacher
};
