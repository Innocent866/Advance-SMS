import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    ToggleLeft, 
    ToggleRight, 
    Save, 
    Zap, 
    PlayCircle, 
    BookOpen, 
    ChevronRight, 
    CheckCircle2, 
    XCircle,
    Info,
    Layers,
    Layout,
    ArrowRight,
    Settings2,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const LearningSettings = () => {
    usePageTitle('Learning Path Command Center');
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, s] = await Promise.all([
                    api.get('/academic/classes'),
                    api.get('/academic/subjects')
                ]);
                setClasses(c.data);
                setSubjects(s.data);
            } catch (error) {
                console.error('Data Fetch Failure:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleClassLearning = async (classId, currentValue) => {
        setUpdatingId(classId);
        try {
            await api.post('/academic/classes/settings', {
                classId,
                hasAfterSchoolLearning: !currentValue
            });
            updateLocalClass(classId, { hasAfterSchoolLearning: !currentValue });
        } catch (error) {
            console.error('Update Failure:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleSubjectVideo = async (classId, subjectId, currentList) => {
        const isEnabled = currentList.includes(subjectId);
        let newList = isEnabled 
            ? currentList.filter(id => id !== subjectId) 
            : [...currentList, subjectId];

        try {
            await api.post('/academic/classes/settings', {
                classId,
                videoSubjects: newList
            });
            updateLocalClass(classId, { videoSubjects: newList });
        } catch (error) {
            console.error('Subject Update Failure:', error);
        }
    };

    const updateLocalClass = (id, updates) => {
        setClasses(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500 font-medium tracking-wide">Initializing Learning Intelligence...</p>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto pb-20 px-4"
        >
            {/* High-Fidelity Header */}
            <div className="relative mb-12 p-10 rounded-[3rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -ml-32 -mb-32" />
                
                <div className="relative flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Sparkles size={12} className="text-amber-400" /> Pedagogical Intelligence
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Learning Path <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-400">Command Center</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl text-lg">
                            Orchestrate digital learning pathways and video-enabled curricula across all academic tiers.
                        </p>
                    </div>
                    <div className="w-24 h-24 rounded-[2rem] bg-white/5 backdrop-blur-2xl border border-white/10 flex items-center justify-center shadow-inner group transition-all duration-500 hover:scale-110">
                        <Zap size={48} className="text-primary animate-pulse group-hover:drop-shadow-[0_0_15px_rgba(22,163,74,0.5)]" />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {classes.map((c, index) => (
                    <motion.div 
                        key={c._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`group relative bg-white rounded-[2.5rem] border transition-all duration-500 overflow-hidden ${
                            c.hasAfterSchoolLearning 
                                ? 'border-primary/20 shadow-xl shadow-primary/5' 
                                : 'border-gray-100 shadow-sm opacity-90'
                        }`}
                    >
                        {/* Class Hub Header */}
                        <div className={`p-8 flex flex-col md:flex-row justify-between items-center gap-6 transition-colors duration-500 ${
                            c.hasAfterSchoolLearning ? 'bg-primary/[0.02]' : 'bg-gray-50/50'
                        }`}>
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                                    c.hasAfterSchoolLearning 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/30 rotate-3' 
                                        : 'bg-white text-gray-400 border border-gray-100 shadow-inner'
                                }`}>
                                    <Layout size={32} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">{c.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-black uppercase tracking-widest">{c.category} Level</span>
                                        {c.hasAfterSchoolLearning && (
                                            <span className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest animate-in fade-in slide-in-from-left-2">
                                                <CheckCircle2 size={12} /> Pathway Active
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-3 rounded-3xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${
                                    c.hasAfterSchoolLearning ? 'text-primary' : 'text-gray-400'
                                }`}>
                                    After-School Learning
                                </span>
                                <button 
                                    onClick={() => toggleClassLearning(c._id, c.hasAfterSchoolLearning)}
                                    disabled={updatingId === c._id}
                                    className={`relative w-16 h-9 transition-all duration-500 rounded-full flex items-center px-1.5 ${
                                        c.hasAfterSchoolLearning ? 'bg-primary' : 'bg-gray-200'
                                    } ${updatingId === c._id ? 'opacity-50 grayscale' : ''}`}
                                >
                                    <motion.div 
                                        animate={{ x: c.hasAfterSchoolLearning ? 28 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        className="w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center"
                                    >
                                        {updatingId === c._id ? (
                                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                        ) : c.hasAfterSchoolLearning ? (
                                            <CheckCircle2 size={12} className="text-primary" />
                                        ) : (
                                            <XCircle size={12} className="text-gray-400" />
                                        )}
                                    </motion.div>
                                </button>
                            </div>
                        </div>

                        {/* Subject Matrix */}
                        <AnimatePresence>
                            {c.hasAfterSchoolLearning && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-8 border-t border-gray-100 bg-white">
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                            <div className="space-y-1">
                                                <h4 className="text-lg font-black text-gray-900 flex items-center gap-2">
                                                    <BookOpen size={20} className="text-primary" /> Subject Video Pathways
                                                </h4>
                                                <p className="text-xs text-gray-500 font-medium">Select subjects to enable specialized video-based instructional learning.</p>
                                            </div>
                                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-center gap-3">
                                                <Info size={16} className="text-blue-500" />
                                                <p className="text-[10px] font-bold text-blue-600 leading-tight">
                                                    Video lessons for these subjects will <br /> appear in student learning hubs.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {c.subjects?.map(subId => {
                                                const subject = subjects.find(s => s._id === (subId._id || subId));
                                                if(!subject) return null;

                                                const isVideoEnabled = c.videoSubjects?.includes(subject._id);

                                                return (
                                                    <motion.button 
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        key={subject._id}
                                                        onClick={() => toggleSubjectVideo(c._id, subject._id, c.videoSubjects || [])}
                                                        className={`group/btn relative p-5 rounded-[2rem] border-2 text-left transition-all duration-300 flex flex-col gap-3 overflow-hidden ${
                                                            isVideoEnabled 
                                                            ? 'bg-primary/[0.03] border-primary shadow-lg shadow-primary/5' 
                                                            : 'bg-gray-50/50 border-gray-100 text-gray-400 hover:bg-white hover:border-gray-200 shadow-sm'
                                                        }`}
                                                    >
                                                        {isVideoEnabled && (
                                                            <div className="absolute top-0 right-0 p-3 opacity-10">
                                                                <PlayCircle size={60} />
                                                            </div>
                                                        )}
                                                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                                            isVideoEnabled ? 'bg-primary text-white' : 'bg-white text-gray-300'
                                                        }`}>
                                                            {isVideoEnabled ? <PlayCircle size={20} /> : <BookOpen size={20} />}
                                                        </div>
                                                        <div>
                                                            <p className={`font-black tracking-tight transition-colors ${
                                                                isVideoEnabled ? 'text-gray-900' : 'text-gray-500'
                                                            }`}>{subject.name}</p>
                                                            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-0.5">{subject.code || 'CORE'}</p>
                                                        </div>
                                                        {isVideoEnabled && (
                                                            <div className="flex items-center gap-1.5 mt-2 animate-in fade-in zoom-in">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                <span className="text-[9px] font-black text-primary uppercase tracking-[0.1em]">Video Streams Active</span>
                                                            </div>
                                                        )}
                                                    </motion.button>
                                                );
                                            })}
                                            {(!c.subjects || c.subjects.length === 0) && (
                                                <div className="col-span-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border border-dashed border-gray-200">
                                                    <Layers size={40} className="text-gray-300 mb-4" />
                                                    <p className="text-sm text-gray-400 font-black uppercase tracking-widest italic">No Curricular Subjects Assigned</p>
                                                    <button className="mt-4 text-[10px] font-black text-primary underline tracking-widest uppercase hover:text-primary/70">
                                                        Visit Academic Settings
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {!c.hasAfterSchoolLearning && (
                            <div className="px-8 pb-8 pt-2">
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between group-hover:bg-white transition-all">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <ChevronRight size={14} /> Digital pathway currently dormant for this class tier.
                                    </p>
                                    <span className="text-[10px] font-bold text-gray-300">HUB STATUS: INACTIVE</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Bottom Insight Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl bg-gray-900/90 backdrop-blur-2xl text-white px-8 py-5 rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex items-center justify-between z-50"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                        <Zap size={20} className="text-primary" />
                    </div>
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-widest">Global Status</p>
                        <p className="text-xs font-bold text-gray-400">Settings synchronized in real-time across high-density nodes.</p>
                    </div>
                </div>
                <div className="h-10 w-px bg-white/10 hidden md:block" />
                <div className="hidden md:flex items-center gap-8">
                    <div className="text-center">
                        <p className="text-xl font-black text-primary">{classes.filter(c => c.hasAfterSchoolLearning).length}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Active Paths</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-violet-400">{classes.reduce((acc, c) => acc + (c.videoSubjects?.length || 0), 0)}</p>
                        <p className="text-[8px] font-black uppercase tracking-widest text-gray-500">Video Streams</p>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default LearningSettings;
