const VideoProgress = require('../models/VideoProgress');
const Submission = require('../models/Submission');
const User = require('../models/User');

const LessonPlan = require('../models/LessonPlan');
const VideoLesson = require('../models/VideoLesson');

const getLearningStats = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;

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
            }
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
