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
        let query = { schoolId: req.user.schoolId._id || req.user.schoolId };

        // If user is a teacher, restrict to their assigned classes
        if (req.user.role === 'teacher') {
            const teacherProfile = await require('../models/Teacher').findOne({ userId: req.user._id });
            if (teacherProfile) {
                 let classIds = [];
                if (teacherProfile.teachingAssignments) {
                    classIds = teacherProfile.teachingAssignments.map(a => a.classId);
                }
                if (teacherProfile.classes) {
                    classIds = [...classIds, ...teacherProfile.classes];
                }
                // Unique IDs
                classIds = [...new Set(classIds)];
                
                if (classIds.length > 0) {
                    query.classId = { $in: classIds };
                } else {
                    return res.json([]); // Teacher has no classes assigned
                }
            } else {
                return res.json([]); // Teacher profile not found
            }
        }

        const students = await Student.find(query)
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
        // 1. Get Teacher's assigned classes from Teacher Profile
        const teacherProfile = await require('../models/Teacher').findOne({ userId: req.user._id });
        if (!teacherProfile || !teacherProfile.subjects || teacherProfile.subjects.length === 0) {
            // Check teachingAssignments as well?
             if (!teacherProfile.teachingAssignments || teacherProfile.teachingAssignments.length === 0) {
                 return res.json([]); 
             }
        }

        // Collect Class IDs from assignments (more accurate) or subjects
        let classIds = [];
        if (teacherProfile.teachingAssignments) {
            classIds = teacherProfile.teachingAssignments.map(a => a.classId);
        } else if (teacherProfile.classes) {
            classIds = teacherProfile.classes;
        }

        // Fallback or unique
        classIds = [...new Set(classIds)];

        // 2. Find students in these classes
        // 2. Find students in these classes (Query Student model for profile info)
        const students = await Student.find({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            classId: { $in: classIds }
        })
        .populate('classId', 'name')
        .select('firstName lastName email profilePicture classId studentId');

        // Transform to match expected frontend structure if needed (frontend expects name, but Student has firstName/lastName)
        // Or updated frontend to use firstName/lastName? MyStudents.jsx uses student.name.
        // Let's map it.
        
        const studentsWithFullName = students.map(s => ({
            _id: s._id,
            name: `${s.firstName} ${s.lastName}`,
            email: s.email,
            profilePicture: s.profilePicture,
            classId: s.classId,
            studentId: s.studentId
        }));

        res.json(studentsWithFullName);
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

        // Verify school ownership (Robust Check)
        // Handle fully populated school object vs raw ID string
        const userSchoolIdRaw = req.user.schoolId;
        const userSchoolId = userSchoolIdRaw?._id ? userSchoolIdRaw._id.toString() : userSchoolIdRaw.toString();
        const studentSchoolId = student.schoolId.toString();

        // Bypass for Super Admin
        if (req.user.role === 'super_admin') {
            return res.json(student);
        }

        if (studentSchoolId !== userSchoolId) {
             return res.status(401).json({ 
                 message: `Permission Denied. Please contact support if you believe this is an error.` 
             });
        }

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student details (Profile Picture etc)
// @route   PUT /api/students/:id
// @access  Private (School Admin)
const updateStudent = async (req, res) => {
    try {
        let student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Verify school ownership
        const userSchoolIdRaw = req.user.schoolId;
        const userSchoolId = userSchoolIdRaw?._id ? userSchoolIdRaw._id.toString() : userSchoolIdRaw.toString();
        const studentSchoolId = student.schoolId.toString();

        if (req.user.role !== 'super_admin' && studentSchoolId !== userSchoolId) {
             return res.status(401).json({ message: 'Not authorized to update this student' });
        }

        // Update fields if provided
        if (req.file) {
            student.profilePicture = req.file.path; // Cloudinary URL
            
            // Update School Usage (Optimistic: +1 upload, +size)
            await School.findByIdAndUpdate(userSchoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        // Add other fields updates here if needed in future
        // if (req.body.firstName) student.firstName = req.body.firstName;

        await student.save();

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
    getStudentById,
    updateStudent
};
