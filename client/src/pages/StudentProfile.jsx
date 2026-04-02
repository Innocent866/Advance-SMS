import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    GraduationCap, 
    Calendar, 
    Shield, 
    Camera, 
    Edit2, 
    CheckCircle, 
    Award,
    Zap,
    Cpu,
    Fingerprint,
    Save,
    Lock,
    Clock,
    Target,
    Activity,
    BookOpen,
    Key,
    X,
    LogOut,
    TrendingUp,
    Star,
    Layout
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const StudentProfile = () => {
    usePageTitle('My Profile');
    const { user, refreshUser } = useAuth();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [resLoading, setResLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'security', 'performance'
    const [results, setResults] = useState([]);
    const [activeSession, setActiveSession] = useState(null);
    
    useEffect(() => {
        fetchAcademicContext();
    }, []);

    const fetchAcademicContext = async () => {
        try {
            setResLoading(true);
            // 1. Get active session
            const sessRes = await api.get('/academic/sessions');
            const currentSess = sessRes.data.find(s => s.isActive) || sessRes.data[0];
            
            if (currentSess) {
                setActiveSession(currentSess);
                // 2. Fetch results for this student
                const resRes = await api.get(`/results/my-results?session=${currentSess.name}&term=${currentSess.currentTerm || 'First Term'}`);
                setResults(resRes.data);
            }
        } catch (error) {
            console.error('Failed to fetch academic context:', error);
        } finally {
            setResLoading(false);
        }
    };
    
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || ''
    });

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return showNotification('Passwords do not match.', 'error');
        }
        
        setLoading(true);
        try {
            await api.put('/users/profile/password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            showNotification('Password updated successfully.', 'success');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setActiveTab('overview');
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to update password.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/users/profile', profileData);
            await refreshUser();
            showNotification('Profile updated successfully.', 'success');
            setIsEditing(false);
        } catch (error) {
            showNotification('Failed to update profile.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Current Class', value: user?.classId?.name || 'Unassigned', icon: Target, color: 'primary' },
        { label: 'Status', value: 'Active', icon: Activity, color: 'emerald' },
        { label: 'Academic Standing', value: 'Silver', icon: Award, color: 'amber' }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-32 px-4"
        >
            {/* Student Neural Identity Header */}
            <div className="relative mb-12">
                <div className="h-80 rounded-[4rem] bg-slate-950 overflow-hidden relative border border-white/5 shadow-4xl">
                     <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-slate-950 to-emerald-500/10" />
                     <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
                     <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                     
                     <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                        <GraduationCap size={400} strokeWidth={0.5} className="text-white" />
                     </div>

                     <div className="absolute bottom-12 left-12 flex items-end gap-10">
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-[2.5rem] bg-white p-1 shadow-4xl relative z-10 overflow-hidden border-4 border-slate-950 group-hover:border-primary transition-all duration-500">
                                {user?.profilePicture ? (
                                    <img src={user.profilePicture} alt="Avatar" className="w-full h-full object-cover rounded-[2rem]" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        <User size={64} strokeWidth={1.5} />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                                    <Camera size={24} className="text-white" />
                                </div>
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-2xl border-4 border-slate-950 z-20">
                                <Shield size={18} fill="currentColor" />
                            </div>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 backdrop-blur-md rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                                <Clock size={10} fill="currentColor" /> Online Now
                            </div>
                            <h1 className="text-5xl font-black text-white tracking-tight">{user?.name}</h1>
                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] flex items-center gap-3">
                                <Fingerprint size={12} className="text-indigo-400" /> Student • {user?.classId?.name || 'Assigned'}
                            </p>
                        </div>
                     </div>
                </div>

                {/* Performance Stats Overlay */}
                <div className="absolute -bottom-8 right-12 flex gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-white px-8 py-5 rounded-3xl shadow-4xl border border-slate-100 flex items-center gap-5 group hover:bg-slate-50 transition-all cursor-default translate-y-0 hover:-translate-y-1">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-500 group-hover:scale-110 transition-transform`}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-20">
                {/* Protocol Selection */}
                <div className="lg:col-span-3 space-y-4">
                    {[
                        { id: 'overview', label: 'Personal Information', icon: User, desc: 'Your personal details' },
                        { id: 'performance', label: 'Academic Grades', icon: Activity, desc: 'Your scores and performance' },
                        { id: 'security', label: 'Security Settings', icon: LockIcon, desc: 'Update your password' }
                    ].map((tab) => (
                        <button 
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full p-6 rounded-[2.5rem] text-left transition-all relative group overflow-hidden ${activeTab === tab.id ? 'bg-slate-950 text-white shadow-3xl' : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/20 hover:text-slate-600 shadow-sm'}`}
                        >
                             <div className="relative z-10 flex gap-6 items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${activeTab === tab.id ? 'bg-white/10 text-primary shadow-xl' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                                    <tab.icon size={20} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <p className="font-black text-[11px] uppercase tracking-widest leading-none mb-1">{tab.label}</p>
                                    <p className={`text-[10px] font-bold opacity-60 leading-none ${activeTab === tab.id ? 'text-slate-400' : 'text-slate-300'}`}>{tab.desc}</p>
                                </div>
                            </div>
                        </button>
                    ))}

                    <button className="w-full p-6 mt-8 rounded-[2.5rem] bg-rose-50 border border-rose-100 text-rose-500 flex items-center gap-6 group hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-rose-500 group-hover:bg-rose-400 group-hover:text-white transition-all">
                            <LogOut size={20} strokeWidth={2.5} />
                        </div>
                        <p className="font-black text-[11px] uppercase tracking-widest">Logout</p>
                    </button>
                </div>

                {/* Identity Hub Workspace */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {activeTab === 'overview' && (
                            <motion.div 
                                key="overview"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white rounded-[4rem] p-12 shadow-4xl border border-slate-100 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] -mr-40 -mt-40" />
                                     
                                     <div className="flex justify-between items-center mb-12 relative z-10">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-slate-50 text-indigo-500 rounded-2xl flex items-center justify-center shadow-inner border border-slate-100">
                                                <Cpu size={24} strokeWidth={2.5} />
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Profile Details</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Manage your basic information</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setIsEditing(!isEditing)}
                                            className={`px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${isEditing ? 'bg-rose-50 text-rose-500 border border-rose-100' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:text-primary hover:border-primary/20'}`}
                                        >
                                            {isEditing ? <X size={14} /> : <Edit2 size={14} />} {isEditing ? 'Cancel' : 'Edit Profile'}
                                        </button>
                                     </div>

                                     {isEditing ? (
                                        <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                            {[
                                                { label: 'Full Name', key: 'name', icon: User, type: 'text' },
                                                { label: 'Email Address', key: 'email', icon: Mail, type: 'email' },
                                                { label: 'Phone Number', key: 'phoneNumber', icon: Phone, type: 'text' },
                                                { label: 'Home Address', key: 'address', icon: MapPin, type: 'text' }
                                            ].map((field) => (
                                                <div key={field.key} className="space-y-3">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{field.label}</label>
                                                    <div className="relative group">
                                                        <field.icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
                                                        <input 
                                                            type={field.type}
                                                            className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 font-bold text-slate-700 shadow-sm transition-all"
                                                            value={profileData[field.key]}
                                                            onChange={e => setProfileData({...profileData, [field.key]: e.target.value})}
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="md:col-span-2 pt-8">
                                                <button 
                                                    type="submit"
                                                    disabled={loading}
                                                    className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-4xl shadow-slate-900/40 hover:bg-black transition-all flex justify-center items-center gap-4"
                                                >
                                                    {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Save size={20} className="text-primary" />}
                                                    Save Profile Changes
                                                </button>
                                            </div>
                                        </form>
                                     ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                            {[
                                                { label: 'Full Name', value: user?.name, icon: User },
                                                { label: 'Email Address', value: user?.email, icon: Mail },
                                                { label: 'Home Address', value: user?.address || 'Not Provided', icon: MapPin },
                                                { label: 'Current Class', value: user?.classId?.name || 'Unassigned', icon: GraduationCap },
                                                { label: 'Account Role', value: 'STUDENT', icon: Shield },
                                                { label: 'Sync Status', value: 'ACTIVE', icon: Zap }
                                            ].map((item) => (
                                                <div key={item.label} className="p-8 bg-slate-50/50 border border-slate-100 rounded-[2.5rem] group hover:bg-white hover:shadow-3xl transition-all duration-300">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-indigo-500 transition-colors shadow-sm">
                                                            <item.icon size={18} />
                                                        </div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                                                    </div>
                                                    <p className="text-xl font-black text-slate-900 leading-tight">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                     )}
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'performance' && (
                            <motion.div 
                                key="performance"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="bg-white rounded-[4rem] p-12 shadow-4xl border border-slate-100 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-[80px] -mr-40 -mt-40" />
                                     
                                     <div className="flex items-center gap-6 mb-12 relative z-10">
                                        <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center shadow-inner border border-emerald-100">
                                            <Activity size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Academic Grades</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Real-time performance across subjects</p>
                                        </div>
                                     </div>

                                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
                                        {resLoading ? (
                                            <div className="col-span-3 py-10 flex justify-center"><Loader /></div>
                                        ) : results.length > 0 ? (
                                            (() => {
                                                const avg = Math.round(results.reduce((acc, r) => acc + (r.totalScore || 0), 0) / results.length);
                                                const top = [...results].sort((a,b) => (b.totalScore || 0) - (a.totalScore || 0))[0];
                                                
                                                return [
                                                    { label: 'Overall Average', score: `${avg}%`, trend: 'Standard', color: 'primary', icon: TrendingUp },
                                                    { label: 'Top Performance', score: `${top.totalScore}%`, trend: top.subjectId?.name || 'Subject', color: 'emerald', icon: Star },
                                                    { label: 'Subjects Scored', score: results.length, trend: 'Verified', color: 'indigo', icon: Layout }
                                                ].map((cluster) => (
                                                    <div key={cluster.label} className="p-8 bg-slate-50 border border-slate-100 rounded-[3rem] group hover:bg-white hover:shadow-3xl transition-all duration-500 overflow-hidden relative">
                                                        <div className={`absolute top-0 right-0 w-32 h-32 bg-${cluster.color}-500/5 rounded-full blur-2xl -mr-16 -mt-16`} />
                                                        <div className="flex items-center gap-3 mb-6">
                                                            <cluster.icon size={14} className={`text-${cluster.color}-500`} />
                                                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{cluster.label}</h4>
                                                        </div>
                                                        <p className="text-4xl font-black text-slate-900 leading-none mb-4">{cluster.score}</p>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cluster.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-primary'}`}>
                                                                {cluster.trend}
                                                            </span>
                                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Performance Matrix</span>
                                                        </div>
                                                    </div>
                                                ));
                                            })()
                                        ) : (
                                            <div className="col-span-3 p-12 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                                                <p className="text-slate-400 font-bold italic">No results uploaded for the current term yet.</p>
                                            </div>
                                        )}
                                     </div>

                                     <div className="mt-12 p-8 bg-slate-950 rounded-[3rem] text-white relative overflow-hidden group">
                                         <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:scale-125 transition-transform duration-1000" />
                                         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black tracking-tight">Full Result Transcript</h4>
                                                <p className="text-xs text-slate-400 font-medium">Access detailed academic breakdown across all terms.</p>
                                            </div>
                                             <button 
                                                 onClick={() => navigate('/student-results')}
                                                 className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-4xl shadow-black/40"
                                             >
                                                 View Full Results
                                             </button>
                                         </div>
                                     </div>
                                </div>
                            </motion.div>
                        )}

                        {activeTab === 'security' && (
                            <motion.div 
                                key="security"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl"
                            >
                                <div className="bg-white rounded-[4rem] p-12 shadow-4xl border border-slate-100 relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/5 rounded-full blur-[80px] -mr-40 -mt-40" />
                                     
                                     <div className="flex items-center gap-6 mb-12 relative z-10">
                                        <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner border border-rose-100">
                                            <Lock size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Settings</h3>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Update your login password</p>
                                        </div>
                                     </div>

                                     <form onSubmit={handlePasswordChange} className="space-y-8 relative z-10">
                                        {[
                                            { label: 'Current Password', key: 'currentPassword' },
                                            { label: 'New Password', key: 'newPassword' },
                                            { label: 'Confirm New Password', key: 'confirmPassword' }
                                        ].map((field) => (
                                            <div key={field.key} className="space-y-3">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">{field.label}</label>
                                                <div className="relative group">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-rose-400 transition-colors" size={18} />
                                                    <input 
                                                        type="password"
                                                        className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-rose-500/10 font-bold text-slate-700 shadow-sm transition-all text-sm tracking-widest"
                                                        value={passwords[field.key]}
                                                        onChange={e => setPasswords({...passwords, [field.key]: e.target.value})}
                                                        required
                                                        placeholder="••••••••••••"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <button 
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-4xl shadow-slate-900/40 hover:bg-black transition-all flex justify-center items-center gap-4 border border-white/5"
                                        >
                                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Shield size={20} className="text-emerald-400" />}
                                            Update Password
                                        </button>
                                     </form>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
};

const LockIcon = ({ size }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default StudentProfile;
