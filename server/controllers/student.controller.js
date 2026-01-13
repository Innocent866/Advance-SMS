const Student = require('../models/Student');
const User = require('../models/User');
const School = require('../models/School'); // Import School model
const bcrypt = require('bcryptjs');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (School Admin)
const createStudent = async (req, res) => {
    const { firstName, lastName, email, password, gender, studentId, level, classId } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if studentId already exists in this school
        const studentExists = await Student.findOne({ schoolId: req.user.schoolId._id || req.user.schoolId, studentId });
        if (studentExists) {
            return res.status(400).json({ message: 'Student ID already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'student',
            classId
        });

        // 2. Create Student Profile
        const student = await Student.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            userId: user._id,
            firstName,
            lastName,
            email,
            gender,
            profilePicture: req.file ? req.file.path : null, // Cloudinary URL
            studentId,
            level,
            classId,
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
            _id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            role: 'student',
            classId: student.classId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all students for the school
// @route   GET /api/students
// @access  Private (School Admin/Teacher)
const getStudents = async (req, res) => {
    try {
        const students = await Student.find({ schoolId: req.user.schoolId })
            .populate('classId', 'name');
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get students for a teacher's assigned classes
// @route   GET /api/students/my-students
// @access  Private (Teacher)
const getTeacherStudents = async (req, res) => {
    try {
        // 1. Get Teacher's assigned classes
        const teacher = await User.findById(req.user.id);
        if (!teacher.subjects || teacher.subjects.length === 0) {
            return res.json([]); // No classes assigned
        }

        const classIds = teacher.subjects.map(s => s.classId);

        // 2. Find students in these classes
        const students = await User.find({
            schoolId: req.user.schoolId,
            role: 'student',
            classId: { $in: classIds }
        })
        .populate('classId', 'name')
        .select('-passwordHash');

        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get current student profile
// @route   GET /api/students/me
// @access  Private (Student)
const getMyProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('classId', 'name')
            .populate('subjects', 'name code');
        
        if (!student) {
            return res.status(404).json({ message: 'Profile not found' });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get student by ID
// @route   GET /api/students/:id
// @access  Private (School Admin)
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id)
            .populate('classId', 'name')
            .populate('subjects', 'name code');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Verify school ownership
        if (student.schoolId.toString() !== req.user.schoolId.toString()) {
             return res.status(401).json({ message: 'Not authorized' });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createStudent,
    getStudents,
    getTeacherStudents,
    getMyProfile,
    getStudentById
};
