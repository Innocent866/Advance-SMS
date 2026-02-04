const Parent = require('../models/Parent');
const Student = require('../models/Student');
const User = require('../models/User');
const VideoLesson = require('../models/VideoLesson');
const Result = require('../models/Result');
const FeePayment = require('../models/FeePayment'); // Previously used perhaps?
// Check if VideoProgress and QuizSubmission models exist or need to be inferred
const VideoProgress = require('../models/VideoProgress'); 
const QuizSubmission = require('../models/QuizSubmission');
const LearningMaterial = require('../models/LearningMaterial'); // Assuming this model exists
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT (Helper - duplicate from auth.controller, ideally shared)
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register Parent (via Invite)
// @route   POST /api/parents/register
// @access  Public
const registerParent = async (req, res) => {
    const { name, email, password, phone, studentId, schoolId } = req.body;

    try {
        // 1. Verify Student Exists
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // 2. Check if Student already has a parent
        const existingParentLink = await Parent.findOne({ student: studentId });
        if (existingParentLink) {
            return res.status(400).json({ message: 'This student is already linked to a parent.' });
        }

        // 3. Create User Account
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: 'parent',
            schoolId // Link to child's school
        });

        // 4. Create Parent Profile
        const parent = await Parent.create({
            user: user._id,
            student: studentId,
            school: schoolId,
            phone
        });

        // Optional: Update Student with parent details (redundant but requested in schema)
        student.parentName = name;
        student.parentEmail = email;
        student.parentPhone = phone;
        await student.save();

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: 'parent',
            token: generateToken(user._id)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Parent Dashboard Data (Child Profile & Stats)
// @route   GET /api/parents/dashboard
// @access  Private (Parent)
// @desc    Get Parent Dashboard Data (Child Profile & Stats)
// @route   GET /api/parents/dashboard
// @access  Private (Parent)
const getParentDashboard = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id })
            .populate({
                path: 'student',
                populate: { path: 'classId', select: 'name' }
            });

        if (!parent) return res.status(404).json({ message: 'Parent profile not found' });
        
        const student = await Student.findById(parent.student);
        if (!student) return res.status(404).json({ message: 'Student not found' });

        // 1. Attendance Calculation
        const Attendance = require('../models/Attendance');
        const attendanceRecords = await Attendance.find({
            'records.studentId': student._id
        });

        let totalDays = 0;
        let presentDays = 0;

        attendanceRecords.forEach(record => {
            const studentRecord = record.records.find(r => r.studentId.toString() === student._id.toString());
            if (studentRecord) {
                totalDays++;
                if (studentRecord.status === 'Present' || studentRecord.status === 'Late') {
                    presentDays++;
                }
            }
        });

        const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

        // 2. Video Progress (Using User ID)
        const videosWatchedCount = await VideoProgress.countDocuments({
            studentId: student.userId,
            completed: true
        });

        // 3. Quiz/Task Progress (Using User ID)
        const tasksCompletedCount = await QuizSubmission.countDocuments({
            studentId: student.userId
        });

        res.json({
            parent: { name: req.user.name, email: req.user.email, phone: parent.phone },
            student: parent.student,
            stats: {
                attendance: attendancePercentage,
                videosWatched: videosWatchedCount,
                tasksCompleted: tasksCompletedCount,
                totalAttendanceDays: totalDays
            }
        });
    } catch (error) {
        console.error("getParentDashboard Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Detailed Child Profile
// @route   GET /api/parents/child-profile
// @access  Private (Parent)
const getChildProfile = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id });
        if (!parent) return res.status(404).json({ message: 'Parent profile not found' });

        const student = await Student.findById(parent.student)
            .populate('classId', 'name')
            .populate('schoolId', 'name isVerified settings'); // Corrected from 'school' to 'schoolId', removed 'department'

        if (!student) return res.status(404).json({ message: 'Student not found' });

        res.json(student);
    } catch (error) {
        console.error("getChildProfile Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get Child's Videos
// @route   GET /api/parents/child-videos
// @access  Private (Parent)
const getChildVideos = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id });
        const student = await Student.findById(parent.student);

        // Logic similar to getVideos for student
        const videos = await VideoLesson.find({ 
            classLevelId: student.classId,
            schoolId: parent.school,
            status: 'Approved',
            isPublished: true
        })
        .populate('teacherId', 'name')
        .populate('subjectId', 'name')
        .sort({ createdAt: -1 });

        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Child's Results
// @route   GET /api/parents/child-results
// @access  Private (Parent)
const getChildResults = async (req, res) => {
    try {
        const { session, term } = req.query;
        const parent = await Parent.findOne({ user: req.user._id });

        const query = { studentId: parent.student };
        if (session) query.session = session;
        if (term) query.term = term;

        const results = await Result.find(query)
            .populate('subjectId', 'name code')
            .populate('classId', 'name');

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Child's Learning History
// @route   GET /api/parents/child-history
// @access  Private (Parent)
const getChildHistory = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id });
        const student = await Student.findById(parent.student); // Need Student doc to get User ID
        
        if (!student) {
             return res.status(404).json({ message: 'Student not found' });
        }

        const completedVideos = await VideoProgress.find({ 
            studentId: student.userId, // Use userId, not student ObjectId
            completed: true 
        }).populate({
            path: 'videoId',
            select: 'title subjectId',
            populate: { path: 'subjectId', select: 'name' }
        }).sort({ watchedAt: -1 });

        const submissions = await QuizSubmission.find({
            studentId: student.userId // Use userId
        }).populate('quizId', 'title').sort({ submittedAt: -1 });

        // Get Totals for Context
        const totalVideos = await VideoLesson.countDocuments({
            classLevelId: student.classId,
            schoolId: parent.school,
            status: 'Approved',
            isPublished: true
        });

        const allClassVideos = await VideoLesson.find({
             classLevelId: student.classId,
             isPublished: true
        }).select('_id');
        
        const allClassVideoIds = allClassVideos.map(v => v._id);
        
        // Count quizzes linked to these videos
        const totalQuizzes = await require('../models/Quiz').countDocuments({
             videoId: { $in: allClassVideoIds },
             isPublished: true
        });

        res.json({ 
            completedVideos, 
            submissions,
            stats: {
                totalVideos,
                totalQuizzes
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Child's Materials
// @route   GET /api/parents/child-materials
// @access  Private (Parent)
const getChildMaterials = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id });
        const student = await Student.findById(parent.student);

        const materials = await LearningMaterial.find({
            classId: student.classId,
            schoolId: parent.school,
            status: 'Approved'
        }).populate('teacherId', 'name');

        res.json(materials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerParent,
    getParentDashboard,
    getChildProfile,
    getChildVideos,
    getChildResults,
    getChildHistory,
    getChildMaterials
};
