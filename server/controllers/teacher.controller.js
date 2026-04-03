const Teacher = require('../models/Teacher');
const User = require('../models/User');
const School = require('../models/School'); // Import School model
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notification.controller');

// @desc    Create a new teacher
// @route   POST /api/teachers
// @access  Private (School Admin)
const createTeacher = async (req, res) => {
    let { 
            firstName, lastName, email, password, gender, qualification, 
            phoneNumber, subjects, classification, departmentId, role,
            address, employmentType, dateOfJoining
        } = req.body;
    
    // Default to 'teacher' if no role provided or invalid role
    const validRoles = ['teacher', 'hostel_warden', 'house_parent', 'assistant_admin', 'school_admin'];
    const finalRole = (role && validRoles.includes(role)) ? role : 'teacher';

    // Handle subjects from FormData (JSON string or array already)
    if (typeof subjects === 'string') {
        if (!subjects || subjects === '' || subjects === '[]') {
            subjects = [];
        } else {
            try {
                subjects = JSON.parse(subjects);
            } catch (e) {
                // If it's a comma separated string (fallback)
                subjects = subjects.split(',').filter(id => id.trim() !== '');
            }
        }
    } else if (!Array.isArray(subjects)) {
        subjects = [];
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
            role: finalRole
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
            departmentId: departmentId || null,
            status: 'active',
            address,
            employmentType,
            dateOfJoining
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
            role: finalRole
        });

        // Notify Admin
        await createNotification(
            req.user._id,
            `New Staff Added: ${firstName} ${lastName} (${finalRole})`,
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
        // Fetch from Teacher collection and get roles from User collection
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const teachers = await Teacher.find({ schoolId })
            .populate('subjects', 'name')
            .populate('userId', 'role')
            .sort({ createdAt: -1 });
            
        // Map role from user to teacher object and filter out admins
        const staffWithRoles = teachers
            .map(t => ({
                ...t.toObject(),
                role: t.userId?.role || 'teacher'
            }))
            .filter(staff => !['school_admin', 'assistant_admin', 'super_admin'].includes(staff.role));
        
        res.json(staffWithRoles);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all administrative staff for the school
// @route   GET /api/teachers/staff/admins
// @access  Private (School Admin)
const getAdmins = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const staff = await Teacher.find({ schoolId })
            .populate('userId', 'role')
            .sort({ createdAt: -1 });
            
        const admins = staff
            .map(t => ({
                ...t.toObject(),
                role: t.userId?.role || 'teacher'
            }))
            .filter(staff => ['school_admin', 'assistant_admin'].includes(staff.role));
        
        res.json(admins);
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

        let { 
            firstName, lastName, email, gender, qualification, phoneNumber, subjects, 
            departmentId, role, 
            address, employmentType, dateOfJoining 
        } = req.body;

        if (firstName) teacher.firstName = firstName;
        if (lastName) teacher.lastName = lastName;
        if (email) teacher.email = email;
        if (phoneNumber) teacher.phoneNumber = phoneNumber;
        if (qualification) teacher.qualification = qualification;
        if (gender) teacher.gender = gender;
        if (address) teacher.address = address;
        if (employmentType) teacher.employmentType = employmentType;
        if (dateOfJoining) teacher.dateOfJoining = dateOfJoining;

        // Handle subjects update with sanitization
        if (subjects !== undefined) {
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

        if (req.body.departmentId !== undefined) {
            teacher.departmentId = req.body.departmentId || null;
        }
        
        // Also update the linked User account if name/email/password/role changed
        if (req.body.firstName || req.body.lastName || req.body.email || req.body.password || req.body.role) {
            const user = await User.findById(teacher.userId);
            if (user) {
                if (req.body.firstName || req.body.lastName) {
                    user.name = `${req.body.firstName || teacher.firstName} ${req.body.lastName || teacher.lastName}`;
                }
                if (req.body.email) user.email = req.body.email;
                if (req.body.role) user.role = req.body.role;
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
    getAdmins,
    getTeacherById,
    getMyProfile,
    updateTeacher,
    deleteTeacher
};
