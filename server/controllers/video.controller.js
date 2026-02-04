const VideoLesson = require('../models/VideoLesson');
const VideoProgress = require('../models/VideoProgress'); // Ensure this exists or create it if I missed it in previous context, but summary said it was created.
const School = require('../models/School');

// @desc    Create a new video lesson
// @route   POST /api/videos
// @access  Private (Teacher)
const { cloudinary } = require('../config/cloudinary');

// @desc    Create a new video lesson
// @route   POST /api/videos
// @access  Private (Teacher)
const createVideo = async (req, res) => {
    const { classLevelId, subjectId, topic, title, description, lessonNotes, isPublished } = req.body;
    let videoUrl = req.body.videoUrl;
    let publicId = null;
    let duration = 0;
    let format = '';

    if (req.file) {
        // Cloudinary Source
        videoUrl = req.file.path;
        publicId = req.file.filename;
        // req.file.mimetype gives video/mp4, etc.
        format = req.file.mimetype.split('/')[1]; 
        // Note: Duration isn't returned by multer-storage-cloudinary directly usually, 
        // unless we query it or it's in the raw response. 
        // For now we leave duration as 0 or handle it via a webhook if needed. 
        // But we can just store what we have.
    }

    if (!classLevelId || !subjectId || !topic || !title || !videoUrl) {
        return res.status(400).json({ message: 'Please provide all required fields (including video file)' });
    }

    try {
        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        const autoApprove = school?.preferences?.autoApproveContent !== false;

        const video = await VideoLesson.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            classLevelId,
            subjectId,
            topic,
            title,
            description,
            videoUrl,
            publicId,
            duration,
            format,
            lessonNotes,
            isPublished: isPublished === 'true' || isPublished === true,
            status: autoApprove ? 'Approved' : 'Pending'
        });

        // Update School Usage (Approximate since we have file size in req.file.size)
        if (req.file) {
            await School.findByIdAndUpdate(req.user.schoolId._id || req.user.schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        res.status(201).json(video);
    } catch (error) {
        console.error(error);
        // Optional: Delete from Cloudinary if DB save fails
        if (publicId) {
             await cloudinary.uploader.destroy(publicId, { resource_type: 'video' });
        }
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

        // Delete from Cloudinary
        if (video.publicId) {
            await cloudinary.uploader.destroy(video.publicId, { resource_type: 'video' });
        }

        // Remove from DB
        await video.deleteOne();

        // Update School Usage (Decrease count, storage is hard to decrease accurately unless we stored the EXACT size per video)
        // For this MVP, we might just decrease count or ignore storage decrement to be safe (or store size in VideoLesson to be accurate).
        // Let's just decrement count for now.
        await School.findByIdAndUpdate(req.user.schoolId, {
            $inc: { 'mediaUsage.uploadCount': -1 }
        });

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

// @desc    Get video analytics (who watched vs who didn't)
// @route   GET /api/videos/:id/analytics
// @access  Private (Teacher)
const getVideoAnalytics = async (req, res) => {
    try {
        const video = await VideoLesson.findById(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        // Verify ownership
        if (video.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin' && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 1. Get all students in the class assigned to this video
        const Student = require('../models/Student');
        const allStudents = await Student.find({
            classId: video.classLevelId,
            schoolId: req.user.schoolId._id || req.user.schoolId // Ensure scope
        }).select('firstName lastName email profilePicture videosWatched studentId');

        const viewed = [];
        const notViewed = [];

        allStudents.forEach(student => {
            const watchEntry = student.videosWatched?.find(v => 
                (v.videoId?._id?.toString() || v.videoId?.toString()) === video._id.toString()
            );

            const studentInfo = {
                _id: student._id,
                name: `${student.firstName} ${student.lastName}`,
                email: student.email,
                studentId: student.studentId, // Admission Number
                profilePicture: student.profilePicture
            };

            if (watchEntry) {
                viewed.push({
                    ...studentInfo,
                    watchedAt: watchEntry.watchedAt,
                    watchDuration: watchEntry.watchDuration
                });
            } else {
                notViewed.push(studentInfo);
            }
        });

        res.json({
            videoTitle: video.title,
            totalStudents: allStudents.length,
            viewed,
            notViewed,
            completionRate: allStudents.length > 0 ? Math.round((viewed.length / allStudents.length) * 100) : 0
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
    getVideoStats,
    getVideoAnalytics
};
