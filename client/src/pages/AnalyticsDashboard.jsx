import { useState, useEffect } from 'react';
import api from '../utils/api';
import { BarChart2, Users, FileText, CheckCircle, PlayCircle, Download } from 'lucide-react';

const AnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const downloadReport = () => {
        if (!stats) return;

        const date = new Date().toISOString().split('T')[0];
        const rows = [
            ['Metric', 'Value'],
            ['Date', date],
            ['', ''],
            ['--- Platform Usage ---', ''],
            ['Total Students', stats.platformUsage?.students],
            ['Active Teachers', stats.platformUsage?.teachers],
            ['Lesson Plans Created', stats.platformUsage?.lessonPlans],
            ['Video Lessons Uploaded', stats.platformUsage?.videoLessons],
            ['', ''],
            ['--- Student Performance ---', ''],
            ['Active Learners (Video)', stats.learning?.activeStudents],
            ['Participation Rate', `${stats.learning?.participationRate}%`],
            ['Video Completion Rate', `${stats.learning?.videoStats?.completionRate}%`],
            ['Quizzes Taken', stats.learning?.quizStats?.total],
            ['Quiz Pass Rate', `${stats.learning?.quizStats?.passRate}%`]
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `school_report_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div>Loading Analytics...</div>;

    const s = stats?.learning || {};
    const p = stats?.platformUsage || {};

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <BarChart2 /> Analytics & Reports
                </h1>
                <button 
                    onClick={downloadReport}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors"
                >
                    <Download size={18} /> Export Report
                </button>
            </div>

            {/* Platform Overview */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                 <MiniStat label="Total Students" value={p.students || 0} />
                 <MiniStat label="Teachers" value={p.teachers || 0} />
                 <MiniStat label="Lesson Plans" value={p.lessonPlans || 0} />
                 <MiniStat label="Video Lessons" value={p.videoLessons || 0} />
            </div>

            {/* Learning Stats */}
            <h3 className="font-bold text-gray-700 mb-4">Student Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                 <StatCard 
                    icon={<Users className="text-blue-500" />} 
                    label="Active Learners" 
                    value={`${s.activeStudents || 0} / ${p.students || 0}`}
                    sub={`${s.participationRate}% Participation`}
                    color="blue"
                />
                 <StatCard 
                    icon={<PlayCircle className="text-purple-500" />} 
                    label="Video Engagement" 
                    value={`${s.videoStats?.totalCompleted || 0}`}
                    sub={`${s.videoStats?.completionRate}% Completion Rate`}
                    color="purple"
                />
                 <StatCard 
                    icon={<FileText className="text-orange-500" />} 
                    label="Total Quizzes" 
                    value={s.quizStats?.total || 0}
                    sub="Submissions"
                    color="orange"
                />
                 <StatCard 
                    icon={<CheckCircle className="text-green-500" />} 
                    label="Pass Rate" 
                    value={`${s.quizStats?.passRate}%`}
                    sub={`${s.quizStats?.passed} Passed`}
                    color="green"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4">Engagement Overview</h3>
                    <div className="flex items-center justify-center h-48 bg-gray-50 rounded text-gray-400">
                        Chart Placeholder (Recharts Integration)
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="font-bold text-gray-700 mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        <div className="text-sm text-gray-500 italic">No recent activity logs available.</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MiniStat = ({ label, value }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-bold text-gray-800">{value}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold mt-1">{label}</div>
    </div>
);

const StatCard = ({ icon, label, value, sub, color }) => (
    <div className={`bg-white p-6 rounded-xl border-t-4 border-${color}-500 shadow-sm`}>
        <div className="flex justify-between items-start mb-4">
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            </div>
            <div className={`p-2 bg-${color}-50 rounded-lg`}>{icon}</div>
        </div>
        <div className="text-xs font-medium text-gray-400">{sub}</div>
    </div>
);

export default AnalyticsDashboard;
