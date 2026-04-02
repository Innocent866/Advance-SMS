import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, 
    CheckCircle, 
    XCircle, 
    Clock, 
    AlertCircle, 
    ChevronLeft, 
    Fingerprint, 
    Activity, 
    TrendingUp, 
    ShieldCheck, 
    UserCheck, 
    RefreshCw, 
    Zap,
    Hash,
    Layers,
    ArrowUpRight
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const ParentAttendance = () => {
    usePageTitle('Attendance');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/parents/child-attendance');
                setRecords(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch attendance", error);
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Present':
                return { 
                    bg: 'bg-emerald-50/50', 
                    text: 'text-emerald-600', 
                    border: 'border-emerald-100',
                    icon: <CheckCircle className="text-emerald-500" size={18} /> 
                };
            case 'Absent':
                return { 
                    bg: 'bg-rose-50/50', 
                    text: 'text-rose-600', 
                    border: 'border-rose-100',
                    icon: <XCircle className="text-rose-500" size={18} /> 
                };
            case 'Late':
                return { 
                    bg: 'bg-amber-50/50', 
                    text: 'text-amber-600', 
                    border: 'border-amber-100',
                    icon: <Clock className="text-amber-500" size={18} /> 
                };
            default:
                return { 
                    bg: 'bg-slate-50/50', 
                    text: 'text-slate-600', 
                    border: 'border-slate-100',
                    icon: <AlertCircle className="text-slate-500" size={18} /> 
                };
        }
    };

    if (loading) return <Loader fullScreen={true} />;

    const stats = {
        present: records.filter(r => r.status === 'Present').length,
        absent: records.filter(r => r.status === 'Absent').length,
        late: records.filter(r => r.status === 'Late').length,
        total: records.length
    };

    const attendanceRate = stats.total > 0 
        ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
        : 0;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Neural Attendance Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 flex-1 text-center md:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Fingerprint size={14} className="text-emerald-400" /> Attendance Records
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Attendance <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-primary to-blue-400">Reports</span>
                        </h1>
                        <p className="text-gray-400 text-lg font-medium max-w-xl">
                            Track your child's daily attendance and punctuality records.
                        </p>
                    </div>

                    <div className="flex flex-col items-center gap-4 bg-white/5 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-white/10 w-full md:w-auto shadow-2xl group">
                        <div className="relative">
                            <svg className="w-32 h-32 transform -rotate-90">
                                <circle 
                                    cx="64" cy="64" r="58" 
                                    className="text-white/5" 
                                    strokeWidth="10" fill="transparent" stroke="currentColor"
                                />
                                <motion.circle 
                                    cx="64" cy="64" r="58" 
                                    className="text-emerald-500" 
                                    strokeWidth="10" fill="transparent" 
                                    strokeDasharray={364.4}
                                    initial={{ strokeDashoffset: 364.4 }}
                                    animate={{ strokeDashoffset: 364.4 - (364.4 * attendanceRate) / 100 }}
                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                    stroke="currentColor" strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black tabular-nums">{attendanceRate}%</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400/60">Rate</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Attendance Summary</p>
                    </div>
                </div>
            </div>

            {/* Precision Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {[
                    { label: 'Present', value: stats.present, color: 'emerald', icon: ShieldCheck, sub: 'Total Days' },
                    { label: 'Absent', value: stats.absent, color: 'rose', icon: XCircle, sub: 'Total Days' },
                    { label: 'Late', value: stats.late, color: 'amber', icon: Clock, sub: 'Total Days' },
                    { label: 'Total Records', value: stats.total, color: 'primary', icon: Layers, sub: 'All Entries' }
                ].map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 group hover:shadow-2xl transition-all"
                    >
                        <div className={`p-4 bg-${stat.color}-50 text-${stat.color}-600 rounded-2xl w-fit mb-6 shadow-inner group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{stat.label}</p>
                        <h3 className="text-3xl font-black text-slate-900 tabular-nums mb-1">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-400">{stat.sub}</p>
                    </motion.div>
                ))}
            </div>

            {/* Attendance Registry Matrix */}
            <div className="bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="px-12 py-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Activity size={20} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">Attendance <span className="text-emerald-500">History</span></h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                        <RefreshCw size={14} className="animate-spin-slow" /> Records Synced
                    </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
                                <th className="px-12 py-6">Date</th>
                                <th className="px-12 py-6">Status</th>
                                <th className="px-12 py-6">Term / Session</th>
                                <th className="px-12 py-6">Marked By</th>
                                <th className="px-12 py-6">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence>
                                {records.length > 0 ? records.map((record, idx) => {
                                    const config = getStatusConfig(record.status);
                                    return (
                                        <motion.tr 
                                            key={record._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-slate-50 transition-colors group"
                                        >
                                            <td className="px-12 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900">
                                                        {new Date(record.date).toLocaleDateString('en-GB', { 
                                                            day: '2-digit', month: 'short', year: 'numeric' 
                                                        })}
                                                    </span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-6">
                                                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.text} border ${config.border} shadow-sm group-hover:scale-105 transition-transform`}>
                                                    {config.icon}
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-12 py-6">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-900 tracking-tight">
                                                        <Zap size={12} className="text-primary" /> {record.term}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                                        <Hash size={10} /> {record.session}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-inner group-hover:bg-primary group-hover:text-white transition-colors">
                                                        <UserCheck size={16} />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-700">{record.markedBy || 'Teacher'}</span>
                                                </div>
                                            </td>
                                            <td className="px-12 py-6">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[11px] font-medium text-slate-500 text-pretty max-w-xs italic">
                                                        {record.remark || 'No remarks.'}
                                                    </span>
                                                    <ArrowUpRight size={16} className="text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                }) : (
                                    <tr>
                                        <td colSpan="5" className="px-12 py-32 text-center text-slate-400">
                                            <div className="relative inline-block mb-6">
                                                <Calendar size={64} className="text-slate-100" />
                                                <AlertCircle size={24} className="text-slate-200 absolute -top-2 -right-2" />
                                            </div>
                                            <p className="text-lg font-black text-slate-900 tracking-tight mb-1">No Records</p>
                                            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">No attendance records found for this period.</p>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParentAttendance;
