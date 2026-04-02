import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Video, 
    Play, 
    Eye, 
    CheckCircle, 
    Trash2, 
    Upload, 
    Users, 
    ShieldCheck, 
    X, 
    Search, 
    Plus, 
    Filter, 
    MoreVertical, 
    CloudUpload, 
    Layout, 
    Zap, 
    Cpu, 
    Database, 
    ArrowRight,
    Terminal,
    BookOpen,
    Clock,
    Send,
    ChevronRight,
    Activity
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import QuizManager from '../components/QuizManager';
import Loader from '../components/Loader';

const VideoManager = () => {
    usePageTitle('Video Lessons');
    const { user, checkAccess } = useAuth();
    const { showNotification } = useNotification();
    const hasVideoAccess = checkAccess('videoLessons');
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
    
    // Data
    const [videos, setVideos] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    // Form Data
    const [formData, setFormData] = useState({
        classLevel: '',
        subject: '',
        title: '',
        topic: '',
        description: '',
        videoUrl: '',
        lessonNotes: '',
        isPublished: true
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [managingQuizVideo, setManagingQuizVideo] = useState(null);

    // Analytics State
    const [viewingAnalytics, setViewingAnalytics] = useState(null); 
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if(user) {
            fetchMeta();
            fetchVideos();
        }
    }, [user]);

    const fetchMeta = async () => {
        try {
            // Phase 1: Meta Discovery (Settled Protocol)
            const [subjectsRes, classesRes, teacherRes] = await Promise.allSettled([
                api.get('/academic/subjects'),
                api.get('/academic/classes'),
                user?.role === 'teacher' ? api.get('/teachers/me') : Promise.resolve({ data: null })
            ]);

            let allSubjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value.data : [];
            let allClasses = classesRes.status === 'fulfilled' ? classesRes.value.data : [];
            const teacherProfile = teacherRes.status === 'fulfilled' ? teacherRes.value?.data : null;

            // Phase 2: Intelligence-Driven Filtration
            if (user?.role === 'teacher' && teacherProfile) {
                const myClassIds = new Set();
                const mySubjectIds = new Set();

                // Synthetic assignment extraction (from teachingAssignments)
                if (Array.isArray(teacherProfile.teachingAssignments)) {
                    teacherProfile.teachingAssignments.forEach(a => {
                        if (!a) return;
                        const cid = a.classId?._id || a.classId;
                        const sid = a.subjectId?._id || a.subjectId;
                        if (cid) myClassIds.add(cid.toString());
                        if (sid) mySubjectIds.add(sid.toString());
                    });
                }

                // Legacy/Direct array extraction
                if (Array.isArray(teacherProfile.classes)) {
                    teacherProfile.classes.forEach(c => {
                        const id = c?._id || c;
                        if (id) myClassIds.add(id.toString());
                    });
                }
                if (Array.isArray(teacherProfile.subjects)) {
                    teacherProfile.subjects.forEach(s => {
                        const id = s?._id || s;
                        if (id) mySubjectIds.add(id.toString());
                    });
                }

                // Execute filtration protocol only if data points exist
                if (myClassIds.size > 0) {
                    const filteredClasses = allClasses.filter(cls => myClassIds.has(cls._id.toString()));
                    if (filteredClasses.length > 0) allClasses = filteredClasses;
                }
                if (mySubjectIds.size > 0) {
                    const filteredSubjects = allSubjects.filter(sub => mySubjectIds.has(sub._id.toString()));
                    if (filteredSubjects.length > 0) allSubjects = filteredSubjects;
                }
            }

            setSubjects(allSubjects);
            setClasses(allClasses);
        } catch(e) { 
            console.error('Metadata protocol failure:', e); 
        }
    };

    const fetchVideos = async () => {
        try {
            if (!user?._id) return;
            const res = await api.get(`/videos?teacherId=${user._id}`);
            setVideos(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to load videos:', error);
            setLoading(false);
        }
    };

    const fetchAnalytics = async (videoId) => {
        setViewingAnalytics(videoId);
        setLoadingAnalytics(true);
        try {
            const res = await api.get(`/videos/${videoId}/analytics`);
            setAnalyticsData(res.data);
        } catch (error) {
            console.error('Analytics sync failure:', error);
            showNotification('Failed to load performance metrics', 'error');
            setViewingAnalytics(null);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('classLevelId', formData.classLevel);
        data.append('subjectId', formData.subject);
        data.append('topic', formData.topic);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('lessonNotes', formData.lessonNotes);
        data.append('isPublished', formData.isPublished);
        
        if (videoFile) {
            data.append('video', videoFile);
        } else if (formData.videoUrl) {
             data.append('videoUrl', formData.videoUrl);
        }

        try {
            await api.post('/videos', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification('Video lesson uploaded successfully.', 'success');
            setFormData({
                classLevel: '', subject: '', title: '', topic: '', 
                description: '', videoUrl: '', lessonNotes: '', isPublished: true
            });
            setVideoFile(null);
            setActiveTab('list');
            fetchVideos();
        } catch (error) {
            console.error('Transmission failure:', error);
            const message = error.response?.data?.message || 'Error executing deployment protocol';
            showNotification(message, 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if(!confirm('Are you sure you want to delete this video?')) return;
        try {
            await api.delete(`/videos/${id}`);
            setVideos(videos.filter(v => v._id !== id));
            showNotification('Video deleted', 'success');
        } catch (error) {
            showNotification('Deletion protocol failed', 'error');
        }
    };

    const togglePublish = async (video) => {
        try {
            const updated = await api.put(`/videos/${video._id}`, { isPublished: !video.isPublished });
            setVideos(videos.map(v => v._id === video._id ? updated.data : v));
            showNotification(`Video ${!video.isPublished ? 'published' : 'unpublished'}.`, 'info');
        } catch (error) {
            showNotification('Registry update protocol failure', 'error');
        }
    };

    if (loading) return <Loader type="spinner" />;

    const stats = {
        total: videos.length,
        published: videos.filter(v => v.isPublished).length,
        drafts: videos.filter(v => !v.isPublished).length,
        totalViews: videos.reduce((acc, v) => acc + (v.views || 0), 0)
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto pb-32 px-4"
        >
            {/* Neural Video Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Zap size={14} fill="currentColor" /> Video Management
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Video <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-purple-400 to-indigo-400 italic">Lessons</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Upload lesson videos and track student completion across your classes.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                        {[
                            { label: 'Total Videos', value: stats.total, color: 'primary', icon: Video },
                            { label: 'Published', value: stats.published, color: 'emerald', icon: CheckCircle },
                            { label: 'Total Views', value: stats.totalViews, color: 'purple', icon: Eye },
                            { label: 'Status', value: 'Active', color: 'amber', icon: Zap }
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center group hover:bg-white/10 transition-all cursor-default min-w-[140px]">
                                <stat.icon size={22} className={`text-${stat.color}-400 mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                                <p className="text-2xl font-black">{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tactical Control Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 px-6">
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('list')}
                        className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'list' ? 'bg-slate-950 text-white shadow-3xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        <Layout size={16} /> My Videos
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${activeTab === 'upload' ? 'bg-slate-950 text-white shadow-3xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        <CloudUpload size={16} /> Upload New
                    </button>
                </div>
                
                <div className="relative group w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        type="text"
                        placeholder="Search Videos..."
                        className="w-full pl-16 pr-8 py-4 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                    />
                </div>
            </div>

            {/* Quiz Manager Modal */}
            {managingQuizVideo && (
                <QuizManager video={managingQuizVideo} onClose={() => setManagingQuizVideo(null)} />
            )}

            {/* High-Fidelity Video Matrix (List View) */}
            <AnimatePresence mode="wait">
                {activeTab === 'list' && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                    >
                        {videos.map((video, idx) => (
                            <motion.div 
                                key={video._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-[3rem] border border-slate-100 shadow-3xl overflow-hidden group hover:shadow-4xl transition-all cursor-pointer relative"
                                onClick={() => setSelectedVideo(video)}
                            >
                                <div className="aspect-video bg-slate-900 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl transform scale-75 group-hover:scale-100 transition-transform">
                                            <Play size={24} className="text-primary fill-primary ml-1" />
                                        </div>
                                    </div>
                                    
                                    <div className="absolute top-6 right-6 z-20">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/20 backdrop-blur-md ${video.isPublished ? 'bg-emerald-500/80 text-white' : 'bg-amber-500/80 text-white'}`}>
                                            {video.isPublished ? 'Live' : 'Draft'}
                                        </span>
                                    </div>
                                    
                                    <div className="absolute bottom-6 left-6 right-6 z-20">
                                        <div className="flex gap-2 mb-2">
                                            <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[8px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                                                {video.classLevelId?.name}
                                            </span>
                                            <span className="px-2 py-0.5 bg-white/10 backdrop-blur-md rounded text-[8px] font-black text-white/90 uppercase tracking-widest border border-white/10">
                                                {video.subjectId?.name}
                                            </span>
                                        </div>
                                        <h3 className="text-white font-black tracking-tight text-lg line-clamp-1">{video.title}</h3>
                                    </div>
                                </div>
                                
                                <div className="p-8">
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-6 h-10">{video.description || 'System initialization successful. Artifact ready for deployment.'}</p>
                                    
                                    <div className="flex justify-between items-center border-t border-slate-50 pt-6" onClick={e => e.stopPropagation()}>
                                        <div className="flex gap-4 items-center">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); fetchAnalytics(video._id); }}
                                                className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors group/stat"
                                            >
                                                <Eye size={16} className="group-hover/stat:scale-110 transition-transform" /> 
                                                <span className="text-[10px] font-black">{video.views || 0}</span>
                                            </button>
                                        </div>
                                        
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); setManagingQuizVideo(video); }}
                                                className="px-4 py-2 bg-purple-50 text-purple-600 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-purple-100 transition-all border border-purple-100"
                                            >
                                                Quiz
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); togglePublish(video); }}
                                                className={`p-2 rounded-xl transition-all border ${video.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-100 hover:text-emerald-600 hover:bg-emerald-50'}`}
                                            >
                                                <CheckCircle size={18} />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(video._id); }}
                                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl transition-all"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Glassmorphic Deployment Console (Upload View) */}
                {activeTab === 'upload' && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto"
                    >
                        {!hasVideoAccess ? (
                             <div className="bg-white rounded-[4rem] shadow-4xl p-16 text-center border border-rose-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="bg-rose-500/10 w-24 h-24 rounded-[2rem] flex items-center justify-center mx-auto mb-8 relative z-10">
                                    <ShieldCheck className="w-12 h-12 text-rose-500" />
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 mb-4 relative z-10">Restricted Protocol</h2>
                                <p className="text-slate-500 font-medium mb-12 text-xl max-w-lg mx-auto leading-relaxed relative z-10">
                                    Educational cinema protocols are restricted for this deployment node. 
                                    Synchronize with the Executive Terminal for upgrade verification.
                                </p>
                                <button 
                                    onClick={() => setActiveTab('list')}
                                    className="px-12 py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-black shadow-3xl shadow-slate-900/40 relative z-10"
                                >
                                    Return to Module
                                </button>
                             </div>
                        ) : (
                            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-4xl relative overflow-hidden">
                                <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mb-48" />
                                
                                <div className="flex items-center gap-6 mb-12 border-b border-slate-50 pb-8 relative z-10">
                                    <div className="w-16 h-16 bg-slate-950 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                                        <CloudUpload size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Upload Lesson</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Configure Lesson Details</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Class</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none"
                                                value={formData.classLevel}
                                                onChange={e => setFormData({...formData, classLevel: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Class</option>
                                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Select Subject</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none"
                                                value={formData.subject}
                                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Topic</label>
                                        <input 
                                            className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                                            value={formData.topic}
                                            onChange={e => setFormData({...formData, topic: e.target.value})}
                                            placeholder="e.g. Newton's Laws of Motion"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Video Title</label>
                                        <input 
                                            className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                                            value={formData.title}
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                            placeholder="Systematic Overview"
                                            required
                                        />
                                    </div>

                                    <div className="p-8 bg-slate-950 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                            <div className="flex-1 space-y-4">
                                                <h3 className="text-xl font-black tracking-tight">Video File</h3>
                                                <p className="text-slate-400 text-xs font-medium">Upload an MP4 or MOV file, or add a link below.</p>
                                                <input 
                                                    type="file"
                                                    accept="video/*"
                                                    className="hidden"
                                                    id="video-upload"
                                                    onChange={e => setVideoFile(e.target.files[0])}
                                                />
                                                <label htmlFor="video-upload" className="inline-flex items-center gap-3 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 transition-all cursor-pointer text-[10px] font-black uppercase tracking-widest text-white">
                                                    <CloudUpload size={14} /> {videoFile ? videoFile.name : 'Choose Video'}
                                                </label>
                                            </div>
                                            <div className="w-px h-20 bg-white/10 hidden md:block" />
                                            <div className="flex-1 w-full space-y-4">
                                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block ml-2">Or Use YouTube Link</label>
                                                <input 
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-slate-600 font-bold"
                                                    value={formData.videoUrl}
                                                    onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                                    placeholder="https://youtube.com/..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Description</label>
                                            <textarea 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm h-32 resize-none"
                                                value={formData.description}
                                                onChange={e => setFormData({...formData, description: e.target.value})}
                                                placeholder="Brief overview for student metadata..."
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Lesson Notes</label>
                                            <textarea 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm h-32 resize-none"
                                                value={formData.lessonNotes}
                                                onChange={e => setFormData({...formData, lessonNotes: e.target.value})}
                                                placeholder="Technical detailed documentation..."
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <label className="flex items-center gap-4 cursor-pointer">
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.isPublished ? 'bg-primary border-primary shadow-lg shadow-primary/20' : 'bg-white border-slate-200'}`}>
                                                {formData.isPublished && <CheckCircle size={18} className="text-white" />}
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData.isPublished} onChange={e => setFormData({...formData, isPublished: e.target.checked})} />
                                            <div>
                                                <span className="text-sm font-black text-slate-900 block">Publish Immediately</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Share this lesson with students now</span>
                                            </div>
                                        </label>
                                    </div>

                                    <motion.button 
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit" 
                                        disabled={submitting}
                                        className="w-full py-6 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-4xl shadow-primary/40 hover:bg-primary/90 transition-all flex justify-center items-center gap-4 disabled:opacity-50"
                                    >
                                        {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CloudUpload size={20} />}
                                        Upload Lesson
                                    </motion.button>
                                </form>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Tactical Video Cinema (Player Modal) */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-2xl" 
                        onClick={() => setSelectedVideo(null)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 50 }}
                            className="bg-white rounded-[4rem] overflow-hidden w-full max-w-6xl shadow-4xl relative" 
                            onClick={e => e.stopPropagation()}
                        >
                            <button 
                                onClick={() => setSelectedVideo(null)}
                                className="absolute top-8 right-8 z-20 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white transition-all border border-white/10"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex flex-col lg:flex-row h-full">
                                <div className="flex-[1.5] bg-black aspect-video lg:aspect-auto flex items-center justify-center relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-black/80 to-transparent z-10" />
                                    {selectedVideo.videoUrl && selectedVideo.videoUrl.startsWith('/uploads') ? (
                                        <video 
                                            src={`http://localhost:5001${selectedVideo.videoUrl}`} 
                                            controls 
                                            autoPlay 
                                            className="w-full h-full object-contain relative z-1"
                                        />
                                    ) : selectedVideo.videoUrl && (selectedVideo.videoUrl.includes('youtube') || selectedVideo.videoUrl.includes('youtu.be')) ? (
                                        <iframe 
                                            className="w-full h-full relative z-1"
                                            src={selectedVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <video 
                                            src={selectedVideo.videoUrl} 
                                            controls 
                                            autoPlay 
                                            className="w-full h-full object-contain relative z-1" 
                                        />
                                    )}
                                </div>
                                <div className="flex-1 p-12 bg-white flex flex-col h-full max-h-[90vh] overflow-y-auto custom-scrollbar">
                                    <div className="space-y-8">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-[8px] font-black uppercase tracking-widest mb-4">
                                                <Zap size={10} fill="currentColor" /> Active Lesson
                                            </div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{selectedVideo.title}</h2>
                                            <div className="flex items-center gap-4 mt-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedVideo.classLevelId?.name}</span>
                                                <div className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedVideo.subjectId?.name}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 text-slate-900 border-b border-slate-50 pb-4">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <BookOpen size={16} />
                                                </div>
                                                <p className="text-xs font-black uppercase tracking-widest">Topic</p>
                                            </div>
                                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic border-l-4 border-primary/20 pl-6 py-2 bg-slate-50/50 rounded-r-2xl">
                                                {selectedVideo.topic}
                                            </p>
                                            <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                                {selectedVideo.description || 'Initialization documentation pending for this pedagogical artifact.'}
                                            </p>
                                        </div>

                                        {selectedVideo.lessonNotes && (
                                            <div className="space-y-4">
                                                <div className="flex items-center gap-3 text-slate-900 border-b border-slate-50 pb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <Terminal size={16} />
                                                    </div>
                                                    <p className="text-xs font-black uppercase tracking-widest">Lesson Notes</p>
                                                </div>
                                                <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100/50">
                                                    <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{selectedVideo.lessonNotes}</p>
                                                </div>
                                            </div>
                                        )}

                                        <div className="pt-8">
                                            <button 
                                                onClick={() => setManagingQuizVideo(selectedVideo)}
                                                className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:bg-black shadow-3xl shadow-slate-900/40 transition-all flex items-center justify-center gap-4 border border-white/5"
                                            >
                                                <MoreVertical size={16} /> Manage Lesson Quiz
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Strategic Analytics Console (Modal) */}
            <AnimatePresence>
                {viewingAnalytics && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-8 bg-slate-950/90 backdrop-blur-2xl" 
                        onClick={() => { setViewingAnalytics(null); setAnalyticsData(null); }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, x: 100 }}
                            animate={{ scale: 1, x: 0 }}
                            exit={{ scale: 0.9, x: 100 }}
                            className="bg-white rounded-[4rem] overflow-hidden w-full max-w-4xl shadow-4xl h-[85vh] flex flex-col relative" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-12 bg-slate-50 border-b border-slate-100 flex justify-between items-center relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                                <div className="relative z-10 flex gap-6 items-center">
                                    <div className="w-16 h-16 bg-slate-950 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl">
                                        <Database size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                            View Analytics
                                        </h2>
                                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase mt-1">
                                            {loadingAnalytics ? 'Loading...' : `Video: "${analyticsData?.videoTitle}"`}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => { setViewingAnalytics(null); setAnalyticsData(null); }} className="relative z-10 w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                    <X size={24} />
                                </button>
                            </div>

                            {loadingAnalytics ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6">
                                    <div className="w-16 h-16 border-4 border-slate-100 border-t-primary rounded-full animate-spin" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Loading Video Data...</p>
                                </div>
                            ) : analyticsData ? (
                                <div className="flex-1 overflow-hidden flex flex-col p-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                                        {[
                                            { label: 'Completion Rate', value: `${analyticsData.completionRate}%`, color: 'emerald', icon: Zap },
                                            { label: 'Watched By', value: analyticsData.viewed.length, color: 'primary', icon: Users },
                                            { label: 'Not Watched', value: analyticsData.notViewed.length, color: 'rose', icon: Eye }
                                        ].map((stat) => (
                                            <div key={stat.label} className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group overflow-hidden">
                                                <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 rounded-full blur-2xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700`} />
                                                <stat.icon size={18} className={`text-${stat.color}-500 mb-4`} />
                                                <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-2">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-hidden">
                                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                            <div className="flex items-center gap-4 px-6">
                                                <CheckCircle size={16} className="text-emerald-500" />
                                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Finished</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                                                {analyticsData.viewed.map(student => (
                                                    <div key={student._id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-slate-50 hover:border-emerald-100 transition-colors group">
                                                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 overflow-hidden border border-slate-100 group-hover:border-emerald-200 transition-all">
                                                            {student.profilePicture ? (
                                                                <img src={student.profilePicture} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-50 uppercase tracking-tighter">
                                                                    {student.name.substring(0,2)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-black text-slate-900 tracking-tight">{student.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{new Date(student.watchedAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <ChevronRight size={14} className="text-slate-200 group-hover:text-emerald-400 transition-colors" />
                                                    </div>
                                                ))}
                                                {analyticsData.viewed.length === 0 && (
                                                    <div className="py-12 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zero Engagement Logged</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                                            <div className="flex items-center gap-4 px-6">
                                                <Activity size={16} className="text-rose-400" />
                                                <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Pending</h3>
                                            </div>
                                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 space-y-3">
                                                {analyticsData.notViewed.map(student => (
                                                    <div key={student._id} className="flex items-center gap-4 p-5 rounded-[2rem] bg-white border border-slate-50 opacity-60 hover:opacity-100 transition-all hover:border-rose-100 group">
                                                        <div className="w-12 h-12 rounded-[1.2rem] bg-slate-50 overflow-hidden border border-slate-100 grayscale hover:grayscale-0 transition-all">
                                                            {student.profilePicture ? (
                                                                <img src={student.profilePicture} className="w-full h-full object-cover" alt="" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-sm bg-slate-50">
                                                                    {student.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-black text-slate-900 tracking-tight">{student.name}</p>
                                                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1">{student.studentId}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {analyticsData.notViewed.length === 0 && (
                                                    <div className="py-12 text-center bg-emerald-50 rounded-[2rem] border border-emerald-100">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Convergence Achieved 🎉</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default VideoManager;
