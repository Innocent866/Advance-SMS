import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    BookOpen, 
    Clock, 
    CheckCircle, 
    Activity, 
    Zap, 
    Cpu, 
    Hash, 
    CreditCard, 
    ArrowUpRight, 
    ShieldCheck, 
    TrendingUp,
    LayoutDashboard,
    Calendar,
    Award,
    Dna,
    Terminal
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import api from '../utils/api';
import Loader from '../components/Loader';

const TelemetryNode = ({ label, value, icon: Icon, color, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center group hover:shadow-2xl hover:y-[-8px] transition-all duration-500"
    >
        <div className={`p-4 rounded-2xl bg-${color}-50 text-${color}-600 mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-inner`}>
            <Icon size={28} />
        </div>
        <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
            <h3 className="text-3xl font-black text-slate-900 tabular-nums">{value !== undefined ? value : '-'}</h3>
        </div>
    </motion.div>
);

const ParentDashboard = () => {
    usePageTitle('Parent Dashboard');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/parents/dashboard');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <Loader fullScreen={true} />;
    if (!data) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center text-red-500">
             <Terminal size={64} className="mb-4 opacity-20" />
             <h3 className="text-xl font-black uppercase tracking-widest">Connection Error</h3>
             <p className="text-xs font-bold text-slate-400 mt-2">Unable to connect to the school server.</p>
        </div>
    );

    const { student, stats } = data;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Neural Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col xl:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 flex-1 text-center xl:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Dna size={14} className="text-secondary" /> Parent Hub
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            My Child: <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-primary to-blue-400">
                                {student.firstName} {student.lastName}
                            </span>
                        </h1>
                        <div className="flex flex-wrap items-center justify-center xl:justify-start gap-4">
                            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-3xl rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                <LayoutDashboard size={12} className="text-secondary" /> {student.classId?.name || 'Class Unassigned'}
                            </div>
                            <div className="h-1 w-1 bg-white/20 rounded-full" />
                            <div className="flex items-center gap-2 text-white/60 text-[10px] font-black uppercase tracking-widest">
                                <Hash size={12} /> {student.studentId}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-6 bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 w-full xl:w-auto shadow-2xl group">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-500/20 flex items-center justify-center p-2 group-hover:rotate-12 transition-transform duration-500">
                                <div className="w-full h-full bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400">
                                    <ShieldCheck size={40} />
                                </div>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-slate-900 animate-ping" />
                        </div>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-1">Status: Active</p>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Account Verified</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Telemetry Node Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <TelemetryNode 
                    label="School Attendance" 
                    value={`${stats?.attendance || 0}%`} 
                    icon={Activity} 
                    color="emerald" 
                    delay={0.1}
                />
                <TelemetryNode 
                    label="Assignments" 
                    value={stats?.tasksCompleted || 0} 
                    icon={Cpu} 
                    color="primary" 
                    delay={0.2}
                />
                <TelemetryNode 
                    label="Lessons Watched" 
                    value={stats?.videosWatched || 0} 
                    icon={Clock} 
                    color="indigo" 
                    delay={0.3}
                />
                <TelemetryNode 
                    label="Student ID" 
                    value={student.studentId} 
                    icon={Zap} 
                    color="amber" 
                    delay={0.4}
                />
            </div>

            {/* Tactical Console (Quick Actions) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 p-12 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Terminal size={200} />
                </div>
                
                <div className="flex flex-col lg:flex-row justify-between items-center gap-12 relative z-10">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight italic mb-2">Quick <span className="text-primary">Actions</span></h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Select an action below</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full lg:w-auto">
                        <motion.a 
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            href="/parent/payments" 
                            className="flex items-center justify-between gap-6 bg-slate-900 text-white px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 hover:shadow-emerald-200 transition-all group"
                        >
                            <CreditCard size={18} className="text-emerald-400 group-hover:text-white" /> Pay Fees <ArrowUpRight size={16} />
                        </motion.a>
                        
                        <motion.a 
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            href="/parent/results" 
                            className="flex items-center justify-between gap-6 bg-white border-2 border-slate-100 text-slate-900 px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:border-primary hover:text-primary transition-all group"
                        >
                            <Award size={18} className="text-slate-400 group-hover:text-primary" /> Reports <ArrowUpRight size={16} />
                        </motion.a>

                        <motion.a 
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            href="/parent/attendance" 
                            className="flex items-center justify-between gap-6 bg-white border-2 border-slate-100 text-slate-900 px-8 py-6 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:border-indigo-600 hover:text-indigo-600 transition-all group"
                        >
                            <Calendar size={18} className="text-slate-400 group-hover:text-indigo-600" /> Attendance <ArrowUpRight size={16} />
                        </motion.a>
                    </div>
                </div>
            </motion.div>

            {/* Matrix Decorative Elements */}
            <div className="mt-20 flex justify-center opacity-[0.05] grayscale">
                <Dna size={40} className="mx-8 animate-pulse" />
                <Terminal size={40} className="mx-8" />
                <Zap size={40} className="mx-8 animate-bounce-slow" />
                <Activity size={40} className="mx-8" />
            </div>
        </div>
    );
};

export default ParentDashboard;
