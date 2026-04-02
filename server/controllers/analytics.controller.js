const VideoProgress = require('../models/VideoProgress');
const Submission = require('../models/Submission');
const User = require('../models/User');
const LessonPlan = require('../models/LessonPlan');
const VideoLesson = require('../models/VideoLesson');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const ClassLevel = require('../models/ClassLevel');
const Student = require('../models/Student');

const getLearningStats = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        // 1. Platform Core Usage
        const totalStudents = await User.countDocuments({ schoolId, role: 'student' });
        const activeTeachers = await User.countDocuments({ schoolId, role: 'teacher' });
        const totalLessons = await LessonPlan.countDocuments({ schoolId });
        const totalVideos = await VideoLesson.countDocuments({ schoolId });

        // 2. Holistic Academic Intelligence
        // Define active as having any VideoProgress, Submission, or Attendance record in the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [watcherIds, submitterIds, attendeeIds] = await Promise.all([
            VideoProgress.distinct('studentId', { schoolId, updatedAt: { $gte: thirtyDaysAgo } }),
            Submission.distinct('studentId', { schoolId, createdAt: { $gte: thirtyDaysAgo } }),
            Attendance.aggregate([
                { $match: { schoolId, date: { $gte: thirtyDaysAgo } } },
                { $unwind: "$records" },
                { $match: { "records.status": "Present" } },
                { $group: { _id: "$records.studentId" } }
            ])
        ]);

        const allActiveIds = new Set([
            ...watcherIds.map(id => id.toString()),
            ...submitterIds.map(id => id.toString()),
            ...attendeeIds.map(a => a._id.toString())
        ]);

        const activeStudents = allActiveIds.size;
        const totalSubmissions = await Submission.countDocuments({ schoolId });
        const passedSubmissions = await Submission.countDocuments({ schoolId, passed: true });
        const totalProgress = await VideoProgress.countDocuments({ schoolId });
        const completedProgress = await VideoProgress.countDocuments({ schoolId, completed: true });

        // 3. Attendance Horizon (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const attendanceTrends = await Attendance.aggregate([
            { $match: { schoolId, date: { $gte: sevenDaysAgo } } },
            { $unwind: "$records" },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
                total: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        const attendanceChart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = attendanceTrends.find(a => a._id === dateStr);
            attendanceChart.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                date: dateStr,
                rate: found ? Math.round((found.present / found.total) * 100) : 0
            });
        }

        // Attendance Fidelity (Highest/Lowest Classes) - REAL DATA
        const classAttendance = await Attendance.aggregate([
            { $match: { schoolId, date: { $gte: sevenDaysAgo } } },
            { $unwind: "$records" },
            { $group: {
                _id: "$classId",
                present: { $sum: { $cond: [{ $eq: ["$records.status", "Present"] }, 1, 0] } },
                total: { $sum: 1 }
            }},
            { $project: {
                rate: { $multiply: [{ $divide: ["$present", "$total"] }, 100] }
            }},
            { $sort: { rate: -1 } }
        ]);

        await ClassLevel.populate(classAttendance, { path: '_id', select: 'name' });
        const fidelity = {
            highest: classAttendance.length > 0 ? { name: classAttendance[0]._id?.name || 'N/A', rate: Math.round(classAttendance[0].rate) } : { name: 'None', rate: 0 },
            lowest: classAttendance.length > 1 ? { name: classAttendance[classAttendance.length - 1]._id?.name || 'N/A', rate: Math.round(classAttendance[classAttendance.length - 1].rate) } : null
        };

        // 4. Financial Vector (Success vs Growth)
        const firstDayOfCurrentMonth = new Date();
        firstDayOfCurrentMonth.setDate(1);
        firstDayOfCurrentMonth.setHours(0, 0, 0, 0);

        const firstDayOfLastMonth = new Date(firstDayOfCurrentMonth);
        firstDayOfLastMonth.setMonth(firstDayOfLastMonth.getMonth() - 1);

        const [currentMonthRev, lastMonthRev] = await Promise.all([
            FeePayment.aggregate([
                { $match: { school: schoolId, status: 'success', createdAt: { $gte: firstDayOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            FeePayment.aggregate([
                { $match: { school: schoolId, status: 'success', createdAt: { $gte: firstDayOfLastMonth, $lt: firstDayOfCurrentMonth } } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ])
        ]);

        const currentTotal = currentMonthRev[0]?.total || 0;
        const lastTotal = lastMonthRev[0]?.total || 0;
        const revenueGrowth = lastTotal > 0 ? Math.round(((currentTotal - lastTotal) / lastTotal) * 100) : 0;

        const financialSummary = await FeePayment.aggregate([
            { $match: { school: schoolId, status: 'success' } },
            { $group: {
                _id: null,
                totalRevenue: { $sum: "$amount" },
                transactionCount: { $sum: 1 }
            }}
        ]);

        const revenueByStatus = await FeePayment.aggregate([
            { $match: { school: schoolId } },
            { $group: {
                _id: "$status",
                count: { $sum: 1 },
                amount: { $sum: "$amount" }
            }}
        ]);

        // 5. Engagement Overview (Combined)
        const engagementAgg = await VideoProgress.aggregate([
            { $match: { schoolId, updatedAt: { $gte: sevenDaysAgo } } },
            { $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" } },
                count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
        ]);

        const engagementChart = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const found = engagementAgg.find(e => e._id === dateStr);
            engagementChart.push({
                name: d.toLocaleDateString('en-US', { weekday: 'short' }),
                value: found ? found.count : 0
            });
        }

        // 6. Real-time Activity Log (Enhanced)
        const recentVideos = await VideoProgress.find({ schoolId })
            .sort({ updatedAt: -1 })
            .limit(10)
            .populate('studentId', 'firstName lastName')
            .populate('videoId', 'title');

        const recentSubmissions = await Submission.find({ schoolId })
            .sort({ submittedAt: -1 })
            .limit(10)
            .populate('studentId', 'firstName lastName')
            .populate('quizId', 'title');

        const recentUsers = await User.find({ schoolId })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('firstName lastName role createdAt');

        let activityLog = [
            ...recentVideos.map(v => ({
                id: v._id,
                type: 'video',
                title: v.videoId?.title || 'Unknown Video',
                user: v.studentId ? `${v.studentId.firstName} ${v.studentId.lastName}` : 'Unknown Student',
                date: v.updatedAt,
                details: v.completed ? 'Completed Milestone' : 'In Progress'
            })),
            ...recentSubmissions.map(s => ({
                id: s._id,
                type: 'quiz',
                title: s.quizId?.title || 'Unknown Quiz',
                user: s.studentId ? `${s.studentId.firstName} ${s.studentId.lastName}` : 'Unknown Student',
                date: s.submittedAt || s.createdAt,
                details: `${s.score}% Score`
            })),
            ...recentUsers.map(u => ({
                id: u._id,
                type: 'user',
                title: u.role === 'student' ? 'New Student Enrollment' : 'New Staff Registration',
                user: `${u.firstName} ${u.lastName}`,
                date: u.createdAt,
                details: `Joined Platform`
            }))
        ];
        activityLog.sort((a, b) => new Date(b.date) - new Date(a.date));
        activityLog = activityLog.slice(0, 15);

        const stats = {
            platformUsage: {
                teachers: activeTeachers,
                students: totalStudents,
                lessonPlans: totalLessons,
                videoLessons: totalVideos
            },
            academic: {
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
            attendance: {
                dailyRate: attendanceChart[attendanceChart.length - 1]?.rate || 0,
                chart: attendanceChart,
                fidelity
            },
            finance: {
                totalRevenue: financialSummary[0]?.totalRevenue || 0,
                transactions: financialSummary[0]?.transactionCount || 0,
                revenueGrowth,
                statusDistribution: revenueByStatus.map(s => ({ name: s._id, value: s.amount }))
            },
            engagementChart,
            activityLog
        };

        res.json(stats);
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Intelligence computation failed' });
    }
};

const getExportData = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        // 1. Raw Financial Ledger
        const financials = await FeePayment.find({ school: schoolId })
            .populate('student', 'firstName lastName studentId classId')
            .sort({ createdAt: -1 });

        await ClassLevel.populate(financials, { path: 'student.classId', select: 'name' });

        // 2. Raw Academic Ledger Roster (Per Student)
        const students = await Student.find({ schoolId, status: 'active' })
            .populate('classId', 'name')
            .select('firstName lastName studentId classId level')
            .lean();

        // Aggregate stats for each student efficiently
        const [allSubmissions, allProgress] = await Promise.all([
            Submission.find({ schoolId }).select('studentId passed score'),
            VideoProgress.find({ schoolId }).select('studentId completed')
        ]);

        const academicRoster = students.map(student => {
            // Map student to their user ID for matching with submissions/progress which use User IDs
            // Wait, Student model has userId field.
            const userIdStr = student.userId?.toString();
            
            const studentSubmissions = allSubmissions.filter(s => s.studentId?.toString() === userIdStr);
            const studentProgress = allProgress.filter(p => p.studentId?.toString() === userIdStr);
            
            const totalQuizzes = studentSubmissions.length;
            const passedQuizzes = studentSubmissions.filter(s => s.passed).length;
            const totalVideos = studentProgress.length;
            const completedVideos = studentProgress.filter(p => p.completed).length;

            return {
                ...student,
                videoCompletionRate: totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0,
                quizzesPassed: passedQuizzes,
                quizzesAttempted: totalQuizzes,
                riskLevel: (totalVideos > 0 && (completedVideos/totalVideos) < 0.2) ? 'At-Risk' : 'Thriving'
            };
        });

        // 3. Platform Activity Ledger (Expanded)
        const recentVideos = await VideoProgress.find({ schoolId })
            .sort({ updatedAt: -1 })
            .limit(50)
            .populate('studentId', 'name email') // User model uses 'name'
            .populate('videoId', 'title');

        const recentSubmissions = await Submission.find({ schoolId })
            .sort({ submittedAt: -1 })
            .limit(50)
            .populate('studentId', 'name email')
            .populate('quizId', 'title');

        const platformActivity = [
            ...recentVideos.map(v => ({
                timestamp: v.updatedAt,
                user: v.studentId?.name || 'Unknown Student',
                role: 'Student',
                action: 'Video Engagement',
                details: `${v.videoId?.title || 'Unknown Video'} - ${v.completed ? 'Completed' : 'In Progress'}`
            })),
            ...recentSubmissions.map(s => ({
                timestamp: s.submittedAt || s.createdAt,
                user: s.studentId?.name || 'Unknown Student',
                role: 'Student',
                action: 'Quiz Assessment',
                details: `${s.quizId?.title || 'Unknown Quiz'} - Score: ${s.score}%`
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        res.json({
            financials,
            academicRoster,
            platformActivity
        });

    } catch (error) {
        console.error('Export Data Error:', error);
        res.status(500).json({ message: 'Failed to compile export data' });
    }
};

module.exports = {
    getLearningStats,
    getExportData
};
