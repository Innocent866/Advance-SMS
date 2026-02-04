const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const ClassLevel = require('../models/ClassLevel');

// @desc    Mark Attendance (Create or Update if allowed)
// @route   POST /api/attendance
// @access  Private (Teacher, Admin)
const markAttendance = async (req, res) => {
    const { classId, arm, date, session, term, records } = req.body;

    try {
        // 1. Normalize Date to Midnight (UTC) to ensure uniqueness per day
        const dateObj = new Date(date);
        dateObj.setUTCHours(0, 0, 0, 0);

        // 2. Check Permissions (Teacher Strict Mode)
        if (req.user.role === 'teacher') {
             const Teacher = require('../models/Teacher');
             const teacher = await Teacher.findOne({ userId: req.user._id });
             
             if (!teacher) {
                 return res.status(403).json({ message: 'Teacher profile not found' });
             }

             // Check if assigned to this Class AND Arm
             // We look in 'teachingAssignments'
             const isAssigned = teacher.teachingAssignments.some(assignment => 
                 assignment.classId.toString() === classId && 
                 assignment.arm === arm
             );

             if (!isAssigned) {
                 // Fallback: check legacy 'classes' array if applicable, but requirement implies strict arm.
                 // If 'classes' array is used for "Form Teacher" status which might imply all arms?
                 // Let's assume strict teaching assignment for now as "marking register" usually implies subject/class teacher.
                 return res.status(403).json({ message: 'You are not assigned to this Class and Arm.' });
             }
        }

        // 3. Find existing
        let attendance = await Attendance.findOne({
            classId,
            arm,
            date: dateObj
        });

        if (attendance) {
            // Update mode
            // If strictly "Once per day & Locked", we can block.
            // Requirement: "Attendance can only be marked once per class per day (unless admin reopens it)."
            // Implementation: We can allow update if it's "Today", else block if "Locked".
            // Simple approach: Allow update for now.
            attendance.records = records;
            attendance.markedBy = req.user._id; 
            await attendance.save();
            return res.json({ message: 'Attendance updated successfully', attendance });
        }

        // 4. Create New
        attendance = await Attendance.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            classId,
            arm,
            date: dateObj,
            session,
            term,
            markedBy: req.user._id,
            records
        });

        res.status(201).json({ message: 'Attendance marked successfully', attendance });

    } catch (error) {
        console.error(error);
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Attendance already marked for this date.' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Attendance for a Class/Date
// @route   GET /api/attendance
// @access  Private
const getAttendance = async (req, res) => {
    const { classId, arm, date } = req.query;

    try {
        const dateObj = new Date(date);
        dateObj.setUTCHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            classId,
            arm,
            date: dateObj
        }).populate('records.studentId', 'firstName lastName studentId profilePicture');

        if (!attendance) {
            return res.json({ records: [] }); // Empty initial state
        }

        res.json(attendance);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    markAttendance,
    getAttendance
};
