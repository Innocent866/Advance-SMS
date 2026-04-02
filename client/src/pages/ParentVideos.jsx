import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    PlayCircle, 
    BookOpen, 
    Clock, 
    Search, 
    Filter, 
    CheckCircle, 
    ShieldAlert, 
    Info, 
    User, 
    Calendar,
    ArrowRight,
    Play,
    Eye,
    Zap,
    Cpu,
    Database,
    FileText
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const ParentVideos = () => {
    usePageTitle('Video Insights Hub');
    const [videos, setVideos] = useState([]);
    const [completedVideoIds, setCompletedVideoIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [videosRes, historyRes] = await Promise.all([
                    api.get('/parents/child-videos'),
                    api.get('/parents/child-history')
                ]);
                
                setVideos(videosRes.data);
                const completedIds = new Set(historyRes.data.completedVideos.map(item => item.videoId._id || item.videoId));
                setCompletedVideoIds(completedIds);
                setLoading(false);
                if (videosRes.data.length > 0) setSelectedVideo(videosRes.data[0]);
            } catch (error) {
                console.error('Data acquisition failure:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const subjects = ['All', ...new Set(videos.map(v => v.subjectId?.name).filter(Boolean))];

    const filteredVideos = videos.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = selectedSubject === 'All' || v.subjectId?.name === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    const completionRate = videos.length > 0 
        ? Math.round((completedVideoIds.size / videos.length) * 100) 
        : 0;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* High-Fidelity Video Insights Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Eye size={14} /> Pedagogical Oversight Hub
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Video Learning <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Intelligence Insight</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg">
                            Monitor your child's engagement with visual learning artifacts and track curriculum ingestion progress.
                        </p>
                    </div>

                    <div className="bg-white/5 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/10 flex items-center gap-8 min-w-[320px] shadow-2xl relative group overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                         <div className="relative z-10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Overall Completion</p>
                            <h3 className="text-6xl font-black text-white leading-none tracking-tighter">{completionRate}%</h3>
                            <div className="mt-6 flex items-center gap-4">
                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{completedVideoIds.size} / {videos.length} Artifacts</span>
                                <div className="flex-grow h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completionRate}%` }}
                                        className="h-full bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.5)]"
                                    />
                                </div>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                 {/* Precision Filter & List Panel */}
                 <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-8 rounded-[3rem] shadow-4xl border border-slate-100 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text" 
                                placeholder="Filter lessons..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                            <select 
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                className="w-full pl-16 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm animate-pulse flex items-center gap-6">
                                        <div className="w-14 h-14 bg-slate-100 rounded-2xl" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 bg-slate-100 rounded-full w-3/4" />
                                            <div className="h-2 bg-slate-50 rounded-full w-1/2" />
                                        </div>
                                    </div>
                                ))
                            ) : filteredVideos.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center bg-white rounded-[3rem] border border-dashed border-slate-200"
                                >
                                    <Database size={40} className="mx-auto text-slate-100 mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching artifacts</p>
                                </motion.div>
                            ) : (
                                filteredVideos.map(video => {
                                    const isWatched = completedVideoIds.has(video._id);
                                    const isActive = selectedVideo?._id === video._id;
                                    return (
                                        <motion.div 
                                            layout
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={video._id}
                                            onClick={() => setSelectedVideo(video)}
                                            className={`p-6 rounded-[2.5rem] cursor-pointer transition-all relative group overflow-hidden ${isActive ? 'bg-slate-950 text-white shadow-3xl translate-x-4' : 'bg-white text-slate-400 border border-slate-100 hover:border-primary/20 hover:text-slate-600 shadow-sm'}`}
                                        >
                                            <div className="relative z-10 flex items-center gap-6">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isActive ? 'bg-white/10 text-primary shadow-xl' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/5 group-hover:text-primary'}`}>
                                                    {isWatched ? <CheckCircle size={24} /> : <Zap size={24} />}
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex justify-between items-center mb-1">
                                                        <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${isActive ? 'text-primary' : 'text-slate-300'}`}>{video.subjectId?.name}</span>
                                                        {isWatched && <span className="text-[8px] font-black px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full uppercase">Watched</span>}
                                                    </div>
                                                    <h3 className={`font-black text-sm tracking-tight line-clamp-1 ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-primary'}`}>{video.title}</h3>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>
                    </div>
                 </div>

                 {/* High-Fidelity Insight Matrix */}
                 <div className="lg:col-span-8">
                     <AnimatePresence mode="wait">
                        {selectedVideo ? (
                            <motion.div 
                                key={selectedVideo._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                {/* Restricted Insight Console */}
                                <div className="bg-white rounded-[4rem] shadow-4xl border border-slate-100 overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 group-hover:scale-125 transition-transform duration-1000" />
                                    
                                    {/* Preview Overlay */}
                                    <div className="aspect-video bg-slate-950 relative flex flex-col items-center justify-center overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-slate-950 to-indigo-500/10" />
                                        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
                                            <PlayCircle size={400} strokeWidth={0.5} className="text-white" />
                                        </div>
                                        
                                        <div className="relative z-10 text-center px-12 space-y-8">
                                            <div className="w-24 h-24 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex items-center justify-center mx-auto shadow-4xl ring-8 ring-white/5 group-hover:scale-110 transition-transform duration-500">
                                                <ShieldAlert size={40} className="text-primary animate-pulse" />
                                            </div>
                                            <div className="space-y-4">
                                                <h3 className="text-3xl font-black text-white tracking-tight">Direct Playback Restricted</h3>
                                                <p className="text-slate-400 font-medium max-w-md mx-auto text-base">
                                                    Academic privacy protocol enabled. Multimedia content ingestion is restricted to Student Nodes only.
                                                </p>
                                            </div>
                                            <div className="inline-flex items-center gap-4 px-6 py-3 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary group-hover:bg-primary group-hover:text-white transition-all cursor-default">
                                                <LockIcon size={14} /> Full Pedagogical Access Granted to Child
                                            </div>
                                        </div>
                                    </div>

                                    {/* Metadata Strip */}
                                    <div className="p-10">
                                         <div className="flex flex-wrap items-center justify-between gap-8 mb-10 border-b border-slate-50 pb-10">
                                            <div className="space-y-2">
                                                <h2 className="text-4xl font-black text-slate-900 tracking-tight">{selectedVideo.title}</h2>
                                                <div className="flex items-center gap-6">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <BookOpen size={12} className="text-primary" /> {selectedVideo.subjectId?.name}
                                                    </p>
                                                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <Play size={12} className="text-primary" fill="currentColor" /> {selectedVideo.topic}
                                                    </p>
                                                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                        <User size={12} className="text-primary" /> {selectedVideo.teacherId?.name}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-10 py-5 rounded-[2rem] border flex items-center gap-4 shadow-sm ${completedVideoIds.has(selectedVideo._id) ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                                                {completedVideoIds.has(selectedVideo._id) ? <CheckCircle size={24} /> : <Clock size={24} />}
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Pedagogical Status</p>
                                                    <p className="text-lg font-black leading-none">{completedVideoIds.has(selectedVideo._id) ? 'Completed' : 'Not Started'}</p>
                                                </div>
                                            </div>
                                         </div>

                                         <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                             <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                        <Info size={18} />
                                                    </div>
                                                    <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.3em]">Module Overview</h4>
                                                </div>
                                                <p className="text-slate-600 font-medium leading-relaxed text-lg">
                                                    {selectedVideo.description}
                                                </p>
                                             </div>

                                             <div className="space-y-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-primary shadow-sm">
                                                        <FileText size={18} />
                                                    </div>
                                                    <h4 className="text-[11px] font-black text-slate-950 uppercase tracking-[0.3em]">Pedagogical Register (Notes)</h4>
                                                </div>
                                                {selectedVideo.lessonNotes ? (
                                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative group/notes overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12" />
                                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] mb-4">Registry Ingestion Active</p>
                                                        <div className="text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-4 custom-scrollbar">
                                                            {selectedVideo.lessonNotes}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 text-center">
                                                        <Cpu size={32} className="mx-auto text-slate-100 mb-3" />
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No notes synchronized for this artifact</p>
                                                    </div>
                                                )}
                                             </div>
                                         </div>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-white rounded-[4rem] p-32 text-center border-2 border-dashed border-slate-100"
                            >
                                <PlayCircle size={80} className="mx-auto text-slate-50 mb-8" />
                                <h3 className="text-2xl font-black text-slate-400 tracking-tight">Select an Artifact to Inspect</h3>
                                <p className="text-slate-300 font-bold uppercase tracking-widest text-[10px] mt-4">Browse the intelligence index on the left</p>
                            </motion.div>
                        )}
                     </AnimatePresence>
                 </div>
            </div>
        </div>
    );
};

// Local lock icon for consistency
const LockIcon = ({ size }) => (
    <svg 
        width={size} height={size} viewBox="0 0 24 24" fill="none" 
        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

export default ParentVideos;
