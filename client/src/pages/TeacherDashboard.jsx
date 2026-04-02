import { useAuth } from '../context/AuthContext';
import { 
    BookOpen, 
    Video, 
    Users, 
    CheckCircle, 
    Clock, 
    User, 
    Zap, 
    ChevronRight, 
    Star, 
    LayoutGrid, 
    Binary, 
    ArrowUpRight,
    Terminal,
    GraduationCap,
    Clock3,
    Activity,
    Cpu,
    BookMarked,
    Microscope
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const StatCard = ({ label, value, icon: Icon, color, to, description, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
    >
        <Link to={to} className="group block h-full">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-indigo-200/40 h-full">
                <div className={`p-4 rounded-2xl mb-4 transition-all group-hover:rotate-6 shadow-lg ${color}`}>
                    <Icon size={24} className="text-white" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{value}</h3>
                <p className="text-[10px] font-bold text-slate-400 mt-auto">{description}</p>
            </div>
        </Link>
    </motion.div>
);

const TeacherDashboard = () => {
    usePageTitle('Teacher Dashboard');
    const { user } = useAuth();

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Instructional Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-80 -mt-80" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Teacher Dashboard
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Welcome Back, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">{user?.name?.split(' ')[0] || 'Educator'}</span> 🍎
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Your main hub for managing classes, lessons, and students.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center group hover:bg-white/10 transition-all">
                            <Activity className="text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" size={28} />
                            <p className="text-2xl font-black">Active</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">System Status</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center group hover:bg-white/10 transition-all">
                            <Clock3 className="text-indigo-400 mx-auto mb-4 group-hover:scale-110 transition-transform" size={28} />
                            <p className="text-2xl font-black">Ready</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">My Classes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats / Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
                <StatCard 
                    label="Students" 
                    value="My Students" 
                    icon={Users} 
                    color="bg-blue-600" 
                    to="/my-students" 
                    description="View your students"
                    delay={0.1}
                />
                <StatCard 
                    label="Academic" 
                    value="Lesson Plans" 
                    icon={BookOpen} 
                    color="bg-emerald-600" 
                    to="/lessons/create" 
                    description="Create lesson plans"
                    delay={0.2}
                />
                <StatCard 
                    label="Learning" 
                    value="Video Lessons" 
                    icon={Video} 
                    color="bg-indigo-600" 
                    to="/videos/manage" 
                    description="Manage video content"
                    delay={0.3}
                />
                <StatCard 
                    label="Profile" 
                    value="My Account" 
                    icon={User} 
                    color="bg-orange-600" 
                    to="/teacher-profile" 
                    description="Update your info"
                    delay={0.4}
                />
                <StatCard 
                    label="Grading" 
                    value="AI Marking" 
                    icon={Microscope} 
                    color="bg-purple-600" 
                    to="/teacher/ai-marking" 
                    description="Automated marking"
                    delay={0.5}
                />
            </div>

            {/* Hub Compartments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Intelligence Dashlet: Quick Actions */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4 px-4">
                        <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                            <Zap size={24} />
                        </div>
                        Quick Actions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        {[
                            { label: 'Create Lesson Plan', icon: BookMarked, color: 'text-blue-500', bg: 'bg-blue-50', to: '/lessons/create', action: 'NEW' },
                            { label: 'Upload Video', icon: Video, color: 'text-purple-500', bg: 'bg-purple-50', to: '/videos/manage', action: 'UPLOAD' },
                            { label: 'Mark Assignments', icon: CheckCircle, color: 'text-indigo-500', bg: 'bg-indigo-50', to: '/teacher/ai-marking', action: 'MARK' },
                            { label: 'View Reports', icon: Activity, color: 'text-emerald-500', bg: 'bg-emerald-50', to: '/staff/reports', action: 'REPORTS' }
                        ].map((action, i) => (
                            <Link key={i} to={action.to} className="group flex items-center justify-between p-6 bg-white border border-slate-100 rounded-[2rem] hover:shadow-2xl hover:shadow-indigo-100/50 hover:-translate-y-1 transition-all">
                                <span className="flex items-center gap-4 text-slate-700 font-black text-sm">
                                    <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:rotate-6 transition-all`}>
                                        <action.icon size={20} />
                                    </div>
                                    {action.label}
                                </span>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${action.color}`}>{action.action}</span>
                                    <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                        <ChevronRight size={16} />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Vertical Intel Dashlet: Tips & Motivation */}
                <div className="space-y-8">
                    <div className="bg-indigo-950 rounded-[3.5rem] p-10 text-white shadow-3xl shadow-indigo-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
                            <div className="p-3 bg-white/10 rounded-2xl text-primary"><Cpu size={18} /></div>
                            Teaching Tips
                        </h3>
                        
                        <div className="space-y-6 relative font-medium text-sm text-slate-400 leading-relaxed">
                            <p className="flex gap-4">
                                <Star size={18} className="text-primary shrink-0" />
                                Use AI to create detailed lesson notes in seconds.
                            </p>
                            <p className="flex gap-4">
                                <Star size={18} className="text-primary shrink-0" />
                                Upload video lessons to help students learn better visually.
                            </p>
                            <p className="flex gap-4">
                                <Star size={18} className="text-primary shrink-0" />
                                Keep your profile information updated for the school records.
                            </p>
                            
                            <div className="pt-8 border-t border-white/10">
                                <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Next Session</p>
                                    <p className="text-lg font-black text-white">Next Class</p>
                                    <p className="text-[10px] font-bold text-primary mt-1 flex items-center gap-2">
                                        <Clock size={12} /> 09:00 AM
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-500 p-1 rounded-[3.5rem] shadow-xl shadow-emerald-500/20">
                        <div className="bg-white rounded-[3.4rem] p-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-4">
                                <Terminal size={24} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">Systems Ready</h4>
                            <p className="text-xs font-semibold text-slate-400 mb-6">Your teaching tools are ready for use.</p>
                            <button className="text-emerald-500 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group hover:gap-4 transition-all">
                                Go to Hub <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default TeacherDashboard;
