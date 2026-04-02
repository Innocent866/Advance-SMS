import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
    Play, 
    CheckCircle, 
    Clock, 
    BookOpen, 
    Search, 
    X, 
    Award, 
    Video, 
    Check, 
    Target, 
    Zap, 
    ChevronRight, 
    ArrowRight,
    Library,
    Compass,
    Shield,
    Terminal,
    Cpu,
    Database,
    Binary
} from 'lucide-react';
import QuizModal from '../components/QuizModal';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const StudentVideos = () => {
    usePageTitle('Learning Intelligence Journey');
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [activeSubject, setActiveSubject] = useState('All');
    const [completedVideoIds, setCompletedVideoIds] = useState(new Set());
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedVideo?._id) {
            api.post(`/learning/videos/${selectedVideo._id}/view`).catch(err => console.error('View synchronization failure:', err));
        }
    }, [selectedVideo?._id]);

    const fetchData = async () => {
        try {
            const [videosRes, subjectsRes, historyRes] = await Promise.all([
                api.get('/learning/videos'),
                api.get('/learning/subjects'),
                api.get('/learning/history')
            ]);
            setVideos(videosRes.data);
            setSubjects(subjectsRes.data);
            
            const completedIds = new Set(historyRes.data.completedVideos.map(item => item.videoId._id));
            setCompletedVideoIds(completedIds);

            setLoading(false);
        } catch (error) {
            console.error('Core sync failure:', error);
            setError(error.response?.data?.message || 'Access Issue: Navigation vectors missing. Ensure class assignment.');
            setLoading(false);
        }
    };

    const markAsComplete = async (videoId) => {
        try {
            await api.post(`/learning/progress/${videoId}`);
            const newSet = new Set(completedVideoIds);
            newSet.add(videoId);
            setCompletedVideoIds(newSet);
        } catch (error) {
            console.error('Completion protocol failure:', error);
        }
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) return `http://localhost:5001${url}`;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
        return url;
    };

    const filteredVideos = activeSubject === 'All' 
        ? videos 
        : videos.filter(v => v.subjectId?._id === activeSubject);

    if (loading) return <Loader type="spinner" />;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-32 text-center">
                 <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-rose-50/50 border border-rose-100 p-12 rounded-[3.5rem] inline-block shadow-lg backdrop-blur-sm"
                 >
                    <div className="bg-rose-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-10 h-10 text-rose-500" />
                    </div>
                    <h3 className="font-black text-slate-900 text-2xl mb-4 tracking-tight">Access Protocol Failure</h3>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">{error}</p>
                 </motion.div>
            </div>
        );
    }

    if (selectedVideo) {
        const isLocalVideo = selectedVideo.videoUrl?.startsWith('/uploads');
        const videoSrc = getEmbedUrl(selectedVideo.videoUrl);
        const isCompleted = completedVideoIds.has(selectedVideo._id);

        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-[1600px] mx-auto px-4 py-12"
            >
                <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-6">
                    <button 
                        onClick={() => { setSelectedVideo(null); setShowQuiz(false); }}
                        className="group flex items-center gap-4 px-6 py-3 bg-white border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                        <X size={16} className="group-hover:rotate-90 transition-transform" /> Exit Cinema
                    </button>
                    
                    <div className="flex gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Artifact</span>
                            <span className="text-sm font-black text-slate-900 tracking-tight">{selectedVideo.title}</span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-primary shadow-lg">
                            <Binary size={18} />
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-8">
                        {/* High-Fidelity Cinema Screen */}
                        <div className="bg-slate-950 rounded-[4rem] overflow-hidden aspect-video shadow-4xl relative group">
                            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent pointer-events-none transition-opacity opacity-0 group-hover:opacity-100" />
                            {isLocalVideo ? (
                                <video 
                                    src={videoSrc} 
                                    controls 
                                    className="w-full h-full object-contain"
                                    controlsList="nodownload" 
                                    onEnded={() => markAsComplete(selectedVideo._id)}
                                >
                                    System Error: Video stream corrupted.
                                </video>
                            ) : (
                                <iframe 
                                    src={videoSrc}
                                    title={selectedVideo.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>

                        <div className="bg-white rounded-[3.5rem] shadow-4xl border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="p-12 relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 pb-12 border-b border-slate-50">
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10">
                                            <Zap size={12} fill="currentColor" /> Intelligence Stream
                                        </div>
                                        <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedVideo.title}</h1>
                                        <div className="flex items-center gap-6 text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <BookOpen size={16} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{selectedVideo.subjectId?.name}</span>
                                            </div>
                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                            {isCompleted ? (
                                                <div className="flex items-center gap-2 text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                                                    <CheckCircle size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Protocol Complete</span>
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => markAsComplete(selectedVideo._id)}
                                                    className="group flex items-center gap-2 text-primary hover:underline"
                                                >
                                                    <Clock size={16} className="group-hover:rotate-12 transition-transform" />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Mark as Complete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setShowQuiz(true)}
                                        className="bg-slate-950 text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-black flex items-center gap-4 transition-all shadow-4xl shadow-slate-900/40 relative group overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        <Award size={20} className="text-primary" />
                                        Initialize Quiz
                                    </motion.button>
                                </div>

                                <div className="space-y-12">
                                    <div>
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Metadata Analysis</h3>
                                        <p className="text-slate-600 font-medium text-lg leading-relaxed">{selectedVideo.description}</p>
                                    </div>

                                    {selectedVideo.lessonNotes && (
                                        <div className="p-10 bg-slate-50 rounded-[3rem] border border-slate-100 relative group">
                                            <div className="absolute top-8 right-8 text-primary group-hover:scale-125 transition-transform">
                                                <Terminal size={24} />
                                            </div>
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Pedagogical Notes</h3>
                                            <div className="prose max-w-none text-slate-700 font-medium text-sm leading-[1.8] whitespace-pre-wrap">
                                                {selectedVideo.lessonNotes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 overflow-hidden sticky top-8">
                            <div className="p-8 bg-slate-50/50 border-b border-slate-50 flex items-center justify-between">
                                <h3 className="font-black text-slate-900 tracking-tight text-lg">Next Vector</h3>
                                <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-300">
                                    <ChevronRight size={18} />
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                {videos.filter(v => v._id !== selectedVideo._id).slice(0, 4).map((v, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={v._id} 
                                        onClick={() => setSelectedVideo(v)}
                                        className="flex gap-4 cursor-pointer group p-2 rounded-3xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                                    >
                                        <div className="w-28 h-20 bg-slate-900 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-all relative overflow-hidden">
                                            <Play size={20} className="text-white/40 group-hover:text-primary group-hover:scale-125 transition-all z-10"/>
                                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 to-transparent" />
                                            {completedVideoIds.has(v._id) && (
                                                <div className="absolute top-2 right-2 bg-emerald-500 rounded-full p-1 border border-white z-20">
                                                    <Check size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h4 className="text-[13px] font-black text-slate-900 line-clamp-2 group-hover:text-primary transition-colors leading-snug">{v.title}</h4>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{v.subjectId?.name}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                                {videos.length <= 1 && (
                                    <div className="py-12 text-center">
                                        <Cpu className="mx-auto text-slate-100 mb-4" size={48} />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Alternates Found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {showQuiz && (
                    <QuizModal videoId={selectedVideo._id} onClose={() => setShowQuiz(false)} />
                )}
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto px-4 pb-32"
        >
            {/* Student Journey Header */}
            <div className="relative mb-16 p-16 rounded-[4rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Compass size={14} className="animate-spin-slow" /> Intelligence Discovery
                        </div>
                        <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[1.1]">
                            Learning <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400 italic">Library Index</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-2xl leading-relaxed">
                            Navigate the neural archives of your academic journey. Current terminal: {user?.classId?.name || 'Class N/A'}.
                        </p>
                    </div>

                    <div className="hidden lg:flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Intelligence Quotient</p>
                            <p className="text-4xl font-black text-white leading-none tabular-nums">{completedVideoIds.size}<span className="text-slate-700"> / </span>{videos.length}</p>
                        </div>
                        <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-primary backdrop-blur-3xl shadow-2xl">
                            <Database size={32} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Neural Subject Filter Chips */}
            <div className="mb-12 overflow-x-auto pb-4 px-4 scrollbar-hide">
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setActiveSubject('All')}
                        className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${activeSubject === 'All' ? 'bg-slate-950 text-white shadow-4xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                    >
                        Synchronize All
                    </motion.button>
                    {subjects.map(sub => (
                        <motion.button
                            key={sub._id}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveSubject(sub._id)}
                            className={`px-8 py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-3 whitespace-nowrap ${activeSubject === sub._id ? 'bg-primary text-white shadow-4xl' : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${activeSubject === sub._id ? 'bg-white animate-pulse' : 'bg-slate-200'}`} />
                            {sub.name}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* High-Fidelity Video Artifact Matrix */}
            <AnimatePresence mode="wait">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10"
                >
                    {filteredVideos.map((video, idx) => (
                        <motion.div 
                            key={video._id} 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedVideo(video)}
                            className="bg-white rounded-[3.5rem] shadow-3xl border border-slate-100 cursor-pointer group hover:shadow-4xl hover:-translate-y-2 transition-all duration-500 overflow-hidden relative"
                        >
                             <div className="aspect-video bg-slate-100 flex items-center justify-center relative overflow-hidden">
                                <Video className="text-slate-200 group-hover:text-primary/20 transition-all duration-700" size={64} />
                                
                                {completedVideoIds.has(video._id) && (
                                    <div className="absolute top-6 right-6 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl z-20 animate-in fade-in zoom-in duration-500">
                                        <CheckCircle2 size={14} /> Synchronized
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                                
                                <div className="absolute inset-0 flex items-center justify-center z-20">
                                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center shadow-4xl transform scale-0 group-hover:scale-100 transition-transform duration-500 border border-white/20">
                                        <Play size={32} className="text-white fill-white ml-2 shadow-2xl" />
                                    </div>
                                </div>
                                <div className="absolute bottom-6 left-8 right-8 flex justify-between items-center z-20 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-4 group-hover:translate-y-0 duration-500">
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/20 backdrop-blur-md px-3 py-1 rounded-lg">Cinema Mode</span>
                                </div>
                             </div>

                             <div className="p-10 relative">
                                 <div className="flex justify-between items-start mb-6">
                                    <span className="bg-primary/5 text-primary text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-primary/10 transition-colors group-hover:bg-primary group-hover:text-white group-hover:border-primary">
                                        {video.subjectId?.name}
                                    </span>
                                 </div>
                                 <h3 className="font-black text-slate-900 mb-3 text-xl tracking-tight leading-snug line-clamp-2 transition-colors group-hover:text-primary">{video.title}</h3>
                                 <p className="text-sm text-slate-500 font-medium line-clamp-2 mb-8 leading-relaxed italic">{video.description || 'Accessing neural metadata for this lesson object...'}</p>
                                 
                                 <div className="flex items-center justify-between gap-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-600 transition-colors">
                                        <Target size={14} />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{video.classLevelId?.name}</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-primary group-hover:text-white group-hover:rotate-12 transition-all shadow-sm">
                                        <ArrowRight size={16} />
                                    </div>
                                 </div>
                             </div>
                        </motion.div>
                    ))}
                </motion.div>
            </AnimatePresence>

            {filteredVideos.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-40 border-2 border-dashed border-slate-100 rounded-[4rem] bg-white shadow-inner"
                >
                    <Library size={80} className="mx-auto text-slate-100 mb-8" />
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Archives Void</h3>
                    <p className="text-slate-400 font-medium text-xl max-w-lg mx-auto italic">Synchronize with your instructor to populate the intelligence library for this sector.</p>
                </motion.div>
            )}
        </motion.div>
    );
};

// Local component for icon consistency
const CheckCircle2 = ({ size }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default StudentVideos;
