import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Filter, 
    BookOpen, 
    FileText, 
    Download, 
    Eye, 
    GraduationCap, 
    Clock, 
    ChevronRight,
    Library,
    Compass,
    Sparkles,
    Target,
    ShieldCheck,
    Cpu,
    Binary,
    ArrowUpRight,
    Layers
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import Loader from '../components/Loader';
import UnifiedFilePreview from '../components/UnifiedFilePreview';

const StudentMaterialList = () => {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        let result = materials;
        if (filterSubject !== 'All') result = result.filter(m => m.subject === filterSubject);
        if (searchTerm) {
            result = result.filter(m => 
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.description?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredMaterials(result);
    }, [materials, filterSubject, searchTerm]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/learning-materials?status=Approved');
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Library sync failure:', error);
            toast.error('Material library sync failed');
            setLoading(false);
        }
    };

    const handleView = async (materialId, url, filename) => {
        try {
            await api.post(`/learning-materials/${materialId}/download`); // Track usage
            setPreviewFile({ url, filename });
        } catch (error) {
            console.error('Trace error:', error);
            setPreviewFile({ url, filename });
        }
    };

    const subjects = ['All', ...new Set(materials.map(m => m.subject))];

    if (loading && materials.length === 0) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Library Intelligence Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[100px] -mr-60 -mt-60 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary/10 rounded-full blur-[80px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col items-center text-center space-y-8">
                    <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                        <Compass size={14} className="text-primary" /> Cognitive Expedition
                    </div>
                    <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl">
                        Study <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Intelligence Library</span>
                    </h1>
                    <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                        Access validated pedagogical artifacts, class intelligence, and research modules established by your mentors.
                    </p>

                    {/* Precision Filter Console */}
                    <div className="w-full max-w-3xl flex flex-col md:flex-row gap-4 p-3 bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-2xl mt-10">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary transition-colors" size={18} />
                            <input 
                                type="text"
                                placeholder="Scan library by title or domain..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-16 pr-6 py-4 bg-transparent border-none focus:ring-0 font-bold text-white outline-none placeholder:text-slate-500"
                            />
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden md:block self-center" />
                        <div className="relative min-w-[200px]">
                            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <select 
                                value={filterSubject}
                                onChange={(e) => setFilterSubject(e.target.value)}
                                className="w-full pl-16 pr-10 py-4 bg-transparent border-none focus:ring-0 font-bold text-white outline-none appearance-none cursor-pointer [&>option]:text-slate-900"
                            >
                                {subjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Domains' : s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Artifact Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
                        <Library className="mx-auto text-slate-100 mb-8" size={80} />
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Library Offline</h3>
                        <p className="text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto italic">No cognitive artifacts matching your current search parameters were found.</p>
                    </div>
                ) : (
                    filteredMaterials.map((m, idx) => (
                        <motion.div
                            key={m._id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 hover:shadow-indigo-500/10 hover:-translate-y-2 transition-all duration-700 flex flex-col h-full overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50 rounded-full transition-colors" />
                            
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div className="p-5 bg-indigo-50 text-indigo-600 rounded-3xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-lg">
                                    <FileText size={32} />
                                </div>
                                <div className="px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 border border-slate-100">
                                    {m.type}
                                </div>
                            </div>

                            <div className="relative z-10 flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                                        {m.subject}
                                    </span>
                                    <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                        {m.term}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-indigo-600 transition-colors duration-500 line-clamp-2">
                                    {m.title}
                                </h3>
                                <p className="text-slate-500 font-bold text-sm line-clamp-2 mb-8 leading-relaxed">
                                    {m.description || "Artifact essence documentation pending."}
                                </p>
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-black text-xs">
                                            {m.teacherId?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Architect</p>
                                            <p className="text-xs font-black text-slate-700">{m.teacherId?.name || 'Unknown'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Class</p>
                                        <p className="text-xs font-black text-indigo-600">{m.classLevel}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center gap-4">
                                    <button 
                                        onClick={() => handleView(m._id, m.fileUrl, m.title)}
                                        className="flex-1 py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:bg-black transition-all flex items-center justify-center gap-3 active:scale-95"
                                    >
                                        Initiate Preview <Eye size={16} />
                                    </button>
                                    <a 
                                        href={m.fileUrl}
                                        download
                                        className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                    >
                                        <Download size={20} />
                                    </a>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <UnifiedFilePreview 
                file={previewFile} 
                isOpen={!!previewFile} 
                onClose={() => setPreviewFile(null)} 
            />
        </motion.div>
    );
};

export default StudentMaterialList;
