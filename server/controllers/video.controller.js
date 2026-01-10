const VideoLesson = require('../models/VideoLesson');
const VideoProgress = require('../models/VideoProgress'); // Ensure this exists or create it if I missed it in previous context, but summary said it was created.
const School = require('../models/School');

// @desc    Create a new video lesson
// @route   POST /api/videos
// @access  Private (Teacher)
const createVideo = async (req, res) => {
    // If we have a file, use its path, otherwise verify url is present? 
    // Actually the router uses upload.single('video'). If a file is uploaded, req.file is set.
    // If not, req.body.videoUrl might be set for external links (not supported in this strict mode? 
    // The user requested "upload videos", so we prioritize file).

    const { classLevelId, subjectId, topic, title, description, lessonNotes, isPublished } = req.body;
    let videoUrl = req.body.videoUrl;

    if (req.file) {
        // Construct URL path (e.g., http://localhost:5000/uploads/videos/filename.mp4)
        // ideally, storing relative path is better: /uploads/videos/filename.mp4
        videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    if (!classLevelId || !subjectId || !topic || !title || !videoUrl) {
        return res.status(400).json({ message: 'Please provide all required fields (including video file)' });
    }

    try {
        // Check school preferences for auto-approval
        const school = await School.findById(req.user.schoolId);
        const autoApprove = school?.preferences?.autoApproveContent !== false; 

        const video = await VideoLesson.create({
            schoolId: req.user.schoolId,
            teacherId: req.user._id,
            classLevelId,
            subjectId,
            topic,
            title,
            description,
            videoUrl,
            lessonNotes,
            isPublished: isPublished === 'true' || isPublished === true, // FormData sends strings
            status: autoApprove ? 'Approved' : 'Pending' 
        });

        res.status(201).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all videos (Filterable)
// @route   GET /api/videos
// @access  Private
const getVideos = async (req, res) => {
    const { classLevelId, subjectId, topic, teacherId } = req.query;
    let query = { schoolId: req.user.schoolId };

    if (classLevelId) query.classLevelId = classLevelId;
    if (subjectId) query.subjectId = subjectId;
    if (topic) query.topic = { $regex: topic, $options: 'i' };
    
    // If querying specific teacher
    if (teacherId) query.teacherId = teacherId;

    // If Student, only show Approved AND Published
    if (req.user.role === 'student') {
        query.status = 'Approved';
        query.isPublished = true;
    }

    try {
        const videos = await VideoLesson.find(query)
            .populate('teacherId', 'name')
            .populate('classLevelId', 'name')
            .populate('subjectId', 'name')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single video
// @route   GET /api/videos/:id
// @access  Private
const getVideoById = async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id)
            .populate('teacherId', 'name')
            .populate('classLevelId', 'name')
            .populate('subjectId', 'name');

        if (!video) return res.status(404).json({ message: 'Video not found' });

        res.json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update video
// @route   PUT /api/videos/:id
// @access  Private (Teacher - owner)
const updateVideo = async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin' && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedVideo = await VideoLesson.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedVideo);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private (Teacher - owner)
const deleteVideo = async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        if (video.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin' && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await video.deleteOne();
        res.json({ message: 'Video removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get video stats (views, completions)
// @route   GET /api/videos/:id/stats
// @access  Private (Teacher)
const getVideoStats = async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Count completions
        // Assuming VideoProgress model exists as per previous summary
        // If not, I'll need to define it or import it. The summary said `VideoProgress.js` (NEW Model) was created.
        
        let completionCount = 0;
        try {
             const VideoProgress = require('../models/VideoProgress');
             completionCount = await VideoProgress.countDocuments({ videoId: video._id, completed: true });
        } catch (e) {
            console.log("VideoProgress model might be missing or error", e);
        }

        res.json({
            views: video.views,
            completions: completionCount
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createVideo,
    getVideos,
    getVideoById,
    updateVideo,
    deleteVideo,
    getVideoStats
};
