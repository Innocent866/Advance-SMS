const LessonPlan = require('../models/LessonPlan');
const { generateLessonPlanAI } = require('../utils/aiService');

// @desc    Generate a lesson plan using AI
// @route   POST /api/lessons/generate
// @access  Private (Teacher)
const School = require('../models/School');
const Subject = require('../models/Subject');
const ClassLevel = require('../models/ClassLevel');
const AIUsageLog = require('../models/AIUsageLog');

// Plan Limits (Tokens per month)
const PLAN_LIMITS = {
    'Basic': 50000,      // ~20 lessons
    'Standard': 200000,  // ~80 lessons
    'Premium': 1000000   // ~400 lessons
};

const generateLesson = async (req, res) => {
    const { subject, classLevel, topic, term, week, generateNotes, generateSlides } = req.body;

    if (!subject || !classLevel || !topic || !term || !week) {
        return res.status(400).json({ message: 'Please provide all fields' });
    }

    try {
        // 1. Check Usage Limits
        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        const currentPlan = school.subscription?.plan || 'Basic'; // Default to basic if missing
        
        // Calculate start of current month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0,0,0,0);

        const usageStats = await AIUsageLog.aggregate([
            { $match: { 
                schoolId: req.user.schoolId._id || req.user.schoolId, 
                createdAt: { $gte: startOfMonth } 
            }},
            { $group: { _id: null, totalTokens: { $sum: "$tokensUsed" } } }
        ]);

        const usedTokens = usageStats[0]?.totalTokens || 0;
        const limit = PLAN_LIMITS[currentPlan] || 50000;

        if (usedTokens >= limit) {
             return res.status(403).json({ 
                 message: `Monthly AI Limit Reached for ${currentPlan} Plan. Upgrade to generate more content.` 
             });
        }

        // 2. Resolve Names (AI needs text, not IDs)
        const subjectDoc = await Subject.findById(subject);
        const classDoc = await ClassLevel.findById(classLevel);

        if (!subjectDoc || !classDoc) {
             return res.status(404).json({ message: 'Invalid Subject or Class ID' });
        }

        // 3. Generate
        const generatedContent = await generateLessonPlanAI({ 
            subject: subjectDoc.name, 
            classLevel: classDoc.name, 
            topic, 
            term, 
            week,
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            generateNotes,
            generateSlides
        });

        res.json(generatedContent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error generating lesson plan' });
    }
};

// @desc    Save a lesson plan
// @route   POST /api/lessons
// @access  Private (Teacher)
const saveLesson = async (req, res) => {
    const { 
        classLevelId, 
        subjectId, 
        term, 
        week, 
        topic, 
        content,
        lessonNotes,
        slideOutline,
        status 
    } = req.body;

    try {
        const lesson = await LessonPlan.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            classLevelId,
            subjectId,
            term,
            week,
            topic,
            content,
            lessonNotes,
            slideOutline,
            status
        });
        res.status(201).json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all lesson plans (with filters)
// @route   GET /api/lessons
// @access  Private (Teacher/Admin)
const getLessons = async (req, res) => {
    const { classLevelId, subjectId, term, week } = req.query;
    let query = { schoolId: req.user.schoolId._id || req.user.schoolId };

    if (classLevelId) query.classLevelId = classLevelId;
    if (subjectId) query.subjectId = subjectId;
    if (term) query.term = term;
    if (week) query.week = week;

    // If teacher, maybe only show their own? Or show all in library?
    // Requirement: "Central lesson library per school". So show all for the school.
    // Maybe filter by published status if not the author?
    // For MVP, show all.

    try {
        const lessons = await LessonPlan.find(query)
            .populate('teacherId', 'name')
            .populate('classLevelId', 'name')
            .populate('subjectId', 'name')
            .sort({ createdAt: -1 });
        res.json(lessons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get a single lesson plan
// @route   GET /api/lessons/:id
// @access  Private
const getLessonById = async (req, res) => {
    try {
        const lesson = await LessonPlan.findById(req.params.id)
            .populate('teacherId', 'name')
            .populate('classLevelId', 'name')
            .populate('subjectId', 'name');

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        res.json(lesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a lesson plan
// @route   PUT /api/lessons/:id
// @access  Private (Teacher - owner only)
const updateLesson = async (req, res) => {
    try {
        const lesson = await LessonPlan.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Check ownership
        if (lesson.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedLesson = await LessonPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.json(updatedLesson);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a lesson plan
// @route   DELETE /api/lessons/:id
// @access  Private (Teacher - owner only)
const deleteLesson = async (req, res) => {
    try {
        const lesson = await LessonPlan.findById(req.params.id);

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Check ownership
        if (lesson.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await lesson.deleteOne();
        res.json({ message: 'Lesson removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    generateLesson,
    saveLesson,
    getLessons,
    getLessonById,
    updateLesson,
    deleteLesson
};
