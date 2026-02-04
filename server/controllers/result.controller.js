const Result = require('../models/Result');
const AssessmentConfig = require('../models/AssessmentConfig');
const Student = require('../models/Student');
const User = require('../models/User');

// @desc    Submit Results (Bulk)
// @route   POST /api/results
// @access  Private (Teacher, Admin)
const submitResults = async (req, res) => {
    const { classId, subjectId, session, term, results } = req.body;
    // results: [{ studentId: "...", scores: { "CA1": 10, "Exam": 50 } }]

    try {
        // 1. Fetch Config to validate
        const config = await AssessmentConfig.findOne({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            session,
            term
        });

        if (!config) {
            return res.status(404).json({ message: 'Assessment Configuration not found for this Session/Term. Please ask Admin to configure it.' });
        }

        if (config.isLocked) {
            return res.status(403).json({ message: 'Result submission is LOCKED for this term.' });
        }

        // --- AUTHORIZATION CHECK (Teacher) ---
        if (req.user.role === 'teacher') {
            const Teacher = require('../models/Teacher');
            const teacher = await Teacher.findOne({ userId: req.user._id });
            
            if (!teacher) {
                return res.status(403).json({ message: 'Teacher profile not found.' });
            }

            // Check if teacher is assigned to this Subject and Class
            // We check:
            // 1. Explicit Teaching Assignment (Subject + Class)
            // 2. OR Subject is in general list AND Class is in general list (Looser check if assignments not used strictly)
            
            // Note: Since we are saving results for multiple students who might be in different arms (if mixed?), 
            // but usually a batch is for one Class/Arm.
            // However, the payload doesn't explicitly send "Arm". It sends "results" for "studentId".
            // We should ideally check the ARM of the students being graded?
            // Expensive to check each student. 
            // Better: Trust the filter BUT check if the teacher has *any* assignment for this class/subject.
            // If they have explicit Arm assignment, we should check it?
            
            // Let's refine the check:
            // Find ALL assignments for this Subject + Class
            const relevantAssignments = teacher.teachingAssignments.filter(a => 
                a.subjectId.toString() === subjectId && 
                a.classId.toString() === classId
            );

            const hasGeneralPerm = 
                teacher.subjects.some(s => s.toString() === subjectId) &&
                teacher.classes.some(c => c.toString() === classId);

            if (relevantAssignments.length === 0 && !hasGeneralPerm) {
                 return res.status(403).json({ message: 'You are not assigned to this Subject and Class.' });
            }

            // If we want to be strict about Arms:
            // We would need to know the Arm of the students being submitted.
            // For now, allow if they have assignment.
            // If user wants STRICT arm check, we need to fetch students and check their arm.
        }

        const componentsMap = new Map(config.components.map(c => [c.name, c.maxScore]));

        // 2. Process each result
        const operations = [];
        const errors = [];

        for (const entry of results) {
            const { studentId, scores } = entry;
            let total = 0;
            const validScores = {};

            // Validate Scores
            for (const [component, score] of Object.entries(scores)) {
                if (!componentsMap.has(component)) {
                    // Skip unknown components? or Error? Let's skip or error.
                    // Strict mode: Error.
                    // errors.push(`Student ${studentId}: Unknown component ${component}`);
                    continue; 
                }
                
                const max = componentsMap.get(component);
                if (Number(score) > max) {
                    errors.push(`Student ${studentId}: Score for ${component} (${score}) exceeds limit (${max})`);
                    continue;
                }

                if (Number(score) < 0) {
                     errors.push(`Student ${studentId}: Negative score for ${component}`);
                     continue;
                }

                total += Number(score);
                validScores[component] = Number(score);
            }

            if (errors.length > 0) continue; // Skip saving valid ones if batch has errors? Or save valid ones?
            // Let's fail fast if any error? Or collect all errors.
            // Requirement says "Show clear error messages".
            
            // Determine Grade (Dynamic scale)
            let grade = 'F';
            let remark = 'Fail';
            
            // Use config.gradingScale if available and NOT empty, else usage default
            const scale = (config.gradingScale && config.gradingScale.length > 0) ? config.gradingScale : [
                 { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
                 { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
                 { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
                 { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
                 { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
                 { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
            ];

            for (const g of scale) {
                if (total >= g.minScore && total <= g.maxScore) {
                    grade = g.grade;
                    remark = g.remark;
                    break;
                }
            }

            // Upsert Operation
            operations.push({
                updateOne: {
                    filter: {
                        schoolId: req.user.schoolId._id || req.user.schoolId,
                        studentId,
                        classId,
                        subjectId,
                        session,
                        term
                    },
                    update: {
                        $set: {
                            scores: validScores,
                            totalScore: total,
                            grade,
                            remark,
                            teacherId: req.user._id
                        }
                    },
                    upsert: true
                }
            });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: 'Validation Errors', errors });
        }

        if (operations.length > 0) {
            await Result.bulkWrite(operations);
        }

        res.json({ message: 'Results submitted successfully', count: operations.length });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Results for a Class/Subject
// @route   GET /api/results
// @access  Private
const getResults = async (req, res) => {
    const { classId, subjectId, session, term } = req.query;

    try {
        const results = await Result.find({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            classId,
            subjectId,
            session,
            term
        }).populate('studentId', 'firstName lastName studentId profilePicture');

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyResults = async (req, res) => {
    const { session, term } = req.query;

    try {
        // 1. Find Student Profile linked to User
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // 2. Fetch Results
        const results = await Result.find({
            studentId: student._id,
            session,
            term
        }).populate('subjectId', 'name code').populate('classId', 'name');

        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitResults,
    getResults,
    getMyResults
};
