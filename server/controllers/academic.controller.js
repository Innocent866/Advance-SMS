const Subject = require('../models/Subject');
const ClassLevel = require('../models/ClassLevel');
const AcademicSession = require('../models/AcademicSession');
const User = require('../models/User');
const Student = require('../models/Student');

// --- Subjects ---
const createSubject = async (req, res) => {
    const { name, code } = req.body;
    try {
        const subject = await Subject.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name,
            code
        });
        res.status(201).json(subject);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find({ schoolId: req.user.schoolId._id || req.user.schoolId });
        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Classes & Arms ---
const createClassLevel = async (req, res) => {
    const { name, category } = req.body; // category: JSS or SSS
    try {
        const classLevel = await ClassLevel.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name,
            category,
            arms: [],
            subjects: []
        });
        res.status(201).json(classLevel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateClassArms = async (req, res) => {
    const { classId, armName } = req.body;
    try {
        const classLevel = await ClassLevel.findOne({ _id: classId, schoolId: req.user.schoolId._id || req.user.schoolId });
        if (!classLevel) return res.status(404).json({ message: 'Class not found' });

        classLevel.arms.push({ name: armName });
        await classLevel.save();
        res.json(classLevel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const assignSubjectToClass = async (req, res) => {
    const { classId, subjectId, armId } = req.body; // Toggle assignment
    try {
        const classLevel = await ClassLevel.findOne({ _id: classId, schoolId: req.user.schoolId._id || req.user.schoolId });
        if (!classLevel) return res.status(404).json({ message: 'Class not found' });

        let isAdded = false;
        let armName = null;

        if (armId) {
            // Toggle for specific arm
            const arm = classLevel.arms.id(armId);
            if (!arm) return res.status(404).json({ message: 'Arm not found' });
            
            armName = arm.name;

            const index = arm.subjects.indexOf(subjectId);
            if (index === -1) {
                arm.subjects.push(subjectId);
                isAdded = true;
            } else {
                arm.subjects.splice(index, 1);
                isAdded = false;
            }
        } else {
            // Toggle for entire class (General)
            const index = classLevel.subjects.indexOf(subjectId);
            if (index === -1) {
                classLevel.subjects.push(subjectId); // Assign
                isAdded = true;
            } else {
                classLevel.subjects.splice(index, 1); // Unassign
                isAdded = false;
            }
        }
        await classLevel.save();

        // SYNC: Update All Students in this Class/Arm
        if (isAdded) {
            const query = { classId, schoolId: req.user.schoolId._id || req.user.schoolId };
            if (armName) query.arm = armName;
            
            await Student.updateMany(query, { $addToSet: { subjects: subjectId } });
        } else {
            const query = { classId, schoolId: req.user.schoolId._id || req.user.schoolId };
            if (armName) query.arm = armName;
            
            await Student.updateMany(query, { $pull: { subjects: subjectId } });
        }

        res.json(classLevel);
    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getClassLevels = async (req, res) => {
    try {
        let query = { schoolId: req.user.schoolId._id || req.user.schoolId };

        // If Teacher, return only assigned classes
        if (req.user.role === 'teacher') {
             const Teacher = require('../models/Teacher');
             const teacher = await Teacher.findOne({ userId: req.user._id });
             if (teacher) {
                 // Get unique class IDs from assignments
                 const assignedClassIds = teacher.teachingAssignments.map(a => a.classId);
                 // Also include 'classes' field if used for form teachers
                 if (teacher.classes && teacher.classes.length > 0) {
                     assignedClassIds.push(...teacher.classes);
                 }
                 query._id = { $in: assignedClassIds };
             }
        }

        const classLevels = await ClassLevel.find(query)
            .sort({ name: 1 })
            .populate('subjects')
            .populate('arms.subjects');

        // If teacher, maybe we should also filter the 'arms' in the response?
        // The frontend expects the full class object. 
        // For now, filtering the Class List is a good first step. 
        // The frontend "Mark Attendance" uses this list.
        
        res.json(classLevels);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Academic Sessions ---
const createSession = async (req, res) => {
    const { name, terms } = req.body;
    try {
        // Deactivate others? Maybe explicitly.
        
        const session = await AcademicSession.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name,
            terms, // array of {name, startDate, endDate}
            isActive: false
        });
        res.status(201).json(session);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getSessions = async (req, res) => {
    try {
        const sessions = await AcademicSession.find({ schoolId: req.user.schoolId._id || req.user.schoolId }).sort({ createdAt: -1 });
        res.json(sessions);
    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const activateSession = async (req, res) => {
    const { sessionId, currentTerm } = req.body;
    try {
        // Deactivate all others
        await AcademicSession.updateMany({ schoolId: req.user.schoolId._id || req.user.schoolId }, { isActive: false });
        
        const session = await AcademicSession.findByIdAndUpdate(
            sessionId, 
            { isActive: true, currentTerm },
            { new: true }
        );
        res.json(session);
    } catch (error) {
         console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Teacher Assignment ---
const assignTeacherToSubject = async (req, res) => {
    const { teacherId, subjectId, classId, arm } = req.body;
    try {
        // Find Teacher Profile (using the ID passed from frontend which comes from /teachers endpoint)
        const teacher = await require('../models/Teacher').findById(teacherId);
        
        if(!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Verify school (Skip for Super Admin)
        if (req.user.role !== 'super_admin') {
            const userSchoolId = req.user.schoolId._id ? req.user.schoolId._id.toString() : req.user.schoolId.toString();
            if (teacher.schoolId.toString() !== userSchoolId) {
                return res.status(401).json({ message: 'Not authorized' });
            }
        }

        // Add assignment
        teacher.teachingAssignments.push({ subjectId, classId, arm });
        
        // Auto-add to qualified subjects list if not present
        if (!teacher.subjects.includes(subjectId)) {
            teacher.subjects.push(subjectId);
        }

        // Auto-add to classes list if not present
        if (!teacher.classes.includes(classId)) {
            teacher.classes.push(classId);
        }

        await teacher.save();

        // Optional: Sync with User model if needed for auth/legacy, but Teacher profile is source of truth now
        // For now, we just update the Teacher profile. 
        
        res.json(teacher);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateClassSettings = async (req, res) => {
    const { classId, hasAfterSchoolLearning, videoSubjects } = req.body;
    try {
        const classLevel = await ClassLevel.findOne({ _id: classId, schoolId: req.user.schoolId._id || req.user.schoolId });
        if (!classLevel) return res.status(404).json({ message: 'Class not found' });

        if (hasAfterSchoolLearning !== undefined) classLevel.hasAfterSchoolLearning = hasAfterSchoolLearning;
        if (videoSubjects !== undefined) classLevel.videoSubjects = videoSubjects;

        await classLevel.save();
        res.json(classLevel);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createSubject,
    getSubjects,
    createClassLevel,
    getClassLevels,
    updateClassArms,
    assignSubjectToClass,
    createSession,
    getSessions,
    activateSession,
    assignTeacherToSubject,
    updateClassSettings
};
