import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    BarChart2, 
    Users, 
    FileText, 
    CheckCircle, 
    PlayCircle, 
    Download, 
    Activity, 
    Clock,
    TrendingUp,
    Trophy,
    Shield,
    DollarSign,
    Calendar,
    ChevronRight,
    ArrowUpRight,
    PieChart as PieChartIcon,
    Layers,
    MousePointer2
} from 'lucide-react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer, 
    AreaChart, 
    Area,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const AnalyticsDashboard = () => {
    usePageTitle('School Intelligence Center');
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/analytics');
                setStats(res.data);
            } catch (error) {
                console.error('Intelligence Fetch Failure:', error);
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
            ['Intelligence Dimension', 'Metric', 'Value'],
            ['Platform Usage', 'Total Students', stats.platformUsage?.students],
            ['Platform Usage', 'Active Teachers', stats.platformUsage?.teachers],
            ['Platform Usage', 'Lesson Plans', stats.platformUsage?.lessonPlans],
            ['Platform Usage', 'Video Content', stats.platformUsage?.videoLessons],
            ['', '', ''],
            ['Academic Performance', 'Active Students', stats.academic?.activeStudents],
            ['Academic Performance', 'Participation Rate', `${stats.academic?.participationRate}%`],
            ['Academic Performance', 'Quiz Pass Rate', `${stats.academic?.quizStats?.passRate}%`],
            ['Academic Performance', 'Video Completion', `${stats.academic?.videoStats?.completionRate}%`],
            ['', '', ''],
            ['Attendance', 'Target Daily Rate', `${stats.attendance?.dailyRate}%`],
            ['', '', ''],
            ['Finance', 'Total Revenue (Success)', `NGN ${stats.finance?.totalRevenue.toLocaleString()}`],
            ['Finance', 'Successful Transactions', stats.finance?.transactions]
        ];

        let csvContent = "data:text/csv;charset=utf-8," 
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `school_intelligence_report_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium tracking-wide">Synthesizing School Intelligence...</p>
        </div>
    );

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const p = stats?.platformUsage || {};
    const a = stats?.academic || {};
    const att = stats?.attendance || {};
    const f = stats?.finance || {};

    const tabs = [
        { id: 'overview', label: 'Intelligence Overview', icon: Activity },
        { id: 'academic', label: 'Academic Depth', icon: Trophy },
        { id: 'attendance', label: 'Attendance Horizon', icon: Calendar },
        { id: 'finance', label: 'Financial Vector', icon: DollarSign },
        { id: 'activity', label: 'Real-time Feed', icon: Clock },
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20 px-4 sm:px-6 lg:px-8"
        >
            {/* High-Fidelity Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        Intelligence Hub <span className="text-primary/40"><BarChart2 size={36} /></span>
                    </h1>
                    <p className="text-gray-500 font-medium mt-1 flex items-center gap-2">
                        <TrendingUp size={16} className="text-green-500" /> Real-time multi-dimensional school analytics
                    </p>
                </div>
                <div className="flex gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={downloadReport}
                        className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-xl hover:bg-black transition-all"
                    >
                        <Download size={18} /> EXPORT DATASETS
                    </motion.button>
                </div>
            </div>

            {/* Glassmorphic Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-10 p-2 bg-gray-100/50 backdrop-blur-md rounded-[2.5rem] border border-gray-200">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-3xl font-black text-sm transition-all ${
                            activeTab === tab.id 
                                ? 'bg-white text-primary shadow-lg border border-gray-100' 
                                : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'
                        }`}
                    >
                        <tab.icon size={18} />
                        {tab.label.toUpperCase()}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-10"
                >
                    {activeTab === 'overview' && (
                        <div className="space-y-10">
                            {/* Platform Broad Overview */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatsCard label="Total Students" value={p.students} icon={Users} color="blue" />
                                <StatsCard label="Academic Faculty" value={p.teachers} icon={Shield} color="indigo" />
                                <StatsCard label="Digital Assessments" value={a.quizStats?.total} icon={FileText} color="amber" />
                                <StatsCard label="Content Library" value={p.videoLessons} icon={PlayCircle} color="rose" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <Activity size={120} />
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-2">
                                        Engagement Velocity <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">Last 7 Days</span>
                                    </h3>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={stats?.engagementChart || []}>
                                                <defs>
                                                    <linearGradient id="colorEngage" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 11}} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 11}} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '16px' }}
                                                    cursor={{ stroke: '#6366f1', strokeWidth: 2 }}
                                                />
                                                <Area type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorEngage)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl">
                                    <h3 className="text-xl font-black text-gray-900 mb-8">Performance Distribution</h3>
                                    <div className="h-[300px] flex items-center justify-center">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={[
                                                        { name: 'Completed', value: a.videoStats?.totalCompleted },
                                                        { name: 'In Progress', value: a.videoStats?.totalStarted - a.videoStats?.totalCompleted },
                                                    ]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    <Cell fill="#6366f1" />
                                                    <Cell fill="#f1f5f9" />
                                                </Pie>
                                                <Tooltip />
                                                <Legend iconType="circle" />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <p className="text-3xl font-black text-gray-900">{a.videoStats?.completionRate}%</p>
                                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Global Completion Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'academic' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <DeepDiveCard 
                                title="Learner Participation" 
                                value={`${a.activeStudents} active`} 
                                subText={`${a.participationRate}% of total enrollment`}
                                icon={Users}
                                color="blue"
                            />
                            <DeepDiveCard 
                                title="Quiz Proficiency" 
                                value={`${a.quizStats?.passRate}%`} 
                                subText={`${a.quizStats?.passed} successful certifications`}
                                icon={Trophy}
                                color="amber"
                            />
                            <DeepDiveCard 
                                title="Curriculum Velocity" 
                                value={p.lessonPlans} 
                                subText="Active teaching modules"
                                icon={Layers}
                                color="indigo"
                            />
                            <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
                                <h3 className="text-2xl font-black text-gray-900 mb-8">Assessment Intelligence</h3>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart 
                                            data={[
                                                { name: 'Quiz Participation', count: a.quizStats?.total },
                                                { name: 'Certifications', count: a.quizStats?.passed },
                                                { name: 'Active Watchers', count: a.activeStudents },
                                            ]}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                                            <Tooltip 
                                                cursor={{fill: '#f8fafc'}}
                                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Bar dataKey="count" fill="#6366f1" radius={[12, 12, 0, 0]} barSize={60} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'attendance' && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl">
                                    <div className="flex justify-between items-center mb-8">
                                        <h3 className="text-2xl font-black text-gray-900">Weekly Presence</h3>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-black text-primary">{att.dailyRate}%</span>
                                            <span className="text-xs font-bold text-gray-400">TODAY</span>
                                        </div>
                                    </div>
                                    <div className="h-[300px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={att.chart || []}>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 700, fontSize: 12}} />
                                                <Tooltip 
                                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                                />
                                                <Line type="monotone" dataKey="rate" stroke="#10b981" strokeWidth={6} dot={{r: 6, fill: '#10b981', strokeWidth: 4, stroke: '#fff'}} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-center">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                    <h3 className="text-3xl font-black mb-4">Attendance Fidelity</h3>
                                    <p className="text-emerald-100 font-medium mb-8 max-w-sm">
                                        The school is operating at {att.dailyRate}% capacity today. 
                                        {att.fidelity?.highest?.rate > 0 && ` ${att.fidelity.highest.name} leads with ${att.fidelity.highest.rate}% presence.`}
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                                            <p className="text-2xl font-black">{att.fidelity?.highest?.rate || 0}%</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Highest ({att.fidelity?.highest?.name || 'N/A'})</p>
                                        </div>
                                        <div className="text-center bg-white/10 backdrop-blur-md rounded-2xl p-4 flex-1">
                                            <p className="text-2xl font-black">{att.fidelity?.lowest?.rate || 0}%</p>
                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Lowest ({att.fidelity?.lowest?.name || 'N/A'})</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'finance' && (
                        <div className="space-y-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                <DeepDiveCard 
                                    title="Total Collection" 
                                    value={`₦${f.totalRevenue?.toLocaleString()}`} 
                                    subText="Certified successful transactions"
                                    icon={DollarSign}
                                    color="emerald"
                                />
                                <DeepDiveCard 
                                    title="Transaction Vol" 
                                    value={f.transactions} 
                                    subText="Completed fee cycles"
                                    icon={ArrowUpRight}
                                    color="blue"
                                />
                                <DeepDiveCard 
                                    title="Revenue Growth" 
                                    value={f.revenueGrowth >= 0 ? `+${f.revenueGrowth}%` : `${f.revenueGrowth}%`} 
                                    subText="Month-over-month trajectory"
                                    icon={TrendingUp}
                                    color={f.revenueGrowth >= 0 ? "emerald" : "rose"}
                                />
                            </div>
                            <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                                <h3 className="text-2xl font-black text-gray-900 mb-8">Vault Distribution</h3>
                                <div className="h-[400px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={f.statusDistribution || []}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                                                outerRadius={140}
                                                fill="#8884d8"
                                                dataKey="value"
                                            >
                                                {f.statusDistribution?.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden p-10">
                            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                Real-time Intelligence Feed <span className="p-2 bg-rose-100 text-rose-600 rounded-lg animate-pulse"><Clock size={16} /></span>
                            </h3>
                            <div className="space-y-4">
                                {stats?.activityLog?.map((action, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={action.id} 
                                        className="flex items-center justify-between p-6 bg-gray-50/50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-lg transition-all"
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`p-4 rounded-2xl ${
                                                action.type === 'video' ? 'bg-blue-100 text-blue-600' : 
                                                action.type === 'quiz' ? 'bg-amber-100 text-amber-600' :
                                                'bg-purple-100 text-purple-600'
                                            }`}>
                                                {action.type === 'video' ? <PlayCircle size={24} /> : 
                                                 action.type === 'quiz' ? <FileText size={24} /> : <Users size={24} />}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900">{action.user}</p>
                                                <p className="text-xs font-bold text-gray-500 mt-0.5">{action.title} • {action.details}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{new Date(action.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            <p className="text-[10px] font-bold text-gray-300">{new Date(action.date).toLocaleDateString()}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
};

const StatsCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl relative overflow-hidden group hover:scale-[1.05] transition-all">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${color}-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`} />
        <div className={`w-12 h-12 rounded-2xl bg-${color}-50 flex items-center justify-center text-${color}-600 mb-6 group-hover:rotate-6 transition-transform`}>
            <Icon size={24} />
        </div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{value?.toLocaleString() || 0}</h3>
    </div>
);

const DeepDiveCard = ({ title, value, subText, icon: Icon, color }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-xl flex flex-col items-center text-center">
        <div className={`p-5 rounded-[1.5rem] bg-${color}-50 text-${color}-600 mb-6`}>
            <Icon size={32} />
        </div>
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
        <h3 className="text-3xl font-black text-gray-900 mb-2">{value}</h3>
        <p className="text-xs font-bold text-gray-500">{subText}</p>
    </div>
);

export default AnalyticsDashboard;
