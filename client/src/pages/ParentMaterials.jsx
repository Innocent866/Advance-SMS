import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    BookOpen, 
    FileText, 
    FileArchive, 
    Download, 
    Filter, 
    Zap, 
    Layers, 
    ShieldCheck, 
    ChevronRight, 
    RefreshCw, 
    Activity,
    Library,
    GraduationCap,
    Clock,
    User,
    ArrowUpRight,
    SearchX
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';
import UnifiedFilePreview from '../components/UnifiedFilePreview';

const ParentMaterials = () => {
    usePageTitle('Resource Intelligence Library');
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    const fetchMaterials = async () => {
        try {
            const response = await api.get('/parents/child-materials');
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching materials:', error);
            setLoading(false);
        }
    };

    const handleView = async (url, filename) => {
        setPreviewFile({ url, filename });
    };

    const subjects = ['All', ...new Set(materials.map(m => m.subject))];
    
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = m.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              (m.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = filterSubject === 'All' || m.subject === filterSubject;
        return matchesSearch && matchesSubject;
    });

    const stats = {
        total: materials.length,
        subjectsCount: subjects.length - 1,
        latestDate: materials.length > 0 ? new Date(Math.max(...materials.map(m => new Date(m.createdAt)))).toLocaleDateString() : 'N/A'
    };

    if (loading) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4">
            {/* Neural Library Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col xl:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 flex-1 text-center xl:text-left">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Library size={14} className="text-secondary" /> Institutional Resource Core
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Knowledge <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-indigo-400 to-blue-400">Intelligence Matrix</span>
                        </h1>
                        
                        <div className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto xl:mx-0 bg-white/5 p-2 rounded-[2.5rem] backdrop-blur-3xl border border-white/10 shadow-2xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-indigo-400/60" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Execute search protocol..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-transparent border-none rounded-3xl pl-14 pr-6 py-4 text-white placeholder-indigo-300/40 focus:ring-2 focus:ring-white/20 text-sm font-bold transition-all"
                                />
                            </div>
                            <div className="relative">
                                <select 
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="w-full sm:w-auto bg-white/5 border border-white/10 rounded-[1.5rem] px-8 py-4 text-white text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-white/20 outline-none cursor-pointer appearance-none pr-12 transition-all hover:bg-white/10"
                                >
                                    {subjects.map(s => <option key={s} value={s} className="bg-slate-900">{s === 'All' ? 'Full Spectrum' : s}</option>)}
                                </select>
                                <Filter size={14} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full xl:w-auto">
                        <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 text-center xl:text-left group hover:bg-white/10 transition-all">
                            <Layers className="text-secondary mb-4 mx-auto xl:mx-0 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-secondary/60 mb-1">Total Artifacts</p>
                            <h3 className="text-2xl font-black tabular-nums">{stats.total}</h3>
                        </div>
                        <div className="p-8 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 text-center xl:text-left group hover:bg-white/10 transition-all">
                            <GraduationCap className="text-blue-400 mb-4 mx-auto xl:mx-0 group-hover:scale-110 transition-transform" size={24} />
                            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/60 mb-1">Subject Nodes</p>
                            <h3 className="text-2xl font-black tabular-nums">{stats.subjectsCount}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artifact Matrix */}
            <div className="min-h-[400px]">
                <AnimatePresence mode="popLayout">
                    {filteredMaterials.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100 shadow-sm"
                        >
                            <div className="relative inline-block mb-8">
                                <SearchX size={80} className="text-slate-100" />
                                <Activity size={32} className="text-indigo-200 absolute -top-4 -right-4 animate-pulse" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Null Artifact Discovery</h3>
                            <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">No resources matched the current filtration criteria</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredMaterials.map((m, idx) => (
                                <motion.div 
                                    key={m._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden group hover:shadow-2xl hover:y-[-8px] transition-all duration-500"
                                >
                                    <div className="p-8 pb-4">
                                        <div className="flex justify-between items-start mb-8">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:rotate-6 ${
                                                m.type === 'Assignment' ? 'bg-amber-50 text-amber-600 shadow-amber-100' : 
                                                m.type === 'Note' ? 'bg-blue-50 text-blue-600 shadow-blue-100' :
                                                'bg-indigo-50 text-indigo-600 shadow-indigo-100'
                                            }`}>
                                                {m.type === 'Assignment' ? <FileArchive size={24} /> : 
                                                 m.type === 'Note' ? <FileText size={24} /> : 
                                                 <BookOpen size={24} />}
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <span className="px-4 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-slate-100">
                                                    {m.type}
                                                </span>
                                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                                                    <ShieldCheck size={10} /> Verified
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight line-clamp-2 leading-tight group-hover:text-indigo-600 transition-colors">
                                            {m.title}
                                        </h3>
                                        <p className="text-sm text-slate-500 mb-8 line-clamp-3 font-medium leading-relaxed">
                                            {m.description || 'No descriptive metadata provided for this academic artifact.'}
                                        </p>
                                    </div>

                                    <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                                                    <User size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Curator</p>
                                                    <p className="text-xs font-bold text-slate-700">{m.teacherId?.name || 'Academic System'}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Timeline</p>
                                                <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 justify-end">
                                                    <Clock size={12} className="text-indigo-400" /> {m.term}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 pb-2">
                                            <span className="px-3 py-1 bg-white rounded-lg border border-slate-100 text-[9px] font-black uppercase tracking-tighter text-slate-600 shadow-sm">
                                                {m.subject}
                                            </span>
                                            <div className="h-px flex-1 bg-slate-100" />
                                        </div>

                                        <button 
                                            onClick={() => handleView(m.fileUrl, m.title)}
                                            className="w-full py-5 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl transition-all hover:bg-indigo-600 hover:shadow-indigo-200 active:scale-95"
                                        >
                                            Infiltrate Protocol <ArrowUpRight size={16} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <UnifiedFilePreview 
                file={previewFile} 
                isOpen={!!previewFile} 
                onClose={() => setPreviewFile(null)} 
            />
        </div>
    );
};

export default ParentMaterials;
