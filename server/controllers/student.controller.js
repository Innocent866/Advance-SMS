const Student = require('../models/Student');
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const VideoLesson = require('../models/VideoLesson');
const Quiz = require('../models/Quiz');
const LearningMaterial = require('../models/LearningMaterial');
const { createNotification } = require('./notification.controller');
const crypto = require('crypto');
const StudentUploadSession = require('../models/StudentUploadSession');
const ClassLevel = require('../models/ClassLevel');
const PromotionRecord = require('../models/PromotionRecord');
const AcademicSession = require('../models/AcademicSession');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (School Admin)
const createStudent = async (req, res) => {
    const { firstName, lastName, email, password, gender, level, classId, arm, enrollmentStatus } = req.body;

    try {
        // 2. Auto-Generate Student ID (Format: SCHOOL-YEAR-001)
        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        let schoolAbbr = 'SCH';
        if (school && school.name) {
             // Get first 2-3 letters of first word or initials
             const nameParts = school.name.split(' ');
             if (nameParts.length > 1) {
                 schoolAbbr = nameParts.map(p => p[0]).join('').toUpperCase().substring(0, 3);
             } else {
                 schoolAbbr = school.name.substring(0, 3).toUpperCase();
             }
        }

        const year = new Date().getFullYear();
        const baseId = `${schoolAbbr}-${year}`; // e.g., GT-2026
        
        // Find last student with this base ID
        const lastStudent = await Student.findOne({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            studentId: { $regex: `^${baseId}` }
        }).sort({ studentId: -1 });

        let nextSeq = 1;
        if (lastStudent && lastStudent.studentId) {
            const parts = lastStudent.studentId.split('-');
            const lastSeqObj = parts[parts.length - 1]; // Get last part
            if (!isNaN(lastSeqObj)) {
                nextSeq = parseInt(lastSeqObj) + 1;
            }
        }

        const studentId = `${baseId}-${String(nextSeq).padStart(3, '0')}`;
        console.log('Generated Student ID:', studentId);

        // Check availability (just in case of race condition, though rare in low volume)
        // If race condition is a concern, we'd need a counter collection, but regex find is okay for now.

        // 1b. Determine Password
        const finalPassword = password || school.defaultStudentPassword || 'student123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'student',
            classId
        });

        // 2. Fetch Class Details for Auto-Subject Assignment
        const ClassLevel = require('../models/ClassLevel'); // Dynamic require to avoid circular dependency if any? Or just normal import.
        // Ideally should be top level, but let's check if imported. Not in view.
        // Assuming lines 1-7 don't have it.
        // Let's rely on mongoose model lookup or assume I add import.
        
        const classLevelDoc = await ClassLevel.findById(classId);
        let assignedSubjects = [];
        
        if (classLevelDoc) {
            // General Subjects
            assignedSubjects = [...(classLevelDoc.subjects || [])];

            // Arm Specific Subjects
            if (arm) {
                 const armData = classLevelDoc.arms.find(a => a.name === arm);
                 if (armData && armData.subjects) {
                     assignedSubjects = [...assignedSubjects, ...armData.subjects];
                 }
            }
        }

        // 3. Create Student Profile
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
            arm, // Add arm
            subjects: assignedSubjects, // Auto-assigned
            enrollmentStatus: enrollmentStatus || 'Day',
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

        // Notify Admin
        await createNotification(
            req.user._id,
            `New Student Added: ${firstName} ${lastName}`,
            'success'
        );

    } catch (error) {
        console.error('Create Student Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'A user with this email or ID already exists.' });
        }
        res.status(500).json({ message: error.message || 'Server error creating student' });
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
            .populate('classId', 'name')
            .populate('hostelId', 'name')
            .populate('roomId', 'roomNumber');
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

        // 2. Find students in these classes (Query matches Class AND Arm if specified)
        // Construct detailed query criteria
        let criteria = [];

        if (teacherProfile.teachingAssignments && teacherProfile.teachingAssignments.length > 0) {
            teacherProfile.teachingAssignments.forEach(assign => {
                if (assign.classId) {
                    if (assign.arm) {
                        // Teacher is restricted to this specific arm
                        criteria.push({ classId: assign.classId, arm: assign.arm });
                    } else {
                        // Teacher has access to the entire class (all arms)
                        criteria.push({ classId: assign.classId });
                    }
                }
            });
        } else if (teacherProfile.classes && teacherProfile.classes.length > 0) {
            // Fallback: Teacher has access to these classes (all arms)
            teacherProfile.classes.forEach(cId => {
                criteria.push({ classId: cId });
            });
        }

        if (criteria.length === 0) {
            return res.json([]);
        }

        const students = await Student.find({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            $or: criteria
        })
        .populate('classId', 'name')
        .populate('hostelId', 'name')
        .populate('roomId', 'roomNumber')
        .select('firstName lastName email profilePicture classId studentId arm isBoarder hostelId roomId');

        // Transform to match expected frontend structure if needed (frontend expects name, but Student has firstName/lastName)
        // Or updated frontend to use firstName/lastName? MyStudents.jsx uses student.name.
        // Let's map it.
        
        const studentsWithFullName = students.map(s => ({
            _id: s._id,
            name: `${s.firstName} ${s.lastName}`,
            email: s.email,
            profilePicture: s.profilePicture,
            classId: s.classId,
            studentId: s.studentId,
            arm: s.arm
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
            .populate('hostelId', 'name')
            .populate('roomId', 'roomNumber')
            .populate('subjects', 'name code')
            .populate('videosWatched.videoId', 'title topic'); 
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Verify school ownership (Robust Check)
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

        // --- Calculate Video Progress ---
        // 1. Get all published videos for this student's class
        const allClassVideos = await VideoLesson.find({ 
            classLevelId: student.classId._id || student.classId,
            isPublished: true 
        }).select('title topic _id duration subjectId');

        // 2. Separate Taken (Watched) vs Not Taken
        // student.videosWatched contains entries with videoId (populated or ref)
        const watchedVideoIds = student.videosWatched.map(v => v.videoId?._id?.toString() || v.videoId?.toString());
        
        const takenVideos = [];
        const notTakenVideos = [];

        allClassVideos.forEach(video => {
            if (watchedVideoIds.includes(video._id.toString())) {
                // Find completion details if needed
                const watchEntry = student.videosWatched.find(w => (w.videoId?._id?.toString() || w.videoId?.toString()) === video._id.toString());
                takenVideos.push({
                    ...video.toObject(),
                    watchedAt: watchEntry?.watchedAt
                });
            } else {
                notTakenVideos.push(video);
            }
        });

        // --- Calculate Quiz Progress ---
        // 1. Get all published quizzes linked to these class videos
        const allClassVideoIds = allClassVideos.map(v => v._id);
        const allClassQuizzes = await Quiz.find({
            videoId: { $in: allClassVideoIds },
            isPublished: true
        }).populate('videoId', 'title');

        // 2. Separate Taken (Completed) vs Not Taken
        const completedQuizIds = student.tasksCompleted.map(t => t.taskId?.toString()); // taskId refs Quiz

        const takenQuizzes = [];
        const notTakenQuizzes = [];

        allClassQuizzes.forEach(quiz => {
            if (completedQuizIds.includes(quiz._id.toString())) {
                const taskEntry = student.tasksCompleted.find(t => t.taskId?.toString() === quiz._id.toString());
                takenQuizzes.push({
                    ...quiz.toObject(),
                    score: taskEntry?.score,
                    submittedAt: taskEntry?.submittedAt
                });
            } else {
                notTakenQuizzes.push(quiz);
            }
        });

        // --- Fetch Assignments and Learning Materials ---
        const materials = await LearningMaterial.find({
            schoolId: student.schoolId,
            status: 'Approved',
            classLevel: student.classId.name, // Assuming classLevel Name matches
            $or: [
                { arm: student.arm },
                { arm: null },
                { arm: '' }
            ]
        }).sort({ createdAt: -1 });

        const assignments = materials.filter(m => m.type === 'Assignment');
        const learningMaterials = materials.filter(m => m.type !== 'Assignment');

        const studentData = student.toObject();

        // Fetch Parent Details
        const Parent = require('../models/Parent');
        const parent = await Parent.findOne({ student: student._id })
            .populate('user', 'name email');
        
        if (parent) {
            studentData.parent = {
                name: parent.user?.name,
                email: parent.user?.email,
                phone: parent.phone,
                address: parent.address
            };
        }

        studentData.assignments = assignments;
        studentData.learningMaterials = learningMaterials;
        studentData.videoProgress = {
            taken: takenVideos,
            notTaken: notTakenVideos,
            totalAssigned: allClassVideos.length,
            completionRate: allClassVideos.length > 0 ? Math.round((takenVideos.length / allClassVideos.length) * 100) : 0
        };
    studentData.quizProgress = {
            taken: takenQuizzes,
            notTaken: notTakenQuizzes,
            totalAssigned: allClassQuizzes.length,
            completionRate: allClassQuizzes.length > 0 ? Math.round((takenQuizzes.length / allClassQuizzes.length) * 100) : 0
        };

        // Fetch Promotion History
        const PromotionRecord = require('../models/PromotionRecord');
        const history = await PromotionRecord.find({ studentId: student._id })
            .populate('fromClassId', 'name')
            .populate('toClassId', 'name')
            .populate('promotedBy', 'name')
            .sort({ date: -1 });
        
        studentData.promotionHistory = history;

        res.json(studentData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update student details (Profile Picture, Name, etc)
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

        if (req.body.firstName) student.firstName = req.body.firstName;
        if (req.body.lastName) student.lastName = req.body.lastName;
        if (req.body.email) student.email = req.body.email;
        if (req.body.gender) student.gender = req.body.gender;
        if (req.body.level) student.level = req.body.level;
        if (req.body.classId) student.classId = req.body.classId;
        if (req.body.arm) student.arm = req.body.arm;
        if (req.body.enrollmentStatus) student.enrollmentStatus = req.body.enrollmentStatus;

        // Also update the linked User account if name/email/password changed
        if (req.body.firstName || req.body.lastName || req.body.email || req.body.password) {
            const user = await User.findById(student.userId);
            if (user) {
                if (req.body.firstName || req.body.lastName) {
                    user.name = `${req.body.firstName || student.firstName} ${req.body.lastName || student.lastName}`;
                }
                if (req.body.email) user.email = req.body.email;
                if (req.body.password) {
                    const salt = await bcrypt.genSalt(10);
                    user.passwordHash = await bcrypt.hash(req.body.password, salt);
                }
                await user.save();
            }
        }

        await student.save();

        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private (School Admin)
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Verify school ownership
        const userSchoolIdRaw = req.user.schoolId;
        const userSchoolId = userSchoolIdRaw?._id ? userSchoolIdRaw._id.toString() : userSchoolIdRaw.toString();
        const studentSchoolId = student.schoolId.toString();

        if (req.user.role !== 'super_admin' && studentSchoolId !== userSchoolId) {
             return res.status(401).json({ message: 'Not authorized to delete this student' });
        }

        // Delete linked User account
        if (student.userId) {
            await User.findByIdAndDelete(student.userId);
        }

        await Student.deleteOne({ _id: student._id });

        res.json({ message: 'Student removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Generate a student self-upload link
// @route   POST /api/students/generate-upload-link
// @access  Private (Admin)
const generateUploadLink = async (req, res) => {
    const { classId, arm } = req.body;
    try {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

        const session = await StudentUploadSession.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            classId,
            arm,
            token,
            expiresAt,
            createdBy: req.user._id
        });

        // Populate classId for frontend display
        const populatedSession = await StudentUploadSession.findById(session._id).populate('classId', 'name');

        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const uploadLink = `${baseUrl}/bulk-upload-portal?token=${token}`;

        res.status(201).json({ uploadLink, session: populatedSession });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error generating upload link' });
    }
};

// @desc    Get active upload links for the school
// @route   GET /api/students/active-upload-links
// @access  Private (Admin)
const getActiveUploadLinks = async (req, res) => {
    try {
        const links = await StudentUploadSession.find({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            expiresAt: { $gt: new Date() }
        }).populate('classId', 'name');
        res.json(links);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching active links' });
    }
};

// @desc    Revoke an active upload link
// @route   POST /api/students/revoke-upload-session
// @access  Private (Admin)
const revokeUploadSession = async (req, res) => {
    const { sessionId } = req.body;
    try {
        await StudentUploadSession.findOneAndDelete({
            _id: sessionId,
            schoolId: req.user.schoolId._id || req.user.schoolId
        });
        res.json({ message: 'Session revoked successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error revoking session' });
    }
};

// @desc    Verify upload token (Public)
// @route   POST /api/students/verify-upload-token
// @access  Public
const verifyUploadToken = async (req, res) => {
    const { token } = req.body;
    try {
        const session = await StudentUploadSession.findOne({
            token,
            expiresAt: { $gt: new Date() }
        }).populate('classId', 'name');

        if (!session) {
            return res.status(404).json({ message: 'Invalid or expired upload link' });
        }

        res.json({
            context: {
                className: session.classId.name,
                arm: session.arm
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error verifying token' });
    }
};

// @desc    Bulk upload student (Public registration via link)
// @route   POST /api/students/bulk-upload
// @access  Public (needs valid token)
const bulkUpload = async (req, res) => {
    const { token, firstName, lastName, email, gender, enrollmentStatus } = req.body;
    try {
        const session = await StudentUploadSession.findOne({
            token,
            expiresAt: { $gt: new Date() }
        });

        if (!session) {
            return res.status(401).json({ message: 'Invalid or expired upload session' });
        }

        const school = await School.findById(session.schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Generate student ID
        let schoolAbbr = 'SCH';
        if (school.name) {
             const nameParts = school.name.split(' ');
             if (nameParts.length > 1) {
                 schoolAbbr = nameParts.map(p => p[0]).join('').toUpperCase().substring(0, 3);
             } else {
                 schoolAbbr = school.name.substring(0, 3).toUpperCase();
             }
        }
        const year = new Date().getFullYear();
        const baseId = `${schoolAbbr}-${year}`;
        const lastStudent = await Student.findOne({
            schoolId: session.schoolId,
            studentId: { $regex: `^${baseId}` }
        }).sort({ studentId: -1 });

        let nextSeq = 1;
        if (lastStudent && lastStudent.studentId) {
            const parts = lastStudent.studentId.split('-');
            const lastSeqObj = parts[parts.length - 1];
            if (!isNaN(lastSeqObj)) {
                nextSeq = parseInt(lastSeqObj) + 1;
            }
        }
        const studentId = `${baseId}-${String(nextSeq).padStart(3, '0')}`;

        // Create User (Auth)
        const finalPassword = school.defaultStudentPassword || 'student123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

        const user = await User.create({
            schoolId: session.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'student',
            classId: session.classId
        });

        // Get subjects
        const classLevelDoc = await ClassLevel.findById(session.classId);
        let assignedSubjects = [];
        if (classLevelDoc) {
            assignedSubjects = [...(classLevelDoc.subjects || [])];
            if (session.arm) {
                 const armData = classLevelDoc.arms.find(a => a.name === session.arm);
                 if (armData && armData.subjects) {
                     assignedSubjects = [...assignedSubjects, ...armData.subjects];
                 }
            }
        }

        // Create Student Profile
        const student = await Student.create({
            schoolId: session.schoolId,
            userId: user._id,
            firstName,
            lastName,
            email,
            gender,
            profilePicture: req.file ? req.file.path : null,
            studentId,
            level: classLevelDoc?.level || 'JSS',
            classId: session.classId,
            arm: session.arm,
            subjects: assignedSubjects,
            enrollmentStatus: enrollmentStatus || 'Day',
            status: 'active'
        });

        // Update School Usage
        if (req.file) {
            await School.findByIdAndUpdate(session.schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        res.status(201).json({ message: 'Student registered successfully', student });

    } catch (error) {
        console.error('Bulk Upload Error:', error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'Error processing bulk upload' });
    }
};

// @desc    Promote Students
// @route   POST /api/students/promote
// @access  Private (Admin)
const promoteStudents = async (req, res) => {
    const { studentIds, toClassId, toArm, session, term, reason } = req.body;

    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return res.status(400).json({ message: 'No student IDs provided for promotion' });
    }

    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        // 1. Fetch Target Class Details
        const toClass = await ClassLevel.findById(toClassId);
        if (!toClass) {
            return res.status(404).json({ message: 'Target class not found' });
        }

        // Determine new subjects for the target class
        const newSubjects = [...(toClass.subjects || [])];
        if (toArm) {
            const armData = toClass.arms.find(a => a.name === toArm);
            if (armData && armData.subjects) {
                newSubjects.push(...armData.subjects);
            }
        }

        const promotionRecords = [];
        const studentUpdates = [];
        const userUpdates = [];

        // 2. Fetch Students to be promoted
        const studentsToPromote = await Student.find({
            _id: { $in: studentIds },
            schoolId
        });

        if (studentsToPromote.length === 0) {
             return res.status(404).json({ message: 'No valid students found for promotion' });
        }

        for (const student of studentsToPromote) {
            // Save log entry data
            promotionRecords.push({
                schoolId,
                studentId: student._id,
                fromClassId: student.classId,
                toClassId: toClassId,
                fromArm: student.arm,
                toArm: toArm,
                session: session || 'Current', 
                term: term || 'Current',
                promotedBy: req.user._id,
                reason: reason || 'End of Term Promotion'
            });

            // Update Student Profile
            student.classId = toClassId;
            student.arm = toArm;
            student.level = toClass.category; // JSS or SSS (mapped from ClassLevel.category)
            student.subjects = newSubjects;
            
            studentUpdates.push(student.save());

            // Update Linked User Account for Subject/Class filtering in other modules
            userUpdates.push(User.findByIdAndUpdate(student.userId, { classId: toClassId }));
        }

        // 3. Persist Changes
        await Promise.all([
            ...studentUpdates,
            ...userUpdates,
            PromotionRecord.insertMany(promotionRecords)
        ]);

        // 4. Notifications
        for (const student of studentsToPromote) {
            await createNotification(
                student.userId,
                `Congratulations! You have been promoted to ${toClass.name} ${toArm ? `(${toArm})` : ''}`,
                'success'
            );
        }

        res.json({ 
            message: `Successfully promoted ${studentsToPromote.length} students to ${toClass.name}`,
            count: studentsToPromote.length 
        });

    } catch (error) {
        console.error('Promotion Error:', error);
        res.status(500).json({ message: 'Error processing promotion' });
    }
};

module.exports = {
    createStudent,
    getStudents,
    getTeacherStudents,
    getMyProfile,
    getStudentById,
    updateStudent,
    deleteStudent,
    generateUploadLink,
    getActiveUploadLinks,
    revokeUploadSession,
    verifyUploadToken,
    bulkUpload,
    promoteStudents
};
