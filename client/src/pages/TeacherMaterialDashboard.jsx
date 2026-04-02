import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CloudUpload, 
    FileText, 
    History, 
    CheckCircle2, 
    XCircle, 
    Clock, 
    Plus, 
    X, 
    ChevronRight, 
    Search, 
    Filter, 
    ArrowUpRight,
    Terminal,
    Cpu,
    Fingerprint,
    Activity,
    Zap,
    Binary,
    Target,
    ShieldCheck,
    Download,
    Eye,
    MessageSquare,
    BookOpen,
    Layers,
    GraduationCap
} from 'lucide-react';
import api from '../utils/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';

const TeacherMaterialDashboard = () => {
    const { user } = useAuth();
    const [materials, setMaterials] = useState([]);
    const [filteredMaterials, setFilteredMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');

    // Form States
    const [formData, setFormData] = useState({
        title: '',
        type: 'Assignment',
        subject: '',
        classLevel: '',
        arm: '',
        term: 'First Term',
        session: '2023/2024',
        description: '',
        fileUrl: '',
        originalName: '',
        mimeType: '',
        size: 0,
        status: 'Draft'
    });

    const materialTypes = ['Assignment', 'Note', 'Worksheet', 'Test Prep'];
    const terms = ['First Term', 'Second Term', 'Third Term'];
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchMaterials();
    }, []);

    useEffect(() => {
        let result = materials;
        if (filterStatus !== 'All') result = result.filter(m => m.status === filterStatus);
        if (searchTerm) {
            result = result.filter(m => 
                m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                m.subject.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredMaterials(result);
    }, [materials, filterStatus, searchTerm]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const response = await api.get('/learning-materials/my-materials');
            setMaterials(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync materials:', error);
            toast.error('Material sync failed');
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        setUploading(true);
        try {
            const response = await api.post('/upload', uploadData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const { url, filename, size } = response.data;
            setFormData(prev => ({ 
                ...prev, 
                fileUrl: url,
                originalName: filename,
                mimeType: file.type,
                size: size
            }));
            toast.success('File uploaded successfully');
        } catch (error) {
            console.error('Upload protocol failure:', error);
            toast.error('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e, overrideStatus = null) => {
        if (e && e.preventDefault) e.preventDefault();
        
        const currentStatus = overrideStatus || formData.status;
        const payload = { ...formData, status: currentStatus };

        if (!payload.fileUrl) {
            toast.error('Artifact source required');
            return;
        }

        try {
            await api.post('/learning-materials', payload);
            toast.success(currentStatus === 'Draft' ? 'Saved to drafts' : 'Submitted for review');
            setShowForm(false);
            resetForm();
            fetchMaterials();
        } catch (error) {
            console.error('Submission protocol failure:', error);
            toast.error('Registry establishment failed');
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            type: 'Assignment',
            subject: '',
            classLevel: '',
            arm: '',
            term: 'First Term',
            session: '2023/2024',
            description: '',
            fileUrl: '',
            status: 'Draft'
        });
        setShowForm(false);
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Approved': return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 size={14} /> };
            case 'Rejected': 
            case 'HOD Rejected': return { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100', icon: <XCircle size={14} /> };
            case 'Pending Approval': 
            case 'Pending HOD':
            case 'HOD Approved': return { bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100', icon: <Clock size={14} /> };
            default: return { bg: 'bg-slate-50 text-slate-600', border: 'border-slate-100', icon: <Terminal size={14} /> };
        }
    };

    const stats = [
        { label: 'Total Materials', value: materials.length, color: 'indigo', icon: Binary },
        { label: 'Approved', value: materials.filter(m => m.status === 'Approved').length, color: 'emerald', icon: ShieldCheck },
        { label: 'In Review', value: materials.filter(m => m.status.includes('Pending') || m.status === 'HOD Approved').length, color: 'amber', icon: Activity },
        { label: 'Drafts', value: materials.filter(m => m.status === 'Draft').length, color: 'slate', icon: Terminal }
    ];

    if (loading && materials.length === 0) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Neural Material Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Cpu size={14} className="text-primary" /> Teacher Materials
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Learning <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Materials</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Upload assignments, notes, and study materials for your students.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => showForm ? resetForm() : setShowForm(true)}
                            className={`px-10 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 ${
                                showForm 
                                    ? 'bg-white text-rose-500 border border-rose-100 shadow-2xl' 
                                    : 'bg-primary text-white shadow-3xl shadow-primary/40 hover:bg-primary/90'
                            }`}
                        >
                            {showForm ? <X size={20} /> : <Plus size={20} />}
                            {showForm ? 'Cancel' : 'Upload Material'}
                        </motion.button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center">
                                <p className="text-2xl font-black text-white">{materials.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Items</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center">
                                <p className="text-2xl font-black text-emerald-400">{materials.filter(m => m.status === 'Approved').length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Validated</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="material-form"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -30 }}
                        className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-3xl mb-16 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
                        
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black text-slate-900 mb-12 flex items-center gap-5">
                                <div className="p-4 bg-slate-950 text-white rounded-2xl shadow-2xl">
                                    <Zap size={24} />
                                </div>
                                Artifact Upload
                            </h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Title</label>
                                            <input 
                                                name="title" 
                                                value={formData.title} 
                                                onChange={handleInputChange} 
                                                required 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none placeholder:text-slate-300" 
                                                placeholder="e.g., Quantum Mechanics Module 01" 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Type</label>
                                            <div className="relative">
                                                <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <select 
                                                    name="type" 
                                                    value={formData.type} 
                                                    onChange={handleInputChange} 
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                                >
                                                    {materialTypes.map(t => <option key={t} value={t}>{t}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Subject</label>
                                            <div className="relative">
                                                <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input name="subject" value={formData.subject} onChange={handleInputChange} required className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none" placeholder="Physics" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Class Level</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input name="classLevel" value={formData.classLevel} onChange={handleInputChange} required className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none" placeholder="SS3" />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Arm</label>
                                            <input name="arm" value={formData.arm} onChange={handleInputChange} className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none" placeholder="Diamond (Alpha)" />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Description</label>
                                        <textarea 
                                            name="description" 
                                            value={formData.description} 
                                            onChange={handleInputChange} 
                                            rows="4" 
                                            className="w-full px-10 py-8 bg-slate-50 border-none rounded-[3rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none resize-none placeholder:text-slate-300 leading-relaxed" 
                                            placeholder="Provide detail for this lesson material..." 
                                        />
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Term</label>
                                        <select 
                                            name="term" 
                                            value={formData.term} 
                                            onChange={handleInputChange} 
                                            className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none cursor-pointer"
                                        >
                                            {terms.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Upload File (PDF/DOC/DOCX/Images)</label>
                                        <div className={`relative group border-2 border-dashed rounded-[3rem] p-10 transition-all duration-500 overflow-hidden ${
                                            formData.fileUrl ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-primary/30'
                                        }`}>
                                            <input 
                                                type='file' 
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" 
                                                onChange={handleFileUpload} 
                                                disabled={uploading} 
                                            />
                                            <div className="flex flex-col items-center justify-center text-center gap-6 relative z-10">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Uploading...</span>
                                                    </div>
                                                ) : formData.fileUrl ? (
                                                    <>
                                                        <div className="w-20 h-20 bg-white text-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/10 transition-transform group-hover:scale-110">
                                                            <CheckCircle2 size={40} />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-slate-900 leading-none mb-2">File Uploaded</p>
                                                            <p className="text-xs text-slate-400 font-bold truncate max-w-[200px] px-4">File Name: {formData.fileUrl.split('/').pop()}</p>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, fileUrl: '' })); }}
                                                            className="px-6 py-2 bg-white border border-rose-100 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors z-30"
                                                        >
                                                            Remove File
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all duration-500">
                                                            <CloudUpload size={40} />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-slate-700 leading-none mb-2">Select File</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">PDF, DOC, DOCX, Images</p>
                                                        </div>
                                                        <p className="text-[9px] text-slate-300 italic">Drag and drop file here</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-3 pt-10 flex justify-end gap-6 border-t border-slate-50">
                                    <button 
                                        type="button" 
                                        onClick={(e) => handleSubmit(e, 'Draft')}
                                        className="px-10 py-5 border-2 border-slate-100 text-slate-500 rounded-3xl hover:bg-slate-50 font-black text-[10px] uppercase tracking-widest transition-all"
                                    >
                                        Save to Drafts
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={(e) => handleSubmit(e, 'Pending HOD')}
                                        className="px-10 py-5 bg-indigo-600 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-3"
                                    >
                                        Transmit to HOD <ChevronRight size={16} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="material-list"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {/* Precision Command Console */}
                        <div className="flex flex-col lg:flex-row gap-8 mb-12">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                                <input 
                                    type="text"
                                    placeholder="Search by title, subject..."
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
                                        <option value="All">All Items</option>
                                        <option value="Draft">Drafts</option>
                                        <option value="Pending HOD">HOD Review</option>
                                        <option value="Pending Approval">Admin Review</option>
                                        <option value="Approved">Validated</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Artifact Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredMaterials.length === 0 ? (
                                <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
                                    <History className="mx-auto text-slate-100 mb-8" size={80} />
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Materials</h3>
                                    <p className="text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto italic">No materials found in the current filter.</p>
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
                                                <div className={`p-5 rounded-3xl ${styles.bg} transition-all duration-700 group-hover:scale-110 shadow-lg`}>
                                                    <FileText size={32} />
                                                </div>
                                                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles.bg} ${styles.border}`}>
                                                    <span className="flex items-center gap-2">{styles.icon} {m.status}</span>
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
                                                <p className="text-slate-500 font-bold text-sm line-clamp-2 mb-8 leading-relaxed">
                                                    {m.description || "No description provided for this material."}
                                                </p>
                                            </div>

                                            <div className="relative z-10 space-y-6">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                    <div className="flex items-center gap-2">
                                                        <GraduationCap size={14} className="text-indigo-400" />
                                                        {m.classLevel} {m.arm && `(${m.arm})`}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Download size={14} className="text-emerald-400" />
                                                        {m.downloadCount} Downloads
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                                    <a 
                                                        href={m.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="px-6 py-3 bg-slate-50 hover:bg-slate-900 hover:text-white text-slate-600 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm flex items-center gap-3"
                                                    >
                                                        View File <Eye size={14} />
                                                    </a>
                                                    <div className="flex gap-2">
                                                        {(m.status === 'Rejected' || m.status === 'HOD Rejected') && (
                                                            <div className="group/feedback relative">
                                                                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl cursor-help shadow-sm hover:bg-rose-500 hover:text-white transition-all">
                                                                    <MessageSquare size={18} />
                                                                </div>
                                                                <div className="absolute bottom-full right-0 mb-4 w-64 p-4 bg-slate-900 text-white rounded-2xl text-[10px] font-bold opacity-0 invisible group-hover/feedback:opacity-100 group-hover/feedback:visible transition-all shadow-3xl z-50">
                                                                    <p className="text-rose-400 uppercase tracking-widest mb-2 font-black">Feedback:</p>
                                                                    "{m.adminFeedback || m.hodFeedback}"
                                                                </div>
                                                            </div>
                                                        )}
                                                        <div className="p-3 bg-slate-50 rounded-2xl text-slate-200 group-hover:bg-primary group-hover:text-white group-hover:shadow-xl transition-all duration-500">
                                                            <ChevronRight size={20} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default TeacherMaterialDashboard;
