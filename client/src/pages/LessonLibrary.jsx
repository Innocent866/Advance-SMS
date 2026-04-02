import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen, 
    Calendar, 
    ArrowRight, 
    Plus, 
    Copy, 
    Trash2, 
    Edit2, 
    Filter, 
    Search, 
    Layout, 
    Database, 
    Zap, 
    Cpu, 
    Clipboard, 
    Users,
    ChevronRight,
    Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const LessonLibrary = () => {
    usePageTitle('Curriculum Artifact Archive');
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        classLevel: '',
        subject: '',
        term: '',
        searchTerm: ''
    });

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [lessonsRes, subjectsRes, classesRes] = await Promise.all([
                    api.get('/lessons'),
                    api.get('/academic/subjects'),
                    api.get('/academic/classes')
                ]);
                setLessons(lessonsRes.data);
                setFilteredLessons(lessonsRes.data);
                setSubjects(subjectsRes.data);
                setClasses(classesRes.data);
                setLoading(false);
            } catch (error) {
                console.error('Curriculum registry failure:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        let result = lessons;
        if (filters.classLevel) {
            result = result.filter(l => l.classLevelId?._id === filters.classLevel || l.classLevelId === filters.classLevel);
        }
        if (filters.subject) {
            result = result.filter(l => l.subjectId?._id === filters.subject || l.subjectId === filters.subject);
        }
        if (filters.term) {
            result = result.filter(l => l.term === filters.term);
        }
        if (filters.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            result = result.filter(l => 
                l.topic?.toLowerCase().includes(term) || 
                l.subjectId?.name?.toLowerCase().includes(term)
            );
        }
        setFilteredLessons(result);
    }, [filters, lessons]);

    const handleDelete = async (id) => {
        if (!window.confirm('Execute deletion protocol for this artifact?')) return;
        try {
            await api.delete(`/lessons/${id}`);
            setLessons(lessons.filter(l => l._id !== id));
        } catch (error) {
            console.error('Artifact deletion failure:', error);
        }
    };

    if (loading) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Neural Archive Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Database size={14} /> Pedagogical Repository
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Curriculum <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Artifact Archive</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg">
                            Access and manage synchronized lesson architectures, pedagogical notes, and instructional slides.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[200px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Total Artifacts</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{lessons.length}</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Synchronized</span>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <Link 
                            to="/lessons/create"
                            className="bg-primary hover:bg-primary/90 text-white p-1 rounded-[2.5rem] shadow-4xl shadow-primary/20 flex flex-col items-center justify-center min-w-[200px] group transition-all active:scale-95"
                        >
                            <div className="p-8 text-center space-y-4">
                                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto group-hover:rotate-90 transition-transform duration-500">
                                    <Plus size={32} strokeWidth={3} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Initialize New</p>
                                    <p className="text-xl font-black">Plan Generator</p>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Precision Command Console (Filters) */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] shadow-4xl border border-slate-100 mb-12 flex flex-wrap gap-8 items-center"
            >
                <div className="flex items-center gap-4 text-slate-900">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-slate-100">
                        <Filter size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Precision Filters</span>
                </div>

                <div className="flex-1 min-w-[200px] relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm transition-all"
                        placeholder="Search topics or subjects..."
                        value={filters.searchTerm}
                        onChange={e => setFilters({...filters, searchTerm: e.target.value})}
                    />
                </div>

                <div className="flex flex-wrap gap-4 flex-grow lg:flex-grow-0">
                    <select 
                        className="pl-6 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                        value={filters.classLevel}
                        onChange={e => setFilters({...filters, classLevel: e.target.value})}
                    >
                        <option value="">All Academic Levels</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    <select 
                        className="pl-6 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                        value={filters.subject}
                        onChange={e => setFilters({...filters, subject: e.target.value})}
                    >
                        <option value="">All Intellectual Domains</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>

                    <select 
                        className="pl-6 pr-12 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                        value={filters.term}
                        onChange={e => setFilters({...filters, term: e.target.value})}
                    >
                        <option value="">All Terms</option>
                        <option value="First">First Term</option>
                        <option value="Second">Second Term</option>
                        <option value="Third">Third Term</option>
                    </select>

                    <button 
                        onClick={() => setFilters({ classLevel: '', subject: '', term: '', searchTerm: '' })}
                        className="px-6 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        Reset Matrix
                    </button>
                </div>
            </motion.div>

            {/* Glassmorphic Artifact Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredLessons.map((lesson, idx) => (
                        <motion.div 
                            layout
                            key={lesson._id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-4xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 group-hover:bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
                            
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="space-y-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary">
                                        {lesson.classLevelId?.name}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <BookOpen size={12} className="text-slate-300" /> {lesson.subjectId?.name}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl text-slate-300 group-hover:text-primary transition-colors shadow-inner">
                                    <Sparkles size={18} />
                                </div>
                            </div>
                            
                            <h3 className="text-2xl font-black text-slate-900 mb-6 line-clamp-2 tracking-tight flex-grow h-14 group-hover:text-primary transition-colors">{lesson.topic}</h3>
                            
                            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 mb-8 space-y-3 relative overflow-hidden group/session">
                                <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent scale-x-0 group-hover/session:scale-x-100 transition-transform duration-700" />
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span className="flex items-center gap-2"><Calendar size={14} className="text-primary" /> Session Sync</span>
                                    <span className="text-slate-900">Active</span>
                                </div>
                                <p className="text-sm font-bold text-slate-600 flex items-center gap-2">
                                     Term {lesson.term} <ChevronRight size={14} /> Week {lesson.week}
                                </p>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 font-black text-[10px] uppercase">
                                        {lesson.teacherId?.name?.substring(0,2)}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{lesson.teacherId?.name}</span>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => navigate('/lessons/create', { state: { lesson, mode: 'edit' } })}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-slate-950 hover:text-white transition-all shadow-sm"
                                        title="Edit Artifact"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate('/lessons/create', { state: { lesson, mode: 'duplicate' } })}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm"
                                        title="Duplicate Logic"
                                    >
                                        <Copy size={14} />
                                    </button>

                                    <button 
                                        onClick={() => handleDelete(lesson._id)}
                                        className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                        title="Execute Deletion"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredLessons.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200">
                        <Layout size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-2">Matrix Variance Detected</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">No lesson plans synchronized for this selection</p>
                </motion.div>
            )}
        </div>
    );
};

export default LessonLibrary;
