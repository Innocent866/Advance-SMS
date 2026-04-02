import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    CheckCircle, 
    XCircle, 
    FileText, 
    Video, 
    Filter, 
    BookOpen, 
    ClipboardList, 
    Eye, 
    X,
    Search,
    ChevronRight,
    Sparkles,
    ShieldCheck,
    Clock,
    Calendar,
    User,
    Layers,
    ArrowUpRight,
    Download,
    PlayCircle,
    Info,
    AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';
import UnifiedFilePreview from '../components/UnifiedFilePreview';
import Loader from '../components/Loader';

const ContentOversight = () => {
    usePageTitle('Content Intelligence Hub');
    const [contentType, setContentType] = useState('lesson-plan');
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    // Filters
    const [filters, setFilters] = useState({
        classId: '',
        subjectId: '',
        status: ''
    });

    // Metadata
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchMeta = async () => {
            try {
                const [c, s] = await Promise.all([
                    api.get('/academic/classes'),
                    api.get('/academic/subjects')
                ]);
                setClasses(c.data);
                setSubjects(s.data);
            } catch (error) {
                console.error('Metadata Fetch Failure:', error);
            }
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchContent();
    }, [contentType, filters]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            if (contentType === 'lesson-plan' || contentType === 'video') {
                const params = { type: contentType, ...filters };
                Object.keys(params).forEach(key => !params[key] && delete params[key]);
                const res = await api.get('/admin/content', { params });
                setContent(res.data);
            } else {
                const selectedClass = classes.find(c => c._id === filters.classId);
                const selectedSubject = subjects.find(s => s._id === filters.subjectId);
                const params = {
                    status: filters.status || undefined,
                    classLevel: selectedClass ? selectedClass.name : undefined,
                    subject: selectedSubject ? selectedSubject.name : undefined
                };
                const res = await api.get('/learning-materials', { params });
                let data = res.data;
                if (contentType === 'material') {
                    data = data.filter(item => item.type !== 'Assignment');
                } else if (contentType === 'assignment') {
                    data = data.filter(item => item.type === 'Assignment');
                }
                setContent(data);
            }
        } catch (error) {
            console.error('Content Fetch Failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus, itemType = contentType) => {
        setUpdatingId(id);
        try {
            if (['lesson-plan', 'video', 'Lesson Plan', 'Video Lesson'].includes(itemType)) {
                const typeParam = (itemType === 'video' || itemType === 'Video Lesson') ? 'Video Lesson' : 'Lesson Plan';
                await api.post('/admin/content/status', { id, type: typeParam, status: newStatus });
            } else {
                await api.put(`/learning-materials/${id}/status`, { status: newStatus });
            }
            fetchContent();
            setSelectedItem(null);
        } catch (error) {
            console.error('Status Update Failure:', error);
        } finally {
            setUpdatingId(null);
        }
    };

    const getTypeLabel = (item) => {
        if (contentType === 'lesson-plan') return 'Lesson Plan';
        if (contentType === 'video') return 'Video Lesson';
        return item.type || 'Material'; 
    };

    const getStatusStyles = (status) => {
        switch (status?.toLowerCase()) {
            case 'approved': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
            case 'rejected': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
            case 'draft': return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
            default: return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* High-Fidelity Intelligence Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <ShieldCheck size={14} className="text-emerald-400" /> Content Quality Assurance
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Content <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-primary to-violet-400">Intelligence Hub</span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-2xl text-xl leading-relaxed">
                            A high-density neurological center for reviewing curricular materials and pedagogical pathways across the digital ecosystem.
                        </p>
                    </div>

                    <div className="flex gap-8 items-center">
                        <div className="text-center">
                            <p className="text-4xl font-black text-white">{content.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Total Items</p>
                        </div>
                        <div className="w-px h-16 bg-white/10" />
                        <div className="text-center">
                            <p className="text-4xl font-black text-amber-500">{content.filter(i => i.status === 'Pending').length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1">Pending Review</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Command Bar (Filters) */}
            <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-gray-200 p-3 rounded-[2.5rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-4">
                <div className="flex bg-gray-100/50 p-1.5 rounded-[1.8rem] flex-1 overflow-x-auto">
                    {[
                        { id: 'lesson-plan', label: 'Lesson Plans', icon: FileText },
                        { id: 'video', label: 'Video Lessons', icon: Video },
                        { id: 'material', label: 'Materials', icon: BookOpen },
                        { id: 'assignment', label: 'Assignments', icon: ClipboardList }
                    ].map(type => (
                        <button 
                            key={type.id}
                            onClick={() => setContentType(type.id)}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${
                                contentType === type.id 
                                    ? 'bg-white text-gray-900 shadow-lg border border-gray-100' 
                                    : 'text-gray-400 hover:text-gray-700'
                            }`}
                        >
                            <type.icon size={16} />
                            {type.label}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap gap-3 items-center px-2">
                    <div className="h-10 w-px bg-gray-200 hidden md:block" />
                    <select 
                        className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-2 cursor-pointer"
                        value={filters.classId} onChange={e => setFilters({...filters, classId: e.target.value})}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    <select 
                        className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-2 cursor-pointer"
                        value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>

                    <select 
                        className="bg-transparent text-sm font-bold text-gray-700 focus:outline-none px-2 cursor-pointer"
                        value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending Review</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            {/* Content Matrix (List) */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-[2rem]" />
                        ))
                    ) : content.length > 0 ? (
                        content.map((item, idx) => (
                            <motion.div 
                                key={item._id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white rounded-[2.5rem] border border-gray-100 p-8 flex flex-col md:flex-row justify-between items-center gap-8 transition-all hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-8 flex-1 w-full">
                                    <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${
                                        item.status === 'Approved' ? 'bg-emerald-50 text-emerald-500' : 
                                        item.status === 'Rejected' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
                                    }`}>
                                        {contentType === 'lesson-plan' ? <FileText size={32} /> : 
                                         contentType === 'video' ? <Video size={32} /> : 
                                         contentType === 'assignment' ? <ClipboardList size={32} /> : <BookOpen size={32} />}
                                    </div>

                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(item.status)}`}>
                                                {item.status || 'Pending'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Layers size={10} /> {item.classLevelId?.name || item.classLevel}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles size={10} /> {item.subjectId?.name || item.subject}
                                            </span>
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary transition-colors">
                                            {item.topic || item.title}
                                        </h3>
                                        <div className="flex items-center bg-gray-50/50 w-fit px-4 py-1.5 rounded-full border border-gray-100">
                                            <User size={12} className="text-gray-400 mr-2" />
                                            <p className="text-xs font-black text-gray-600 truncate max-w-[200px]">
                                                {item.teacherId?.name || 'Academic Faculty'}
                                            </p>
                                            <div className="h-3 w-px bg-gray-200 mx-3" />
                                            <Calendar size={12} className="text-gray-400 mr-2" />
                                            <p className="text-[10px] font-bold text-gray-400">
                                                {new Date(item.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    <motion.button 
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedItem(item)}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                                    >
                                        <Eye size={16} /> Preview Content
                                    </motion.button>
                                    
                                    <div className="flex gap-2">
                                        {item.status !== 'Approved' && (
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleStatusUpdate(item._id, 'Approved')}
                                                className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all border-4 border-white"
                                            >
                                                <CheckCircle size={22} />
                                            </motion.button>
                                        )}
                                        {item.status !== 'Rejected' && (
                                            <motion.button 
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                                                className="w-14 h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 hover:bg-rose-600 transition-all border-4 border-white"
                                            >
                                                <XCircle size={22} />
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100"
                        >
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={48} className="text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">Clear Horizon</h3>
                            <p className="text-gray-400 mt-2 font-medium">No pedagogical artifacts detected within current spectral parameters.</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* PREVIEW MODAL - Redesigned Command Review Console */}
            <AnimatePresence>
                {selectedItem && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedItem(null)}
                            className="absolute inset-0 bg-slate-900/80 backdrop-blur-3xl pointer-events-auto"
                        />
                        
                        <motion.div 
                            initial={{ scale: 0.9, y: 50, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 50, opacity: 0 }}
                            className="relative bg-white w-full max-w-6xl max-h-[90vh] rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden pointer-events-auto border border-gray-100"
                        >
                            {/* Modal Header */}
                            <div className="p-8 md:p-10 border-b border-gray-100 flex justify-between items-start bg-gray-50/50 backdrop-blur-md sticky top-0 z-10">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/10">
                                            {getTypeLabel(selectedItem)}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={12} /> Synchronized {new Date(selectedItem.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-none">
                                        {selectedItem.topic || selectedItem.title}
                                    </h2>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <User size={14} />
                                            </div>
                                            <p className="text-xs font-black text-gray-700">{selectedItem.teacherId?.name || 'Academic Faculty'}</p>
                                        </div>
                                        <div className="h-4 w-px bg-gray-200" />
                                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                                            <Layers size={14} /> {selectedItem.classLevelId?.name || selectedItem.classLevel} hub
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedItem(null)} 
                                    className="w-14 h-14 bg-white shadow-xl rounded-full flex items-center justify-center hover:bg-gray-100 transition-all border border-gray-100 group"
                                >
                                    <X size={24} className="text-gray-500 group-hover:rotate-90 transition-transform duration-500" />
                                </button>
                            </div>

                            {/* Modal Content Body */}
                            <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-white">
                                <div className="max-w-4xl mx-auto space-y-12">
                                    
                                    {/* VIDEO SECTION */}
                                    {(contentType === 'video' || selectedItem.videoUrl) && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="space-y-6"
                                        >
                                            <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl relative border-8 border-gray-900 ring-1 ring-white/10">
                                                {selectedItem.videoUrl ? (
                                                    <iframe 
                                                        src={selectedItem.videoUrl} 
                                                        className="w-full h-full" 
                                                        frameBorder="0" 
                                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                        allowFullScreen
                                                        title="Pedagogical Video Asset"
                                                    ></iframe>
                                                ) : (
                                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600 gap-4">
                                                        <AlertCircle size={48} />
                                                        <p className="font-black uppercase tracking-widest text-[10px]">No Video Stream Detected</p>
                                                    </div>
                                                )}
                                                <div className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur-xl rounded-full border border-white/10 text-[9px] font-black uppercase tracking-widest text-white ring-1 ring-white/20">
                                                    <PlayCircle size={12} className="text-primary" /> Visual Intelligence Stream
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Info size={16} className="text-primary" /> Description & Intent
                                                </h4>
                                                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                                                    {selectedItem.description || 'No pedagogical intent specified for this asset.'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* LESSON PLAN CONTENT */}
                                    {contentType === 'lesson-plan' && selectedItem.content && (
                                        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                {/* Objectives */}
                                                <div className="bg-slate-50 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-700">
                                                        <Sparkles size={100} />
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        Curricular Objectives
                                                    </h4>
                                                    {selectedItem.content.objectives && Array.isArray(selectedItem.content.objectives) ? (
                                                        <ul className="space-y-4">
                                                            {selectedItem.content.objectives.map((obj, i) => (
                                                                <li key={i} className="flex items-start gap-4 text-slate-700 font-medium leading-relaxed">
                                                                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0 animate-pulse" />
                                                                    {obj}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    ) : <p className="text-gray-400 italic font-medium">No objectives detected.</p>}
                                                </div>

                                                {/* Resources */}
                                                <div className="bg-emerald-50 p-10 rounded-[2.5rem] border border-emerald-100 shadow-sm relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 p-8 opacity-5 -mr-4 -mt-4 transition-transform group-hover:scale-125 duration-700">
                                                        <BookOpen size={100} />
                                                    </div>
                                                    <h4 className="text-xl font-black text-emerald-900 mb-6 flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/30">
                                                            <BookOpen size={20} />
                                                        </div>
                                                        Teaching Vector
                                                    </h4>
                                                    <p className="text-emerald-800/80 font-medium leading-[1.8] text-lg bg-white/40 p-6 rounded-2xl border border-emerald-500/10">
                                                        {selectedItem.content.teachingMaterial || selectedItem.content.materials || 'No teaching resources defined.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Activities */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                                <div className="space-y-6">
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Faculty Engagement Plan</h4>
                                                    <div className="space-y-4">
                                                        {(selectedItem.content.teacherActivities || []).map((act, i) => (
                                                            <div key={i} className="p-6 bg-white border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                                                <div className="flex items-center gap-4 text-gray-700">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
                                                                    <p className="font-bold leading-relaxed">{act}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="space-y-6">
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest pl-1">Student Interaction Loop</h4>
                                                    <div className="space-y-4">
                                                        {(selectedItem.content.studentActivities || []).map((act, i) => (
                                                            <div key={i} className="p-6 bg-gray-50/50 border border-gray-100 rounded-3xl shadow-sm hover:shadow-md transition-all group">
                                                                <div className="flex items-center gap-4 text-gray-600">
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-emerald-500 transition-colors" />
                                                                    <p className="font-bold leading-relaxed">{act}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Evaluation */}
                                            <div className="bg-violet-900 p-12 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:rotate-[30deg] duration-1000">
                                                    <ClipboardList size={180} />
                                                </div>
                                                <h4 className="text-2xl font-black mb-10 flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                                                        <CheckCircle size={24} />
                                                    </div>
                                                    Pedagogical Verification
                                                </h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                                    {(selectedItem.content.evaluation || []).map((qs, i) => (
                                                        <div key={i} className="p-6 bg-white/5 backdrop-blur-lg border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all flex items-start gap-4 ring-1 ring-white/5 shadow-inner">
                                                            <div className="text-violet-300 font-black text-lg">Q{i+1}</div>
                                                            <p className="font-bold leading-relaxed text-violet-50/90">{qs}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Note Console */}
                                            {selectedItem.lessonNotes && (
                                                <div className="space-y-6 pt-10 border-t border-gray-100">
                                                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                                                        <div className="p-1.5 bg-gray-100 rounded-lg"><FileText size={16} /></div>
                                                        Full Generative Artifact
                                                    </h4>
                                                    <div className="prose max-w-none text-gray-600 bg-gray-50/50 p-12 rounded-[3rem] border border-gray-100 shadow-inner font-medium leading-[2] text-lg select-none">
                                                        <div className="opacity-60 filter blur-[0.5px]" dangerouslySetInnerHTML={{__html: selectedItem.lessonNotes}} />
                                                        <div className="mt-10 py-6 border-t border-dashed border-gray-200 flex justify-center">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Content rendering optimized for administrative review</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* MATERIAL / ASSIGNMENT */}
                                    {(contentType === 'material' || contentType === 'assignment') && (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center justify-center py-20 text-center space-y-10"
                                        >
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-primary/20 blur-[50px] animate-pulse rounded-full" />
                                                <div className="relative w-32 h-32 bg-white shadow-2xl rounded-[2.5rem] border border-gray-100 flex items-center justify-center text-primary">
                                                    {contentType === 'assignment' ? <ClipboardList size={56} /> : <BookOpen size={56} />}
                                                </div>
                                            </div>
                                            <div className="space-y-4 max-w-xl">
                                                <h3 className="text-4xl font-black text-gray-900 tracking-tight">{selectedItem.title}</h3>
                                                <p className="text-gray-500 text-xl font-medium leading-relaxed">
                                                    {selectedItem.description || 'No descriptive metadata provided for this intellectual artifact.'}
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-10">
                                                {selectedItem.fileUrl ? (
                                                    <motion.button 
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setPreviewFile({ 
                                                            ...selectedItem,
                                                            url: selectedItem.fileUrl, 
                                                            title: selectedItem.title 
                                                        })}
                                                        className="flex-1 max-w-md bg-gray-900 text-white px-10 py-6 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 hover:bg-black transition-all"
                                                    >
                                                        <Eye size={20} /> Preview File Asset
                                                    </motion.button>
                                                ) : (
                                                    <div className="p-6 bg-rose-50 text-rose-500 rounded-3xl border border-rose-100 font-bold flex items-center gap-3">
                                                        <AlertCircle size={20} /> Asset unreachable or missing from cloud storage
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Modal Footer Actions */}
                            <div className="p-10 border-t border-gray-100 bg-gray-50/80 backdrop-blur-xl flex justify-between items-center z-10 sticky bottom-0">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                                        selectedItem.status === 'Approved' ? 'bg-emerald-500' : 
                                        selectedItem.status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500'
                                    }`} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        Current Status: <span className={getStatusStyles(selectedItem.status).split(' ')[1]}>{selectedItem.status || 'Pending Verification'}</span>
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                     <button 
                                        onClick={() => setSelectedItem(null)}
                                        className="px-8 py-4 text-gray-500 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Close Portal
                                    </button>
                                    
                                    {selectedItem.status !== 'Rejected' && (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(selectedItem._id, 'Rejected', getTypeLabel(selectedItem))}
                                            disabled={updatingId === selectedItem._id}
                                            className="px-8 py-4 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-lg shadow-rose-500/5 disabled:opacity-50"
                                        >
                                            <XCircle size={18} /> Flag & Reject
                                        </motion.button>
                                    )}
                                    
                                    {selectedItem.status !== 'Approved' && (
                                        <motion.button 
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleStatusUpdate(selectedItem._id, 'Approved', getTypeLabel(selectedItem))}
                                            disabled={updatingId === selectedItem._id}
                                            className="px-10 py-4 bg-emerald-600 text-white hover:bg-emerald-700 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center gap-3 disabled:opacity-50"
                                        >
                                            {updatingId === selectedItem._id ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            ) : <CheckCircle size={18} />}
                                            Authorize Content
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            <UnifiedFilePreview 
                file={previewFile}
                isOpen={!!previewFile}
                onClose={() => setPreviewFile(null)}
            />
        </motion.div>
    );
};

export default ContentOversight;
