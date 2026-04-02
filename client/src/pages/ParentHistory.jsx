import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Clock, 
    CheckCircle, 
    Video, 
    FileText, 
    BarChart, 
    Zap, 
    ChevronRight, 
    Activity, 
    Target, 
    Trophy,
    Layout,
    Database,
    ShieldCheck,
    UserCircle,
    Play,
    Award
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const ParentHistory = () => {
    usePageTitle('Child Learning History');
    const [history, setHistory] = useState({ completedVideos: [], submissions: [], stats: {} });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/parents/child-history');
                setHistory(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Child history telemetry failed:', error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <Loader fullScreen={true} />;

    const { completedVideos, submissions, stats: apiStats } = history;
    const stats = {
        total: completedVideos.length + submissions.length,
        avgScore: submissions.length > 0 
            ? Math.round(submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / submissions.length) 
            : 0
    };

    const tabs = [
        { id: 'all', label: 'Consolidated Stream', icon: Activity },
        { id: 'lessons', label: 'Cinema Protocols', icon: Video },
        { id: 'quizzes', label: 'Assessment Quests', icon: FileText }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Neural Progress Oversight Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <ShieldCheck size={14} /> Guardian Oversight Protocol
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance">
                            Progress <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Oversight Hub</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg text-balance">
                            Maintain a synchronized overview of your child's instructional engagements and cognitive achievement trajectory.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[200px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Engagements</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.total}</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Telemetry Active</span>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[200px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Cognitive Index</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.avgScore}%</h3>
                            <div className="mt-4 flex items-center gap-2 text-indigo-400">
                                <Award size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Validated Stats</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glassmorphic Stats Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-4xl transition-all"
                >
                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <Video size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cinema Protocol</p>
                        <h3 className="text-2xl font-black text-slate-900">
                            {completedVideos.length} <span className="text-sm text-slate-300 font-bold">/ {apiStats?.totalVideos || '-'}</span>
                        </h3>
                    </div>
                </motion.div>
                
                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-4xl transition-all"
                >
                    <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                        <FileText size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Assessment Quests</p>
                        <h3 className="text-2xl font-black text-slate-900">
                            {submissions.length} <span className="text-sm text-slate-300 font-bold">/ {apiStats?.totalQuizzes || '-'}</span>
                        </h3>
                    </div>
                </motion.div>

                <motion.div 
                    whileHover={{ y: -5 }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center gap-6 group hover:shadow-4xl transition-all"
                >
                    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.25rem] flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-inner">
                        <BarChart size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Academic Vigor</p>
                        <h3 className="text-2xl font-black text-slate-900">{stats.avgScore}% Average</h3>
                    </div>
                </motion.div>
            </div>

            {/* Precision Filter Hub */}
            <div className="flex flex-wrap gap-4 mb-8">
                {tabs.map((tab) => (
                    <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            activeTab === tab.id 
                            ? 'bg-slate-950 text-white shadow-xl scale-105' 
                            : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Synchronized Activity Matrix */}
            <div className="space-y-6">
                <AnimatePresence mode="popLayout">
                    {activeTab !== 'quizzes' && completedVideos.map((item, idx) => (
                        <motion.div 
                            layout
                            key={`vid-${item._id}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-4xl hover:border-blue-200 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors" />
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                                    <Video size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.videoId?.title || 'Unknown Video'}</h4>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase tracking-tighter border border-blue-100">Cinema Protocol</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {item.videoId?.subjectId?.name} • Watched on {new Date(item.watchedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle size={14} /> Completed
                                </div>
                                <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-inner">
                                    <Play size={16} fill="currentColor" />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {activeTab !== 'lessons' && submissions.map((sub, idx) => (
                        <motion.div 
                            layout
                            key={`sub-${sub._id}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:shadow-4xl hover:border-purple-200 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-100 transition-colors" />
                            
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all shadow-inner">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h4 className="text-xl font-black text-slate-900 group-hover:text-purple-600 transition-colors">{sub.quizId?.title || 'Untitled Assessment'}</h4>
                                        <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-[8px] font-black uppercase tracking-tighter border border-purple-100">Quest Protocol</span>
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        Submitted {new Date(sub.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 relative z-10 w-full md:w-auto justify-end">
                                <div className="bg-slate-50 px-6 py-2 rounded-xl border border-slate-100 flex flex-col items-center">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Quest Score</span>
                                    <span className={`text-xl font-black tracking-tighter ${sub.score >= 50 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {sub.score !== undefined ? Math.round(sub.score) + '%' : 'N/A'}
                                    </span>
                                </div>
                                <button className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-inner">
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {completedVideos.length === 0 && submissions.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100"
                    >
                        <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                            <Database size={48} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-2">No Historical Artifacts Logged</h3>
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Temporal oversight is currently empty</p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default ParentHistory;
