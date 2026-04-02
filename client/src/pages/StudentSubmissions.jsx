import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    FileText, 
    Zap, 
    Layout, 
    Database, 
    ChevronRight,
    Star,
    MessageSquare,
    Trophy,
    Target,
    Activity
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const StudentSubmissions = () => {
    usePageTitle('My Tasks & Assessments');
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/learning/submissions');
            setSubmissions(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync task registry:', error);
            setLoading(false);
        }
    };

    const stats = {
        total: submissions.length,
        passed: submissions.filter(s => s.passed).length,
        avgScore: submissions.length > 0 
            ? Math.round(submissions.reduce((acc, s) => acc + s.score, 0) / submissions.length) 
            : 0
    };

    if (loading) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Neural Quest Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Target size={14} /> Cognitive Journey
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight text-balance">
                            Task & <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Assessment Hub</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg">
                            Monitor your academic performance, review instructional feedback, and track your path to intellectual mastery.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[200px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Mastery Rate</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.avgScore}%</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <Activity size={14} className="text-primary" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Intel Sync Active</span>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[200px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Completed Quests</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.total}</h3>
                            <div className="mt-4 flex items-center gap-2 text-emerald-400">
                                <Trophy size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Achievement Unlocked</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Glassmorphic Task Matrix */}
            <div className="grid grid-cols-1 gap-8">
                <AnimatePresence mode="popLayout">
                    {submissions.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm"
                        >
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                                <FileText size={48} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-2">No Active Submissions Detected</h3>
                            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Your instructional journey begins here</p>
                        </motion.div>
                    ) : (
                        submissions.map((sub, idx) => (
                            <motion.div 
                                key={sub._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white p-8 md:p-10 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-4xl transition-all duration-500 group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 group-hover:bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32 transition-colors duration-700" />
                                
                                <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {sub.quizId?.classLevelId?.name || 'Academic Core'}
                                            </div>
                                            <div className="px-4 py-1.5 bg-primary/5 text-primary border border-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                {sub.quizId?.subjectId?.name || 'General Domain'}
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-primary transition-colors">
                                            {sub.quizId?.title || 'Knowledge Assessment Artifact'}
                                        </h3>
                                        
                                        <p className="text-slate-500 font-medium line-clamp-2 max-w-2xl leading-relaxed">
                                            {sub.quizId?.description || 'Synchronized curriculum assessment protocol for cognitive validation.'}
                                        </p>

                                        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Clock size={14} className="text-primary" />
                                                {new Date(sub.submittedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                                                <Database size={14} className="text-indigo-400" />
                                                Result Sync: Stable
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch lg:items-center gap-4 w-full lg:w-auto">
                                        <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex-1 lg:min-w-[180px] text-center relative overflow-hidden group/score">
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover/score:opacity-100 transition-opacity" />
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative">Assessment Score</p>
                                            <div className="flex items-center justify-center gap-2 relative">
                                                <h4 className="text-4xl font-black text-slate-900 tracking-tighter">{Math.round(sub.score)}%</h4>
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                            </div>
                                        </div>

                                        <div className={`p-6 rounded-[2rem] border flex items-center justify-center gap-3 transition-all min-w-[160px] ${
                                            sub.passed 
                                            ? 'bg-emerald-50 border-emerald-100 text-emerald-700 shadow-sm shadow-emerald-200/50' 
                                            : 'bg-rose-50 border-rose-100 text-rose-700 shadow-sm shadow-rose-200/50'
                                        }`}>
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${sub.passed ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                                                {sub.passed ? <CheckCircle size={24} strokeWidth={2.5} /> : <XCircle size={24} strokeWidth={2.5} />}
                                            </div>
                                            <div className="text-left leading-none">
                                                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Status</p>
                                                <p className="text-lg font-black tracking-tight">{sub.passed ? 'Mastery' : 'Retry'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Feedback Console Integration */}
                                {sub.feedback && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-8 pt-8 border-t border-slate-100 group-hover:border-primary/10 transition-colors"
                                    >
                                        <div className="bg-indigo-50/50 p-8 rounded-[2.5rem] border border-indigo-100/50 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <MessageSquare size={80} className="text-indigo-900" />
                                            </div>
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                    <Star size={14} fill="currentColor" />
                                                </div>
                                                <span className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Teacher Feedback Protocol</span>
                                            </div>
                                            <p className="text-slate-700 font-bold leading-relaxed relative z-10 text-lg italic">
                                                "{sub.feedback}"
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                                
                                <div className="absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0 translate-x-4 pointer-events-none hidden lg:block">
                                    <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.3em]">
                                        Details Locked <ChevronRight size={14} />
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default StudentSubmissions;
