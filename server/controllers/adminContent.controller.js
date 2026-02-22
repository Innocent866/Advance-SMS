const LessonPlan = require('../models/LessonPlan');
const VideoLesson = require('../models/VideoLesson');

// Get all content with filters
const getAllContent = async (req, res) => {
    const { type, classId, subjectId, term, week, status } = req.query;
    const schoolId = req.user.schoolId?._id || req.user.schoolId;

    try {
        let items = [];
        const filter = { schoolId };
        
        if (classId) filter.classLevelId = classId;
        if (subjectId) filter.subjectId = subjectId;
        if (status) filter.status = status;

        if (type === 'lesson-plan' || !type) {
            const planFilter = { ...filter };
            if (term) planFilter.term = term;
            if (week) planFilter.week = week;
            
            const plans = await LessonPlan.find(planFilter)
                .populate('teacherId', 'name email')
                .populate('classLevelId', 'name')
                .populate('subjectId', 'name')
                .sort({ createdAt: -1 });
            
            plans.forEach(p => items.push({ ...p.toObject(), type: 'Lesson Plan' }));
        }

        if (type === 'video' || !type) {
            // Videos might not have term/week in schema yet, ignore if passed or matching logic needs update.
            // Assuming videos are just filtered by class/subject for now.
            const videos = await VideoLesson.find(filter)
                .populate('teacherId', 'name email')
                .populate('classLevelId', 'name')
                .populate('subjectId', 'name')
                .sort({ createdAt: -1 });

            videos.forEach(v => items.push({ ...v.toObject(), type: 'Video Lesson' }));
        }

        // Sort combined if necessary
        items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateContentStatus = async (req, res) => {
    const { id, type, status } = req.body; // type: 'Lesson Plan' | 'Video Lesson'
    
    try {
        let updated;
        if (type === 'Lesson Plan') {
            updated = await LessonPlan.findOneAndUpdate(
                { _id: id, schoolId: req.user.schoolId?._id || req.user.schoolId },
                { status },
                { new: true }
            );
        } else if (type === 'Video Lesson') {
            updated = await VideoLesson.findOneAndUpdate(
                { _id: id, schoolId: req.user.schoolId?._id || req.user.schoolId },
                { status },
                { new: true }
            );
        }

        if (!updated) return res.status(404).json({ message: 'Content not found' });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllContent,
    updateContentStatus
};
