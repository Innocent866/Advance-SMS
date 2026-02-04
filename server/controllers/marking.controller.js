const { generateExamGradingAI } = require('../utils/aiService');
const School = require('../models/School');
const AIUsageLog = require('../models/AIUsageLog');

// Plan Limits (Tokens per month) - Shared with Lesson Plan Limits for now
const PLAN_LIMITS = {
    'Basic': 50000,      // ~20 lessons
    'Standard': 200000,  // ~80 lessons
    'Premium': 1000000   // ~400 lessons
};

// @desc    Grade an exam answer using AI
// @route   POST /api/marking/grade
// @access  Private (Teacher)
const gradeExam = async (req, res) => {
    const { subject, examType, question, markingScheme, studentAnswer } = req.body;
    const scriptFile = req.file; // From multer

    if (!subject || !examType || !question || !markingScheme) {
        return res.status(400).json({ message: 'Please provide subject, exam type, question, and marking scheme.' });
    }
    
    // Either text answer or file must be provided
    if (!studentAnswer && !scriptFile) {
        return res.status(400).json({ message: 'Please provide either a Student Answer text or an Uploaded Script.' });
    }

    try {
        // 1. Check Usage Limits
        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        const currentPlan = school.subscription?.plan || 'Basic'; 
        
        // ... (Limit check omitted for brevity, logic remains same) ...
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

        // 2. Generate
        const gradingResult = await generateExamGradingAI({ 
            subject, 
            examType, 
            question, 
            markingScheme, 
            studentAnswer,
            scriptFile: scriptFile ? scriptFile.path : null, // Cloudinary URL
            scriptFileType: scriptFile ? scriptFile.mimetype : null,
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id
        });

        res.json(gradingResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error grading exam' });
    }
};

module.exports = {
    gradeExam
};
