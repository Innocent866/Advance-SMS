import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar, 
    Book, 
    Award, 
    Clock, 
    ArrowLeft, 
    Edit2, 
    Save, 
    X, 
    Camera, 
    Hash, 
    School, 
    GraduationCap, 
    BookOpen, 
    MonitorPlay, 
    CheckCircle, 
    FileQuestion, 
    FileText, 
    Download, 
    ExternalLink,
    ShieldCheck,
    Zap,
    Activity,
    Layers,
    Sparkles,
    ChevronRight,
    Search,
    Info,
    AlertCircle,
    UserCheck,
    Lock,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const StudentDetails = () => {
    usePageTitle('Student 360° Profile');
    const { user } = useAuth();
    const backLink = user?.role === 'teacher' ? '/my-students' : '/students';
    const { showNotification } = useNotification();
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [showPromoteModal, setShowPromoteModal] = useState(false);
    const [promoting, setPromoting] = useState(false);
    const [classes, setClasses] = useState([]);
    const [promotionData, setPromotionData] = useState({
        toClassId: '',
        toArm: '',
        reason: 'End of Term Promotion'
    });

    useEffect(() => {
        fetchStudent();
        fetchClasses();
    }, [id]);

    const fetchStudent = async () => {
        try {
            const res = await api.get(`/students/${id}`);
            setStudent(res.data);
            setPromotionData(prev => ({ 
                ...prev, 
                toClassId: res.data.classId?._id || '',
                toArm: res.data.arm || ''
            }));
        } catch (error) {
            console.error('Profile Retrieval Failure:', error);
            setError(error.response?.data?.message || 'Identity retrieval failed');
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/academic/classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        }
    };

    const handlePromote = async (e) => {
        e.preventDefault();
        if (!promotionData.toClassId) return showNotification('Please select a target class', 'warning');

        setPromoting(true);
        try {
            await api.post('/students/promote', {
                studentIds: [id],
                ...promotionData
            });
            showNotification('Student promoted successfully', 'success');
            setShowPromoteModal(false);
            fetchStudent(); // Refresh data
        } catch (error) {
            showNotification(error.response?.data?.message || 'Promotion failed', 'error');
        } finally {
            setPromoting(false);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        setUploading(true);
        try {
            const res = await api.put(`/students/${id}`, formData);
            setStudent(res.data);
            showNotification('Biometric data updated', 'success');
        } catch (error) {
            console.error('Upload Failure:', error);
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <Loader type="spinner" />;
    if (error) return (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-rose-100 m-8">
            <AlertCircle size={64} className="text-rose-500 mb-6" />
            <h3 className="text-2xl font-black text-gray-900">Identity Not Detected</h3>
            <p className="text-gray-400 mt-2 font-medium">{error}</p>
            <Link to={backLink} className="mt-8 text-primary font-black uppercase tracking-widest text-xs">Back to Registry</Link>
        </div>
    );
    
    if (!student) return null;

    const sections = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'academic', label: 'Academic Grades', icon: GraduationCap },
        { id: 'promotion', label: 'Promotion History', icon: Zap },
        { id: 'documents', label: 'Documents', icon: BookOpen },
        { id: 'attendance', label: 'Attendance', icon: Clock }
    ];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-20 px-4"
        >
            <div className="flex justify-between items-center mb-10">
                <Link to={backLink} className="group flex items-center gap-4 text-gray-400 hover:text-gray-900 transition-all">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center group-hover:-translate-x-1 transition-transform">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-black text-xs uppercase tracking-widest">Back to Registry</span>
                </Link>

                {user?.role === 'school_admin' && (
                    <button 
                        onClick={() => setShowPromoteModal(true)}
                        className="bg-primary text-white px-8 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center gap-3"
                    >
                        <Zap size={14} /> Promote Student
                    </button>
                )}
            </div>

            {/* Profile Hero Section */}
            <div className="relative mb-12 rounded-[4rem] overflow-hidden bg-white border border-gray-100 shadow-3xl">
                <div className="h-64 bg-gradient-to-br from-gray-900 via-slate-900 to-black relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32 animate-pulse" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30"></div>
                </div>

                <div className="px-12 pb-12 relative">
                    <div className="flex flex-col lg:flex-row gap-12 -mt-24 items-end">
                        <div className="relative">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-56 h-56 bg-white rounded-[4rem] p-3 shadow-2xl relative z-10 overflow-hidden border-8 border-white"
                            >
                                {student.profilePicture ? (
                                    <img 
                                        src={student.profilePicture} 
                                        alt={`${student.firstName} ${student.lastName}`}
                                        className="w-full h-full rounded-[3.5rem] object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-50 rounded-[3.5rem] flex items-center justify-center text-slate-200">
                                        <User size={80} />
                                    </div>
                                )}
                                
                                <label className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-all cursor-pointer rounded-[3.5rem]">
                                    {uploading ? (
                                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Camera className="text-white" size={32} />
                                    )}
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                    />
                                </label>
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 bg-primary text-white p-4 rounded-3xl shadow-xl shadow-primary/30 z-20 border-4 border-white hover:scale-110 transition-transform">
                                <ShieldCheck size={28} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center lg:text-left">
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                                    student.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                }`}>
                                    Entity {student.status || 'Active'}
                                </span>
                                <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Hash size={12} className="text-primary" /> {student.studentId}
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-none">
                                {student.firstName} <span className="text-primary">{student.lastName}</span>
                            </h1>
                            <div className="flex items-center justify-center lg:justify-start gap-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                        <Layers size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Hub Assignment</p>
                                        <p className="text-sm font-black text-gray-800">{student.classId?.name || 'Null'} <span className="text-primary">{student.arm ? `(Arm ${student.arm})` : ''}</span></p>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-gray-100" />
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                                        <Activity size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Registry Status</p>
                                        <p className="text-sm font-black text-gray-800">{student.enrollmentStatus || 'Resident'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white/80 backdrop-blur-2xl border border-gray-100 p-2 rounded-[2.5rem] shadow-2xl mb-12 flex flex-wrap gap-2 sticky top-4 z-40">
                {sections.map(section => (
                    <button 
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${
                            activeTab === section.id 
                                ? 'bg-slate-900 text-white shadow-xl' 
                                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                        <section.icon size={16} />
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                    <motion.div 
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-8"
                    >
                        {/* Personal Intelligence */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-20 duration-700">
                                <Zap size={180} className="text-primary" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <UserCheck size={24} />
                                </div>
                                Identity Parameters
                            </h3>
                            <div className="space-y-6 relative z-10">
                                {[
                                    { label: 'Primary Mail', value: student.email, icon: Mail, color: 'text-indigo-500' },
                                    { label: 'Biological Vector', value: student.gender, icon: User, color: 'text-blue-500' },
                                    { label: 'Registry Level', value: student.level, icon: GraduationCap, color: 'text-emerald-500' },
                                    { label: 'Sync Date', value: new Date(student.createdAt).toLocaleDateString(), icon: Clock, color: 'text-slate-400' }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 p-6 bg-gray-50/50 border border-gray-100 rounded-3xl hover:bg-white hover:shadow-lg transition-all">
                                        <item.icon className={item.color} size={22} />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{item.label}</p>
                                            <p className="text-lg font-black text-gray-800">{item.value}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Guardian Uplink */}
                        <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 -mr-8 -mt-8 grayscale transition-all group-hover:grayscale-0 group-hover:opacity-20 duration-700">
                                <ShieldCheck size={180} className="text-violet-500" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 flex items-center gap-4">
                                <div className="w-12 h-12 bg-violet-50 rounded-2xl flex items-center justify-center text-violet-600 border border-violet-100">
                                    <ShieldCheck size={24} />
                                </div>
                                Guardian Proxy
                            </h3>
                            {student.parent ? (
                                <div className="space-y-6 relative z-10">
                                    <div className="p-8 bg-gradient-to-br from-violet-500/5 to-transparent rounded-[2.5rem] border border-violet-100 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-white rounded-full shadow-2xl flex items-center justify-center text-violet-600 font-black text-3xl border-4 border-violet-50">
                                            {student.parent.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-violet-400 mb-1">Authenticated Proxy</p>
                                            <h4 className="text-2xl font-black text-gray-900">{student.parent.name}</h4>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-4">
                                        {[
                                            { label: 'Secure Channel', value: student.parent.email, icon: Mail },
                                            { label: 'Voice Uplink', value: student.parent.phone || 'Offline', icon: Phone },
                                            { label: 'Physical Sector', value: student.parent.address || 'Unmapped', icon: MapPin }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-5 bg-slate-50 border border-slate-100 rounded-3xl">
                                                <div className="p-3 bg-white rounded-2xl text-violet-500 border border-violet-50 shadow-sm">
                                                    <item.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">{item.label}</p>
                                                    <p className="text-sm font-black text-gray-700">{item.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="p-12 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                    <Lock size={48} className="text-gray-200 mx-auto mb-6" />
                                    <p className="text-gray-400 font-medium italic">No guardian uplink established for this entity.</p>
                                    <button className="mt-6 font-black text-[10px] uppercase tracking-[0.2em] text-primary hover:gap-4 transition-all flex items-center justify-center gap-2 mx-auto">
                                        Initialize Link <Plus size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'academic' && (
                    <motion.div 
                        key="academic"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-12"
                    >
                        {/* Subjects Matrix */}
                        <div className="bg-slate-900 p-12 rounded-[4rem] text-white shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                                <div className="space-y-2">
                                    <h3 className="text-4xl font-black tracking-tight leading-none text-white">Pedagogical <span className="text-primary">Loadout</span></h3>
                                    <p className="text-gray-400 font-medium text-lg uppercase tracking-widest text-[10px]">Active Subject Matrix Engagement</p>
                                </div>
                                <div className="bg-white/5 backdrop-blur-3xl px-8 py-4 rounded-3xl border border-white/10 flex items-center gap-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-black">{student.subjects?.length || 0}</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Total Subjects</p>
                                    </div>
                                    <div className="w-px h-10 bg-white/10" />
                                    <div className="text-center text-primary">
                                        <p className="text-3xl font-black">100%</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Allocation</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                                {student.subjects && student.subjects.length > 0 ? (
                                    student.subjects.map((subject, i) => (
                                        <motion.div 
                                            key={subject._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 hover:bg-white/10 hover:-translate-y-2 transition-all cursor-default group"
                                        >
                                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                                                <BookOpen size={28} />
                                            </div>
                                            <h4 className="text-xl font-black text-white mb-2 leading-tight">{subject.name}</h4>
                                            <div className="flex items-center gap-2 text-primary">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Active Vector</span>
                                                <ChevronRight size={14} />
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center text-gray-500 italic">No curricular loadout detected.</div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'progress' && (
                    <motion.div 
                        key="progress"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                    >
                        {/* Video Engagement */}
                        {student.videoProgress && (
                            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-12">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Visual <span className="text-primary">Engagement</span></h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Lesson Stream Integration</p>
                                    </div>
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="56" cy="56" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                                            <motion.circle 
                                                cx="56" cy="56" r="48" fill="transparent" stroke="#10b981" strokeWidth="8" 
                                                strokeDasharray={301.6} 
                                                initial={{ strokeDashoffset: 301.6 }}
                                                animate={{ strokeDashoffset: 301.6 * (1 - student.videoProgress.completionRate / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <p className="absolute text-2xl font-black text-gray-900">{student.videoProgress.completionRate}%</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                                            <CheckCircle size={14} /> Synchronized Artifacts ({student.videoProgress.taken.length})
                                        </h4>
                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            {student.videoProgress.taken.map((video) => (
                                                <div key={video._id} className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center gap-5 group hover:bg-emerald-100 transition-all">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm shadow-emerald-500/10">
                                                        <MonitorPlay size={20} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-black text-emerald-950 truncate">{video.title}</p>
                                                        <p className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest">{video.topic}</p>
                                                    </div>
                                                    <div className="text-emerald-500">
                                                        <CheckCircle size={18} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                                            <Clock size={14} /> Latent Streams ({student.videoProgress.notTaken.length})
                                        </h4>
                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            {student.videoProgress.notTaken.map((video) => (
                                                <div key={video._id} className="p-6 bg-gray-50 border border-gray-100 rounded-[2rem] flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                                                        <Lock size={20} />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-black text-gray-700 truncate">{video.title}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{video.topic}</p>
                                                    </div>
                                                    <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Quiz Engagement */}
                        {student.quizProgress && (
                            <div className="bg-white p-12 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-12">
                                <div className="flex justify-between items-center">
                                    <div className="space-y-2">
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Pedagogical <span className="text-violet-500">Audit</span></h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Knowledge Verification Cycle</p>
                                    </div>
                                    <div className="relative w-28 h-28 flex items-center justify-center">
                                        <svg className="w-full h-full -rotate-90">
                                            <circle cx="56" cy="56" r="48" fill="transparent" stroke="#f1f5f9" strokeWidth="8" />
                                            <motion.circle 
                                                cx="56" cy="56" r="48" fill="transparent" stroke="#8b5cf6" strokeWidth="8" 
                                                strokeDasharray={301.6} 
                                                initial={{ strokeDashoffset: 301.6 }}
                                                animate={{ strokeDashoffset: 301.6 * (1 - student.quizProgress.completionRate / 100) }}
                                                transition={{ duration: 1.5, ease: "easeOut" }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <p className="absolute text-2xl font-black text-gray-900">{student.quizProgress.completionRate}%</p>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-violet-500 flex items-center gap-2">
                                            <Award size={14} /> Successful Validations ({student.quizProgress.taken.length})
                                        </h4>
                                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                                            {student.quizProgress.taken.map((quiz) => (
                                                <div key={quiz._id} className="p-8 bg-violet-50/50 border border-violet-100 rounded-[2.5rem] space-y-4 group hover:bg-violet-50 transition-all">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1 overflow-hidden">
                                                            <p className="font-black text-gray-900 truncate">{quiz.title}</p>
                                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(quiz.submittedAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <div className="px-5 py-2 bg-white rounded-2xl shadow-lg border border-violet-100">
                                                            <p className="text-lg font-black text-violet-600">{quiz.score !== undefined ? quiz.score : 'N/A'}</p>
                                                            <p className="text-[8px] font-black uppercase tracking-widest text-gray-400">Score</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 pt-4 border-t border-violet-100/50">
                                                        <div className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
                                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-violet-400">Verification Artifact Synced</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'promotion' && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-8"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900">Academic Journey</h3>
                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Historical Class & Level Transitions</p>
                            </div>
                        </div>

                        {student.promotionHistory?.length > 0 ? (
                            <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 before:dashed">
                                {student.promotionHistory.map((record, idx) => (
                                    <div key={record._id} className="relative">
                                        <div className="absolute -left-[31px] top-6 w-6 h-6 rounded-full bg-white border-4 border-primary flex items-center justify-center z-10 shadow-sm" />
                                        <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all group">
                                            <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                                                        <Zap size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-1">Promotion Successful</p>
                                                        <h4 className="text-xl font-black text-gray-900">
                                                            {record.fromClassId?.name || 'Initial'} 
                                                            <span className="mx-3 text-gray-300">→</span> 
                                                            {record.toClassId?.name}
                                                            {record.toArm && <span className="text-primary ml-2">({record.toArm})</span>}
                                                        </h4>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col md:text-right">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Promoted By</p>
                                                    <p className="text-sm font-bold text-gray-700">{record.promotedBy?.name}</p>
                                                    <p className="text-[11px] font-mono text-gray-400 mt-1">{new Date(record.date).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Context</p>
                                                    <p className="text-xs font-bold text-gray-700">
                                                        Session: <span className="text-primary">{record.session}</span> 
                                                        <span className="mx-2 text-gray-300">|</span> 
                                                        Term: <span className="text-primary">{record.term}</span>
                                                    </p>
                                                </div>
                                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">Notes</p>
                                                    <p className="text-xs font-bold text-gray-700 italic">"{record.reason}"</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                    <Zap className="text-gray-200" size={32} />
                                </div>
                                <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No promotion history found</p>
                                <p className="text-[10px] text-gray-400 mt-2">Historical data will appear here after the first promotion.</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'resources' && (
                    <motion.div 
                        key="resources"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-12"
                    >
                        {/* Assignments Matrix */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-1 w-24 bg-primary rounded-full" />
                                <h3 className="text-3xl font-black text-gray-900 tracking-tight">Active <span className="text-primary">Assignments</span></h3>
                                <div className="flex-1 h-px bg-gray-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {student.assignments && student.assignments.length > 0 ? (
                                    student.assignments.map((assignment, i) => (
                                        <motion.div 
                                            key={assignment._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-xl group hover:shadow-2xl hover:-translate-y-2 transition-all relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 p-8 opacity-5 grayscale group-hover:grayscale-0 group-hover:opacity-20 transition-all -mr-6 -mt-6">
                                                <FileText size={100} className="text-primary" />
                                            </div>
                                            <div className="flex flex-col h-full justify-between gap-8 relative z-10">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/20">
                                                            {assignment.subject}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                                            <Clock size={12} /> {new Date(assignment.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-primary transition-colors">
                                                        {assignment.title}
                                                    </h4>
                                                </div>
                                                <motion.a 
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    href={assignment.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                                                >
                                                    Access File Asset <Download size={14} />
                                                </motion.a>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100 text-gray-400 italic">No assigned activities found.</div>
                                )}
                            </div>
                        </div>

                        {/* Learning Materials */}
                        {student.learningMaterials && student.learningMaterials.length > 0 && (
                            <div className="space-y-8 pt-12 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-1 w-24 bg-orange-500 rounded-full" />
                                    <h3 className="text-3xl font-black text-gray-900 tracking-tight">Curricular <span className="text-orange-500">Resources</span></h3>
                                    <div className="flex-1 h-px bg-gray-100" />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {student.learningMaterials.map((material, i) => (
                                        <motion.div 
                                            key={material._id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-lg group hover:bg-orange-950 hover:text-white transition-all overflow-hidden relative"
                                        >
                                            <div className="absolute -bottom-8 -right-8 opacity-5 group-hover:opacity-10 group-hover:rotate-12 transition-all">
                                                <Book size={140} />
                                            </div>
                                            <div className="space-y-6 relative z-10">
                                                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-all shadow-lg shadow-orange-500/10">
                                                    <BookOpen size={24} />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[8px] font-black uppercase tracking-widest text-orange-500 group-hover:text-orange-100 bg-orange-50 group-hover:bg-orange-800 px-2 py-1 rounded-lg transition-colors">
                                                            {material.type}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-lg font-black leading-tight">{material.title}</h4>
                                                    <p className="text-[10px] font-bold text-gray-400 group-hover:text-gray-300 uppercase tracking-widest">{material.subject}</p>
                                                </div>
                                                <motion.a 
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    href={material.fileUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 bg-gray-100 group-hover:bg-white text-gray-400 group-hover:text-orange-600 rounded-xl flex items-center justify-center transition-all ml-auto border border-gray-100 group-hover:border-transparent"
                                                >
                                                    <ExternalLink size={18} />
                                                </motion.a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Promotion Modal */}
            <AnimatePresence>
                {showPromoteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl"
                            onClick={() => setShowPromoteModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-3xl overflow-hidden border border-white/20 p-12"
                        >
                            <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Zap size={24} />
                                </div>
                                Promote Student
                            </h3>

                            <form onSubmit={handlePromote} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Class</label>
                                    <select 
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer"
                                        value={promotionData.toClassId}
                                        onChange={(e) => setPromotionData({...promotionData, toClassId: e.target.value, toArm: ''})}
                                        required
                                    >
                                        <option value="">Select Target Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Arm</label>
                                    <select 
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                        value={promotionData.toArm}
                                        onChange={(e) => setPromotionData({...promotionData, toArm: e.target.value})}
                                        disabled={!promotionData.toClassId}
                                    >
                                        <option value="">Select Arm</option>
                                        {classes.find(c => c._id === promotionData.toClassId)?.arms.map(a => (
                                            <option key={a._id} value={a.name}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Reason / Comment</label>
                                    <textarea 
                                        placeholder="Note for promotion history..."
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-3xl text-sm font-bold text-gray-700 outline-none transition-all min-h-[120px] resize-none"
                                        value={promotionData.reason}
                                        onChange={(e) => setPromotionData({...promotionData, reason: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowPromoteModal(false)}
                                        className="px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={promoting}
                                        className="bg-primary text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {promoting ? 'Promoting...' : 'Confirm Promotion'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentDetails;
