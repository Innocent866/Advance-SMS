const AssessmentConfig = require('../models/AssessmentConfig');

// @desc    Create or Update Assessment Configuration
// @route   POST /api/assessment-config
// @access  Private (School Admin)
const createOrUpdateConfig = async (req, res) => {
    const { session, term, components, gradingScale } = req.body;

    // 1. Validate total score
    const totalScore = components.reduce((sum, c) => sum + Number(c.maxScore), 0);
    if (totalScore !== 100) {
        return res.status(400).json({ message: `Total Max Score must be 100%. Current total: ${totalScore}%` });
    }

    try {
        // Find existing for this Session/Term
        let config = await AssessmentConfig.findOne({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            session,
            term
        });

        // Default Grading Scale if not provided
        const defaultScale = [
            { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
            { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
            { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
            { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
            { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
            { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
        ];

        const finalScale = gradingScale || defaultScale;

        if (config) {
            // Update
            config.components = components;
            config.totalMaxScore = totalScore;
            config.gradingScale = finalScale;
            await config.save();
            return res.json(config);
        } else {
            // Create
            config = await AssessmentConfig.create({
                schoolId: req.user.schoolId._id || req.user.schoolId,
                session,
                term,
                components,
                totalMaxScore: totalScore,
                gradingScale: finalScale
            });
            return res.status(201).json(config);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Current Assessment Config
// @route   GET /api/assessment-config
// @access  Private (Admin, Teacher)
const getConfig = async (req, res) => {
    const { session, term } = req.query;

    try {
        const query = { schoolId: req.user.schoolId._id || req.user.schoolId };
        
        // If session/term provided, filter. Else get active?
        // Let's require session/term for specificity or fallback to defaults if we had a settings model.
        // For now, allow query.
        if (session) query.session = session;
        if (term) query.term = term;

        // If generic fetch, maybe return all? Or most recent?
        // Let's implement specific fetch for now.
        
        const config = await AssessmentConfig.findOne(query).sort({ createdAt: -1 });
        
        if (!config) {
            // Return empty/default instead of 404 to avoid frontend error notifications causing panic on initial load
            return res.json({ components: null }); 
        }
        res.json(config);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createOrUpdateConfig,
    getConfig
};
