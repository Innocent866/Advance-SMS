const { generateExamGradingAI } = require('../utils/aiService');
const School = require('../models/School');
const AIUsageLog = require('../models/AIUsageLog');
const AIMarkingResult = require('../models/AIMarkingResult');

const subscriptionPlans = require('../config/subscriptionPlans');

const { getMarkedScriptUrl } = require('../utils/markingPainter');
const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Grade an exam answer using AI
// @route   POST /api/marking/grade
// @access  Private (Teacher)
const gradeExam = async (req, res) => {
    const { subject, examType, question, markingScheme, studentAnswer } = req.body;
    const scriptFile = req.file; // From multer (memoryStorage)

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
        const limit = subscriptionPlans[currentPlan]?.aiTokenLimit || 0;

        if (usedTokens >= limit) {
             return res.status(403).json({ 
                 message: `Monthly AI Limit Reached for ${currentPlan} Plan. Upgrade to generate more content.` 
             });
        }

        // 2. Upload to Cloudinary if file provided
        let scriptUrl = null;
        if (scriptFile) {
            const uploadStream = () => {
                return new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'school_management_system/marking_scripts',
                            resource_type: 'auto',
                        },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve(result);
                        }
                    );
                    Readable.from(scriptFile.buffer).pipe(stream);
                });
            };
            const uploadResult = await uploadStream();
            scriptUrl = uploadResult.secure_url;
        }

        // 3. Generate Grading Result
        const gradingResult = await generateExamGradingAI({ 
            subject, 
            examType, 
            question, 
            markingScheme, 
            studentAnswer,
            scriptFile: scriptUrl, // Pass Cloudinary URL to AI
            scriptFileType: scriptFile ? scriptFile.mimetype : null,
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id
        });

        if (scriptUrl) {
            // Apply Visual Red Ink marking
            const markedUrl = getMarkedScriptUrl(
                scriptUrl, 
                gradingResult.scoreBreakdown, 
                gradingResult.totalSuggestedScore, 
                gradingResult.maxPossibleScore
            );
            gradingResult.scriptUrl = markedUrl;
        }

        res.json(gradingResult);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message || 'Error grading exam' });
    }
};

// @desc    Save an AI marking result to history
// @route   POST /api/marking/save
// @access  Private (Teacher)
const saveResult = async (req, res) => {
    try {
        const { subject, examType, question, markingScheme, studentAnswer, scriptUrl, scoreBreakdown, totalSuggestedScore, finalizedScore, maxPossibleScore, feedback } = req.body;

        const record = await AIMarkingResult.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            subject,
            examType,
            question,
            markingScheme,
            studentAnswer,
            scriptUrl,
            scoreBreakdown,
            totalSuggestedScore,
            finalizedScore,
            maxPossibleScore,
            feedback
        });

        res.status(201).json(record);
    } catch (error) {
        console.error('Error saving marking result:', error);
        res.status(500).json({ message: 'Error saving marking result' });
    }
};

// @desc    Get marking history for the teacher
// @route   GET /api/marking/history
// @access  Private (Teacher)
const getHistory = async (req, res) => {
    try {
        const history = await AIMarkingResult.find({ teacherId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        console.error('Error fetching marking history:', error);
        res.status(500).json({ message: 'Error fetching marking history' });
    }
};

module.exports = {
    gradeExam,
    saveResult,
    getHistory
};
