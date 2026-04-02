import { useAuth } from '../context/AuthContext';
import { 
    BookOpen, 
    Video, 
    CheckCircle, 
    Clock, 
    User, 
    Trophy, 
    PlayCircle, 
    UserPlus, 
    Zap, 
    Binary, 
    ChevronRight, 
    ArrowUpRight, 
    Star, 
    Cpu, 
    Activity,
    Layers,
    Gamepad2,
    Search
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import AddParentModal from '../components/AddParentModal';

const StatCard = ({ label, value, icon: Icon, color, to, delay }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay }}
    >
        <Link to={to} className="block group h-full">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-indigo-200/40 h-full">
                <div className={`p-4 rounded-3xl mb-4 transition-all group-hover:rotate-6 shadow-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
                <h3 className="text-lg font-black text-slate-800 group-hover:text-primary transition-colors">{value}</h3>
            </div>
        </Link>
    </motion.div>
);

const StudentDashboard = () => {
    usePageTitle('My Dashboard');
    const { user } = useAuth();
    const [studentData, setStudentData] = useState(null);
    const [isParentModalOpen, setIsParentModalOpen] = useState(false);

    const fetchStudentProfile = async () => {
        try {
            const res = await api.get('/students/me');
            setStudentData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchStudentProfile();
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Learning Journey Hero */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-80 -mt-80" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Student Hub
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Hi, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">{user?.name?.split(' ')[0] || 'Learner'}</span> 👋
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Welcome back to your learning hub. Your classes and materials are ready.
                        </p>
                    </div>

                    <div className="hidden lg:flex flex-col gap-4">
                        <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6">
                            <div className="p-4 bg-primary/20 rounded-2xl text-primary">
                                <Trophy size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black">{user?.classId?.name || '1'}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">My Class</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Academic Quest Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <StatCard 
                    label="Learning" 
                    value="Video Lessons" 
                    icon={Video} 
                    color="bg-purple-600 shadow-purple-500/30" 
                    to="/videos" 
                    delay={0.1}
                />
                <StatCard 
                    label="Status" 
                    value="Assignments" 
                    icon={CheckCircle} 
                    color="bg-orange-600 shadow-orange-500/30" 
                    to="/student-submissions" 
                    delay={0.2}
                />
                <StatCard 
                    label="History" 
                    value="Attendance" 
                    icon={Clock} 
                    color="bg-blue-600 shadow-blue-500/30" 
                    to="/student-history" 
                    delay={0.3}
                />
                <StatCard 
                    label="Profile" 
                    value="My Account" 
                    icon={User} 
                    color="bg-emerald-600 shadow-emerald-500/30" 
                    to="/student-profile" 
                    delay={0.4}
                />
            </div>

            {/* Parent Proxy Section */}
            <div className="relative group mb-16 overflow-hidden bg-slate-900 rounded-[3.5rem] p-1 shadow-3xl shadow-indigo-900/40">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative bg-slate-900/90 backdrop-blur-3xl rounded-[3.4rem] p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex items-center gap-8">
                        <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/10 text-primary shadow-2xl">
                            <UserPlus size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-white tracking-tight">Parent Account</h3>
                            <p className="text-slate-400 font-medium max-w-lg leading-relaxed">
                                {studentData?.parentName 
                                    ? `Linked with ${studentData.parentName}` 
                                    : "Link your account to your parent or guardian to manage fees and view results."}
                            </p>
                        </div>
                    </div>
                    <div>
                    {studentData?.parentName ? (
                            <div className="flex items-center gap-4 bg-emerald-500/10 text-emerald-400 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-xs border border-emerald-500/20 shadow-xl shadow-emerald-500/10">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                LINKED
                            </div>
                    ) : (
                            <motion.button 
                                onClick={() => setIsParentModalOpen(true)}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-white text-slate-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-slate-50 transition-all flex items-center gap-3"
                            >
                                <UserPlus size={18} />
                                Link Parent
                            </motion.button>
                    )}
                    </div>
                </div>
            </div>

            <AddParentModal 
                isOpen={isParentModalOpen} 
                onClose={() => setIsParentModalOpen(false)} 
                onSuccess={fetchStudentProfile}
                studentId={studentData?._id}
            />

            {/* Quest Progress / Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Pedagogical Stream */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                                <Layers size={24} />
                            </div>
                            Recent Lessons
                        </h3>
                        <Link to="/videos" className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:gap-4 transition-all">
                            View All <ArrowUpRight size={14} />
                        </Link>
                    </div>
                    
                    <div className="bg-slate-50 rounded-[3.5rem] p-16 text-center border-2 border-dashed border-slate-200/60 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="relative transition-transform group-hover:scale-105 duration-700">
                            <PlayCircle size={64} className="mx-auto text-slate-300 mb-6" />
                            <h4 className="text-2xl font-black text-slate-400 mb-2 tracking-tight">No Active Lesson</h4>
                            <p className="text-slate-400 font-bold max-w-sm mx-auto mb-8">You haven't started any video lessons yet. Open a lesson to begin learning.</p>
                            <Link to="/videos" className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] inline-flex items-center gap-3 font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-black transition-all">
                                Open Lessons <Search size={16} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Motivational Intel Dashlet */}
                <div className="space-y-8">
                    <div className="bg-indigo-950 rounded-[3.5rem] p-10 text-white shadow-3xl shadow-indigo-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
                            <div className="p-3 bg-white/10 rounded-2xl text-primary"><Star size={18} /></div>
                            Student Tips
                        </h3>
                        <p className="font-medium text-slate-400 leading-relaxed italic mb-8">
                            "Consistency is the key to success. Try to watch one video lesson every day to stay ahead."
                        </p>
                        
                        <div className="bg-white/5 rounded-3xl p-8 border border-white/10 backdrop-blur-3xl">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">My Class</p>
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-primary/20 rounded-xl text-primary">
                                    <Gamepad2 size={24} />
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-white">{user?.classId?.name || 'Loading...'}</p>
                                    <p className="text-[10px] font-bold text-slate-400">Current Level</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/10">
                            <Link to="/student-results" className="w-full bg-white text-indigo-900 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                                View Results <Activity size={14} />
                            </Link>
                        </div>
                    </div>
                    
                    <div className="bg-primary p-1 rounded-[3.5rem] shadow-xl shadow-primary/20">
                        <div className="bg-white rounded-[3.4rem] p-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <Star size={24} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">Study Help</h4>
                            <p className="text-xs font-semibold text-slate-400 mb-6">Unlock extra materials and AI tools to help with your studies.</p>
                            <button className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group hover:gap-4 transition-all">
                                View Options <Zap size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default StudentDashboard;
