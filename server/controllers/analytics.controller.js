const VideoProgress = require('../models/VideoProgress');
const Submission = require('../models/Submission');
const User = require('../models/User');
const LessonPlan = require('../models/LessonPlan');
const VideoLesson = require('../models/VideoLesson');
const Attendance = require('../models/Attendance');
const FeePayment = require('../models/FeePayment');
const ClassLevel = require('../models/ClassLevel');

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

module.exports = {
    getLearningStats
};
