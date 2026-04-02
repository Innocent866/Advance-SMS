import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    Search, 
    FileText, 
    Download, 
    TrendingUp, 
    Users, 
    AlertCircle, 
    CheckCircle2, 
    UserX, 
    Filter, 
    ChevronRight,
    Loader2,
    PieChart as PieIcon,
    BarChart3
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const AttendanceHistory = () => {
    usePageTitle('Attendance Reports');
    const { showNotification } = useNotification();

    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [arms, setArms] = useState([]);
    const [selectedArm, setSelectedArm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Data
    const [loading, setLoading] = useState(false);
    const [statsLoading, setStatsLoading] = useState(false);
    const [attendance, setAttendance] = useState(null);
    const [stats, setStats] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/academic/classes');
            setClasses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        setSelectedArm('');
        const cls = classes.find(c => c._id === classId);
        setArms(cls ? cls.arms : []); 
    };

    const handleSearch = async () => {
        if (!selectedClassId || !selectedArm) {
            showNotification('Please select a class and arm', 'error');
            return;
        }

        setLoading(true);
        setStatsLoading(true);
        try {
            // Fetch daily record
            const res = await api.get(`/attendance?classId=${selectedClassId}&arm=${selectedArm}&date=${date}`);
            setAttendance(res.data);
            
            // Fetch stats/trends
            const resStats = await api.get(`/attendance/stats?classId=${selectedClassId}&arm=${selectedArm}`);
            setStats(resStats.data);

            if (!res.data || !res.data.records || res.data.records.length === 0) {
                 showNotification('No attendance record found for this specific date.', 'info');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error fetching history', 'error');
        } finally {
            setLoading(false);
            setStatsLoading(false);
        }
    };

    const calculateDailyStats = () => {
        if (!attendance?.records) return { present: 0, absent: 0, late: 0, total: 0 };
        const total = attendance.records.length;
        const present = attendance.records.filter(r => r.status === 'Present').length;
        const absent = attendance.records.filter(r => r.status === 'Absent').length;
        const late = attendance.records.filter(r => r.status === 'Late').length;
        return { present, absent, late, total };
    };

    const dailyStats = calculateDailyStats();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="p-2 bg-indigo-600 rounded-lg text-white">
                            <TrendingUp size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Attendance</span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Attendance Reports</h1>
                    <p className="text-gray-500 font-medium mt-1">View attendance trends and track student absences.</p>
                </div>
                <button className="flex items-center gap-3 bg-white text-gray-700 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest border border-gray-100 shadow-sm hover:bg-gray-50 transition-all active:scale-95">
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            {/* Glassmorphic Filter Bar */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm mb-10 flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Date</label>
                    <div className="relative">
                        <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700"
                        />
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Class</label>
                    <div className="relative">
                        <BarChart3 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={selectedClassId} onChange={handleClassChange}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none"
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Arm</label>
                    <div className="relative">
                        <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <select 
                            value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none"
                        >
                            <option value="">Select Arm</option>
                            {arms.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
                        </select>
                    </div>
                </div>
                <button 
                    onClick={handleSearch}
                    disabled={loading}
                    className="w-full md:w-auto px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                    View Records
                </button>
            </div>

            <AnimatePresence mode="wait">
                {stats && !statsLoading && (
                    <motion.div 
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="space-y-10"
                    >
                        {/* Intelligence Tier 1: Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Attendance Rate', value: `${stats.overallPercentage}%`, sub: 'Past 30 Days', color: 'indigo', icon: TrendingUp },
                                { label: 'Present Today', value: dailyStats.present, sub: `Out of ${dailyStats.total}`, color: 'emerald', icon: CheckCircle2 },
                                { label: 'Absences', value: dailyStats.absent, sub: 'Marked today', color: 'rose', icon: UserX },
                                { label: 'Late Students', value: dailyStats.late, sub: 'Marked today', color: 'amber', icon: AlertCircle },
                            ].map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    variants={itemVariants}
                                    className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group"
                                >
                                    <div className={`p-3 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                        <stat.icon size={24} />
                                    </div>
                                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</h3>
                                    <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
                                    <p className="text-xs font-bold text-gray-400 mt-1">{stat.sub}</p>
                                    <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-150`}></div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Intelligence Tier 2: Chart & At-Risk Students */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Trend Chart */}
                            <motion.div 
                                variants={itemVariants}
                                className="lg:col-span-2 bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm h-[400px] flex flex-col"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <TrendingUp size={20} />
                                        </div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Attendance Trend</h3>
                                    </div>
                                    <span className="px-3 py-1 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full">30 Day Trend</span>
                                </div>
                                <div className="flex-1 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={stats.trends}>
                                            <defs>
                                                <linearGradient id="colorPercentage" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                                                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis 
                                                dataKey="date" 
                                                tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                            />
                                            <YAxis 
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                                                domain={[0, 100]}
                                                tickFormatter={(val) => `${val}%`}
                                            />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                labelStyle={{ fontWeight: 'black', color: '#1e293b', marginBottom: '4px' }}
                                                labelFormatter={(val) => new Date(val).toLocaleDateString()}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="percentage" 
                                                stroke="#4f46e5" 
                                                strokeWidth={4}
                                                fillOpacity={1} 
                                                fill="url(#colorPercentage)" 
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* Critical Alerts: At-Risk Students */}
                            <motion.div 
                                variants={itemVariants}
                                className="bg-white p-8 rounded-[3rem] border border-rose-100 shadow-sm h-[400px] flex flex-col relative overflow-hidden"
                            >
                                <div className="flex items-center gap-3 mb-6 relative z-10">
                                    <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                                        <AlertCircle size={20} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Absence Alerts</h3>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto space-y-4 pr-2 relative z-10">
                                    {stats.atRiskStudents.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <h4 className="font-black text-gray-900">All Clear</h4>
                                            <p className="text-xs text-gray-400 font-medium">No students identified as at-risk in this period.</p>
                                        </div>
                                    ) : (
                                        stats.atRiskStudents.map((student) => (
                                            <div key={student._id} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100/50 flex items-center gap-4 group hover:bg-rose-50 transition-colors">
                                                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {student.profilePicture ? (
                                                        <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-black text-rose-600">{student.firstName[0]}</span>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-black text-gray-900 truncate">{student.firstName} {student.lastName}</p>
                                                    <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{student.absences} Absences this month</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full -mr-16 -mt-16"></div>
                            </motion.div>
                        </div>

                        {/* Intelligence Tier 3: Detailed Table */}
                        <motion.div 
                            variants={itemVariants}
                            className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden"
                        >
                            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gray-50 text-gray-400 rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Student List</h3>
                                </div>
                                <span className="px-4 py-1.5 bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-gray-100">
                                    {dailyStats.total} Total Students
                                </span>
                            </div>

                            {attendance?.records?.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-[#F8FAFC]">
                                            <tr>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Student Profile</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Status</th>
                                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Identifier</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {attendance.records.map((record, i) => (
                                                <motion.tr 
                                                    key={i} 
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.1 + (i * 0.02) }}
                                                    className="hover:bg-gray-50 transition-colors group"
                                                >
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 text-sm overflow-hidden border-2 border-transparent group-hover:border-indigo-100 transition-all">
                                                                {record.studentId?.profilePicture ? (
                                                                    <img src={record.studentId.profilePicture} alt="" className="w-full h-full object-cover" />
                                                                ) : (
                                                                    record.studentId?.firstName[0]
                                                                )}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 tracking-tight">{record.studentId?.firstName} {record.studentId?.lastName}</p>
                                                                <p className="text-xs text-gray-400 font-bold">Regular Student</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                                            record.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                                                            record.status === 'Absent' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                                                            'bg-amber-50 text-amber-700 border-amber-100'
                                                        }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                                record.status === 'Present' ? 'bg-emerald-500' : 
                                                                record.status === 'Absent' ? 'bg-rose-500' : 'bg-amber-500'
                                                            }`}></div>
                                                            {record.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-right font-black text-gray-300 text-xs tracking-widest uppercase">
                                                        {record.studentId?.studentId}
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center p-24 bg-gray-50/30">
                                    <FileText className="mx-auto text-gray-200 mb-6" size={64} />
                                    <h3 className="text-2xl font-black text-gray-900">No Records Found</h3>
                                    <p className="text-gray-400 mt-2 font-medium max-w-sm mx-auto">No records found for the selected date. This might be a weekend or academic holiday.</p>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* Empty State / Initial View */}
                {!stats && !loading && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-24 bg-white rounded-[4rem] border-2 border-dashed border-gray-100"
                    >
                        <div className="w-32 h-32 bg-indigo-50 text-indigo-200 rounded-full flex items-center justify-center mx-auto mb-10">
                            <BarChart3 size={64} />
                        </div>
                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">Select Filters</h3>
                        <p className="text-gray-400 font-medium mt-3 max-w-sm mx-auto text-lg leading-relaxed">
                            Choose a class and arm to view the attendance report.
                        </p>
                        <div className="mt-10 flex justify-center gap-8">
                            {[
                                { label: '30D Trends', icon: TrendingUp },
                                { label: 'Absence Logs', icon: AlertCircle },
                                { label: 'Audit Export', icon: Download }
                            ].map((item) => (
                                <div key={item.label} className="flex flex-col items-center gap-2">
                                    <div className="p-3 bg-gray-50 text-gray-300 rounded-2xl">
                                        <item.icon size={20} />
                                    </div>
                                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AttendanceHistory;
