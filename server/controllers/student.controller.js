const Student = require('../models/Student');
const User = require('../models/User');
const School = require('../models/School'); // Import School model
const bcrypt = require('bcryptjs');
const VideoLesson = require('../models/VideoLesson');
const Quiz = require('../models/Quiz');
const LearningMaterial = require('../models/LearningMaterial');
const { createNotification } = require('./notification.controller');

// @desc    Create a new student
// @route   POST /api/students
// @access  Private (School Admin)
const createStudent = async (req, res) => {
    const { firstName, lastName, email, password, gender, level, classId, arm } = req.body;

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
        .select('firstName lastName email profilePicture classId studentId arm');

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

module.exports = {
    createStudent,
    getStudents,
    getTeacherStudents,
    getMyProfile,
    getStudentById,
    updateStudent,
    deleteStudent
};
