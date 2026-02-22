const VideoProgress = require('../models/VideoProgress');
const Submission = require('../models/Submission');
const User = require('../models/User');

const LessonPlan = require('../models/LessonPlan');
const VideoLesson = require('../models/VideoLesson');

const getLearningStats = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        // 1. User Counts
        const totalStudents = await User.countDocuments({ schoolId, role: 'student' });
        const activeTeachers = await User.countDocuments({ schoolId, role: 'teacher' }); // Simplistic "active" check based on account existence for now

        // 2. Content Counts
        const totalLessons = await LessonPlan.countDocuments({ schoolId });
        const totalVideos = await VideoLesson.countDocuments({ schoolId });

        // 3. Active Students (those who have watched at least one video)
        const distinctWatchers = await VideoProgress.distinct('studentId', { schoolId });
        const activeStudents = distinctWatchers.length;

        // 4. Submissions
        const totalSubmissions = await Submission.countDocuments({ schoolId });
        const passedSubmissions = await Submission.countDocuments({ schoolId, passed: true });

        // 5. Video Completion Rate
        const totalProgress = await VideoProgress.countDocuments({ schoolId });
        const completedProgress = await VideoProgress.countDocuments({ schoolId, completed: true });
        
        // ... previous code ...
        
        // 6. Engagement Overview (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const engagementData = await VideoProgress.aggregate([
            { $match: { schoolId, updatedAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                videos: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);
        
        // Fill in missing days
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = engagementData.find(e => e._id === dateStr);
            chartData.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: dateStr,
                videos: found ? found.videos : 0,
                // Add quizzes if needed separately, or combine
            });
        }
        
        // 7. Recent Activity (Aggregated)
        // Fetch top 5 recent actions from different collections
        const recentVideos = await VideoProgress.find({ schoolId })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate('studentId', 'firstName lastName')
            .populate('videoId', 'title');

        const recentSubmissions = await Submission.find({ schoolId })
            .sort({ submittedAt: -1 })
            .limit(5)
            .populate('studentId', 'firstName lastName')
            .populate('quizId', 'title');

        // Combine and Sort
        let activityLog = [
            ...recentVideos.map(v => ({
                type: 'video',
                title: v.videoId?.title || 'Unknown Video',
                user: v.studentId ? `${v.studentId.firstName} ${v.studentId.lastName}` : 'Unknown Student',
                date: v.updatedAt,
                details: v.completed ? 'Completed video lesson' : 'Watched video lesson'
            })),
            ...recentSubmissions.map(s => ({
                type: 'quiz',
                title: s.quizId?.title || 'Unknown Quiz',
                user: s.studentId ? `${s.studentId.firstName} ${s.studentId.lastName}` : 'Unknown Student',
                date: s.submittedAt || s.createdAt,
                details: `Score: ${s.score}% - ${s.passed ? 'Passed' : 'Failed'}`
            }))
        ];

        // Sort combined list and take top 5
        activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
        activityLog = activityLog.slice(0, 5);

        const stats = {
            platformUsage: {
                teachers: activeTeachers,
                students: totalStudents,
                lessonPlans: totalLessons,
                videoLessons: totalVideos
            },
            learning: {
                activeStudents,
                participationRate: totalStudents ? Math.round((activeStudents / totalStudents) * 100) : 0,
                quizStats: {
                    total: totalSubmissions,
                    passed: passedSubmissions,
                    passRate: totalSubmissions ? Math.round((passedSubmissions / totalSubmissions) * 100) : 0
                },
                videoStats: {
                    totalStarted: totalProgress,
                    totalCompleted: completedProgress,
                    completionRate: totalProgress ? Math.round((completedProgress / totalProgress) * 100) : 0
                }
            },
            engagementChart: chartData,
            recentActivity: activityLog
        };

        res.json(stats);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getLearningStats
};
