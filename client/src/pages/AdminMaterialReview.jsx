import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Search, 
    Filter, 
    Eye, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    ChevronRight, 
    MessageSquare, 
    Download, 
    FileText,
    Terminal,
    Cpu,
    Target,
    Activity,
    Layers,
    ArrowUpRight,
    Binary,
    X,
    Fingerprint,
    Zap,
    GraduationCap,
    BookOpen
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import UnifiedFilePreview from '../components/UnifiedFilePreview';
import Loader from '../components/Loader';

const AdminMaterialReview = () => {
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('HOD Approved');
    const [searchTerm, setSearchTerm] = useState('');

    // Review Modal State
    const [selectedMaterial, setSelectedMaterial] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [previewFile, setPreviewFile] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        let result = materials;
        if (filterStatus !== 'All') result = result.filter(m => m.status === filterStatus);
        if (searchTerm) {
            result = result.filter(m => 
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.teacherId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredMaterials(result);
    }, [materials, filterStatus, searchTerm]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/learning-materials'); 
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Oversight sync failure:', error);
            toast.error('Material oversight sync failed');
            setLoading(false);
        }
    };

    const handleAction = async (status) => {
        if (!selectedMaterial) return;
        setUpdating(true);
        try {
            await api.put(`/learning-materials/${selectedMaterial._id}/status`, { 
                status, 
                adminFeedback: feedback 
            });
            toast.success(`Artifact status updated: ${status}`);
            setSelectedMaterial(null);
            setFeedback('');
            fetchMaterials();
        } catch (error) {
            console.error('Audit update failure:', error);
            toast.error('Status establishment failed');
        } finally {
            setUpdating(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 size={14} /> };
            case 'Rejected': 
            case 'HOD Rejected': return { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100', icon: <XCircle size={14} /> };
            case 'Pending HOD':
            case 'HOD Approved': return { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', icon: <Clock size={14} /> };
            default: return { bg: 'bg-slate-50 text-slate-600', border: 'border-slate-100', icon: <Terminal size={14} /> };
        }
    };

    if (loading && materials.length === 0) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Oversight Command Terminal Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <ShieldCheck size={14} className="text-primary" /> Oversight Protocol
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Material <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Oversight Command</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Audit pedagogical artifacts, validate learning modules, and execute executive status directives across the academic registry.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center">
                            <p className="text-3xl font-black text-white">{materials.filter(m => m.status === 'HOD Approved').length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Awaiting Audit</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-3xl border border-white/10 text-center">
                            <p className="text-3xl font-black text-emerald-400">{materials.filter(m => m.status === 'Approved').length}</p>
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Validated</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Filter Console */}
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="relative flex-1 group">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Scan registry by architect, subject, or artifact title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-22 pr-10 py-6 bg-white border border-slate-50 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-3 pl-8 pr-4 py-4 bg-white rounded-[2rem] border border-slate-50 shadow-2xl shadow-slate-200/40">
                        <Activity size={18} className="text-slate-300" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="All">All Cycles</option>
                            <option value="HOD Approved">Awaiting Admin</option>
                            <option value="Pending HOD">In HOD Review</option>
                            <option value="Approved">Validated</option>
                            <option value="Rejected">Rejected</option>
                            <option value="HOD Rejected">HOD Rejected</option>
                            <option value="Draft">Drafts</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Audit Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredMaterials.length === 0 ? (
                    <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
                        <Terminal className="mx-auto text-slate-100 mb-8" size={80} />
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Registry Synchronized</h3>
                        <p className="text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto italic">No artifacts detected in the current filter matrix needing executive intervention.</p>
                    </div>
                ) : (
                    filteredMaterials.map((m, idx) => {
                        const styles = getStatusStyles(m.status);
                        return (
                            <motion.div
                                key={m._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group relative bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-700 flex flex-col h-full overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                                
                                <div className="flex justify-between items-start mb-8 relative z-10">
                                    <div className="p-5 bg-slate-50 text-slate-400 rounded-3xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-700 shadow-lg">
                                        <FileText size={32} />
                                    </div>
                                    <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles.bg} ${styles.border}`}>
                                        <span className="flex items-center gap-2">{styles.icon} {m.status === 'HOD Approved' ? 'HOD VALIDATED' : m.status}</span>
                                    </div>
                                </div>

                                <div className="relative z-10 flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100">
                                            {m.type}
                                        </span>
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                            {m.subject}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2">
                                        {m.title}
                                    </h3>
                                    <div className="flex items-center gap-3 mb-8">
                                        <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 font-black text-[10px]">
                                            {m.teacherId?.name?.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Architect</p>
                                            <p className="text-xs font-black text-slate-700">{m.teacherId?.name || 'Unknown Architect'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Level</p>
                                        <p className="text-xs font-black text-slate-900">{m.classLevel}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedMaterial(m)}
                                        className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-slate-900/40 hover:bg-black transition-all flex items-center gap-3 active:scale-95"
                                    >
                                        Enter Audit <Fingerprint size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>

            {/* Audit Console Modal */}
            <AnimatePresence>
                {selectedMaterial && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100]"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[4rem] shadow-4xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative"
                        >
                            <button 
                                onClick={() => setSelectedMaterial(null)}
                                className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
                            >
                                <X size={24} />
                            </button>

                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                {/* Preview Protocol Area */}
                                <div className="flex-1 bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-20 text-center">
                                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_100%)]" />
                                    
                                    <div className="relative z-10 space-y-10">
                                        <div className="w-32 h-32 bg-white text-indigo-400 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl group transition-transform hover:scale-110">
                                            <FileText size={64} />
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-slate-900 mb-4">{selectedMaterial.title}</h3>
                                            <p className="text-slate-400 font-bold max-w-md mx-auto leading-relaxed">
                                                {selectedMaterial.description || "The artifact source file is ready for executive preview and validation."}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap justify-center gap-4">
                                            <button 
                                                onClick={() => setPreviewFile({ 
                                                    ...selectedMaterial,
                                                    url: selectedMaterial.fileUrl, 
                                                    title: selectedMaterial.title
                                                })}
                                                className="px-10 py-5 bg-primary text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center gap-3 active:scale-95"
                                            >
                                                Initiate Source Preview <Eye size={18} />
                                            </button>
                                            <a 
                                                href={selectedMaterial.fileUrl}
                                                download
                                                className="px-10 py-5 bg-white border border-slate-200 text-slate-600 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-3"
                                            >
                                                Extract Source <Download size={18} />
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Audit Control Console */}
                                <div className="w-full lg:w-[450px] bg-white border-l border-slate-50 p-12 overflow-y-auto flex flex-col">
                                    <div className="flex-1 space-y-12">
                                        <div>
                                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[9px] font-black uppercase tracking-[0.2em] mb-6">
                                                <Zap size={14} /> Audit Metadata
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-slate-50 p-5 rounded-3xl">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Architect</p>
                                                    <p className="text-xs font-black text-slate-900 truncate">{selectedMaterial.teacherId?.name}</p>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-3xl">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Subject</p>
                                                    <p className="text-xs font-black text-indigo-600">{selectedMaterial.subject}</p>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-3xl">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Level</p>
                                                    <p className="text-xs font-black text-slate-900">{selectedMaterial.classLevel}</p>
                                                </div>
                                                <div className="bg-slate-50 p-5 rounded-3xl text-indigo-600">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Status</p>
                                                    <p className="text-xs font-black uppercase tracking-tighter">{selectedMaterial.status}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {selectedMaterial.hodFeedback && (
                                            <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 relative overflow-hidden">
                                                <MessageSquare className="absolute -right-4 -bottom-4 text-indigo-100/50" size={80} />
                                                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-3 relative z-10">HOD Insight Protocol</p>
                                                <p className="text-sm font-bold text-indigo-800 italic leading-relaxed relative z-10">
                                                    "{selectedMaterial.hodFeedback}"
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Audit Directives (Feedback)</label>
                                            <textarea 
                                                value={feedback} 
                                                onChange={(e) => setFeedback(e.target.value)}
                                                className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none resize-none placeholder:text-slate-300 leading-relaxed min-h-[150px]" 
                                                placeholder="Provide rationalization for status directive..."
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mt-12 pt-12 border-t border-slate-50">
                                        <button 
                                            onClick={() => handleAction('Rejected')}
                                            disabled={updating}
                                            className="py-5 bg-white border-2 border-rose-100 text-rose-500 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <XCircle size={18} /> Execute Rejection
                                        </button>
                                        <button 
                                            onClick={() => handleAction('Approved')}
                                            disabled={updating}
                                            className="py-5 bg-emerald-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <ShieldCheck size={18} /> Validate Artifact
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Source Preview Modal */}
            <UnifiedFilePreview 
                file={previewFile} 
                isOpen={!!previewFile} 
                onClose={() => setPreviewFile(null)} 
            />
        </motion.div>
    );
};

export default AdminMaterialReview;
