import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TeacherDashboard from './TeacherDashboard'; 
import StudentDashboard from './StudentDashboard';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';
import HouseParentDashboard from '../components/boarding/HouseParentDashboard';
import { 
    Users, 
    GraduationCap, 
    BookOpen, 
    Video, 
    Zap, 
    Clock, 
    ArrowUpRight, 
    ShieldCheck, 
    Activity, 
    Binary, 
    LayoutGrid, 
    ChevronRight,
    Search,
    RefreshCw,
    Plus,
    BarChart3,
    Calendar,
    Settings,
    Bell,
    CreditCard,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const StatCard = ({ label, value, icon: Icon, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="group bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-gray-100 flex flex-col items-center text-center transition-all hover:-translate-y-2 hover:shadow-primary/10"
    >
        <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 shadow-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
        <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value !== undefined ? value : '-'}</h3>
    </motion.div>
);

const QuickActionCard = ({ label, icon: Icon, color, to, description }) => (
    <Link to={to} className="group block">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex items-center gap-6 transition-all hover:shadow-indigo-200/50 hover:-translate-y-1">
            <div className={`p-4 rounded-2xl transition-all group-hover:rotate-6 ${color}`}>
                <Icon size={20} className="text-white" />
            </div>
            <div className="flex-1">
                <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{label}</h4>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">{description}</p>
            </div>
            <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary/20 transition-all">
                <ChevronRight size={18} />
            </div>
        </div>
    </Link>
);

const DashboardHome = () => {
    usePageTitle('Admin Dashboard');
    const { user, checkFeature } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'super_admin') {
            navigate('/super-admin');
        } else if (user?.role === 'parent') {
            navigate('/parent-dashboard');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.role === 'school_admin' || user?.role === 'assistant_admin') {
                try {
                    const res = await api.get('/admin/analytics');
                    setStats(res.data);
                } catch (error) {
                    console.error("Transmission error:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);

    if (loading) return <Loader type="spinner" />;

    // Role Based Dashboards
    if (user?.role === 'teacher') return <TeacherDashboard />;
    if (user?.role === 'student') return <StudentDashboard />;
    if (user?.role === 'house_parent') return <HouseParentDashboard user={user} />;

    const p = stats?.platformUsage || {};

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Neural Oversight Hero */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Zap size={14} className="text-primary" /> Admin Control
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Hello, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">{user?.name?.split(' ')[0] || 'Admin'}</span> 👋
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Welcome to your dashboard. Here is a summary of your school's current status and activities.
                        </p>
                    </div>

                    <div className="hidden lg:flex flex-col gap-4">
                        <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6">
                            <div className="p-4 bg-primary/20 rounded-2xl text-primary">
                                <Activity size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black">Active</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">System Status</p>
                            </div>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 flex items-center gap-6">
                            <div className="p-4 bg-indigo-500/20 rounded-2xl text-indigo-400">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <p className="text-3xl font-black">Verified</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Account Status</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Intelligence Stat Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                <StatCard 
                    label="Total Students" 
                    value={p.students || 0} 
                    icon={GraduationCap} 
                    color="bg-blue-600 shadow-blue-500/30" 
                    delay={0.1}
                />
                <StatCard 
                    label="Total Teachers" 
                    value={p.teachers || 1} 
                    icon={Users} 
                    color="bg-emerald-600 shadow-emerald-500/30" 
                    delay={0.2}
                />
                {checkFeature('learningManagement') && (
                    <>
                        <StatCard 
                            label="Lesson Plans" 
                            value={p.lessonPlans || 0} 
                            icon={BookOpen} 
                            color="bg-indigo-600 shadow-indigo-500/30" 
                            delay={0.3}
                        />
                        <StatCard 
                            label="Video Lessons" 
                            value={p.videoLessons || 0} 
                            icon={Video} 
                            color="bg-orange-600 shadow-orange-500/30" 
                            delay={0.4}
                        />
                    </>
                )}
            </div>

            {/* Hub Compartments */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Precision Command Panel */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                                <LayoutGrid size={24} />
                            </div>
                            Dashboard
                        </h3>
                        <div className="flex gap-2">
                             <div className="px-5 py-2 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-500 border border-indigo-100 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-ping" />
                                ACTIVE
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                        <QuickActionCard 
                            label="Teachers" 
                            icon={Briefcase} 
                            color="bg-blue-600" 
                            to="/teachers" 
                            description="Manage teacher information"
                        />
                        <QuickActionCard 
                            label="Students" 
                            icon={GraduationCap} 
                            color="bg-emerald-600" 
                            to="/students" 
                            description="Manage student enrollment"
                        />
                        <QuickActionCard 
                            label="Finance" 
                            icon={CreditCard} 
                            color="bg-indigo-600" 
                            to="/finance" 
                            description="View income and payments"
                        />
                        <QuickActionCard 
                            label="School Setup" 
                            icon={Settings} 
                            color="bg-orange-600" 
                            to="/academic" 
                            description="Configure classes and subjects"
                        />
                        <QuickActionCard 
                            label="Analytics" 
                            icon={BarChart3} 
                            color="bg-rose-600" 
                            to="/analytics" 
                            description="View school performance data"
                        />
                        <QuickActionCard 
                            label="Reports" 
                            icon={Bell} 
                            color="bg-slate-900" 
                            to="/admin/reports" 
                            description="Review staff reports"
                        />
                    </div>
                </div>

                {/* Vertical Intel Dashlet */}
                <div className="space-y-8">
                    <div className="bg-indigo-950 rounded-[3.5rem] p-10 text-white shadow-3xl shadow-indigo-900/40 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
                            <div className="p-3 bg-white/10 rounded-2xl text-primary"><Clock size={18} /></div>
                            Current Session
                        </h3>
                        
                        <div className="space-y-6 relative">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Session</p>
                                <p className="text-xl font-black">{stats?.activeAcademicYear?.year || 'Unknown Term'}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrollment Status</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-4xl font-black text-primary">+{p.newStudents || 0}</p>
                                    <p className="text-xs font-bold text-slate-400 mb-1">THIS MONTH</p>
                                </div>
                            </div>
                            <div className="pt-6 border-t border-white/10">
                                <button 
                                    onClick={() => navigate('/settings')}
                                    className="w-full bg-white text-indigo-950 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                                >
                                    Global Settings <Settings size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary p-1 rounded-[3.5rem] shadow-xl shadow-primary/20">
                        <div className="bg-white rounded-[3.4rem] p-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                <Plus size={32} />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 mb-2">School Features</h4>
                            <p className="text-xs font-semibold text-slate-400 mb-6">Need more features? Explore our available add-ons.</p>
                            <button className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group hover:gap-4 transition-all">
                                View Options <ArrowUpRight size={14} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardHome;
