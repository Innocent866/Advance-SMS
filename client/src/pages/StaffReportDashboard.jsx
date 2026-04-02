import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    FileText, 
    Upload, 
    CheckCircle2, 
    Clock, 
    AlertCircle, 
    Search, 
    X, 
    User, 
    Calendar, 
    ChevronRight, 
    MessageSquare, 
    Send,
    Download,
    Eye,
    ShieldCheck,
    ArrowRight,
    Filter,
    Terminal,
    Cpu,
    Zap,
    History,
    Activity,
    Target,
    Fingerprint,
    Binary
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import FilePreview from '../components/FilePreview';
import UnifiedFilePreview from '../components/UnifiedFilePreview';
import Loader from '../components/Loader';

const StaffReportDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [previewFile, setPreviewFile] = useState(null);

    const [formData, setFormData] = useState({
        senderRole: 'Teacher',
        reportType: 'Academic',
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        attachment: '',
        url: '',
        attachmentFileName: '',
        originalName: '',
        attachmentFileType: '',
        public_id: '',
        mimeType: '',
        resourceType: '',
        size: 0
    });

    const reportTypes = ['Academic', 'Discipline', 'Health', 'Attendance', 'Incident', 'General'];
    const senderRoles = ['Teacher', 'Class Teacher', 'HOD', 'Principal', 'Vice Principal', 'Counselor', 'Other'];

    useEffect(() => {
        fetchMyReports();
    }, []);

    const fetchMyReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff-reports/my-reports');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync reports:', error);
            toast.error('Report sync failed');
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
                attachment: url,
                url: url,
                attachmentFileName: filename,
                originalName: filename,
                attachmentFileType: file.type,
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

    const handleReply = async () => {
        if (!selectedReport || !replyComment.trim()) return;
        try {
            const response = await api.post(`/staff-reports/${selectedReport._id}/reply`, { comment: replyComment });
            toast.success('Reply sent');
            setReplyComment('');
            fetchMyReports(); 
            setSelectedReport(response.data.report);
        } catch (error) {
            console.error('Transmission failure:', error);
            toast.error('Failed to send reply');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                 await api.put(`/staff-reports/${editId}`, formData);
                  toast.success('Report updated successfully');
            } else {
                 await api.post('/staff-reports', formData);
                  toast.success('Report submitted successfully');
            }
            resetForm();
            fetchMyReports();
        } catch (error) {
            console.error('Establishment failure:', error);
            toast.error('Failed to submit report');
        }
    };

    const resetForm = () => {
        setFormData({
            senderRole: 'Teacher',
            reportType: 'Academic',
            date: new Date().toISOString().split('T')[0],
            title: '',
            description: '',
            attachment: '',
            url: '',
            attachmentFileName: '',
            originalName: '',
            attachmentFileType: '',
            public_id: '',
            mimeType: '',
            resourceType: '',
            size: 0
        });
        setEditId(null);
        setShowForm(false);
    };

    const handleEditClick = (report) => {
        setFormData({
            senderRole: report.senderRole,
            reportType: report.reportType,
            date: new Date(report.date).toISOString().split('T')[0],
            title: report.title,
            description: report.description,
            attachment: report.attachment || '',
            url: report.url || report.attachment || '',
            attachmentFileName: report.attachmentFileName || '',
            originalName: report.originalName || report.attachmentFileName || '',
            attachmentFileType: report.attachmentFileType || '',
            public_id: report.public_id || '',
            mimeType: report.mimeType || '',
            resourceType: report.resourceType || '',
            size: report.size || 0
        });
        setEditId(report._id);
        setSelectedReport(null); 
        setShowForm(true);
    };

    const filteredReports = reports.filter(r => 
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.reportType.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Pending HOD': return { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', icon: <Clock size={14} />, text: 'text-indigo-600' };
            case 'HOD Approved': return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: <ShieldCheck size={14} />, text: 'text-emerald-600' };
            case 'HOD Rejected': return { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100', icon: <X size={14} />, text: 'text-rose-600' };
            case 'Submitted': return { bg: 'bg-amber-50 text-amber-600', border: 'border-amber-100', icon: <Clock size={14} />, text: 'text-amber-600' };
            case 'Reviewed': return { bg: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', icon: <Search size={14} />, text: 'text-indigo-600' };
            case 'Action Required': return { bg: 'bg-rose-50 text-rose-600', border: 'border-rose-100', icon: <AlertCircle size={14} />, text: 'text-rose-600' };
            case 'Resolved': return { bg: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: <CheckCircle2 size={14} />, text: 'text-emerald-600' };
            default: return { bg: 'bg-slate-50 text-slate-600', border: 'border-slate-100', icon: <Terminal size={14} />, text: 'text-slate-600' };
        }
    };

    if (loading && reports.length === 0) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Neural Reports Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Cpu size={14} className="text-primary" /> Reports
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            My <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Reports</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Create academic records, document incidents, and track report status.
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
                            {showForm ? 'Cancel' : 'Create Report'}
                        </motion.button>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center">
                                <p className="text-2xl font-black text-white">{reports.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Records</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center">
                                <p className="text-2xl font-black text-emerald-400">{reports.filter(r => r.status === 'Resolved').length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Resolved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {showForm ? (
                    <motion.div
                        key="report-form"
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
                                {editId ? 'Edit Report' : 'Submit New Report'}
                            </h2>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">My Role</label>
                                            <div className="relative">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <select 
                                                    name="senderRole" 
                                                    value={formData.senderRole}
                                                    onChange={(e) => setFormData({...formData, senderRole: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                                >
                                                    {senderRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Report Type</label>
                                            <div className="relative">
                                                <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <select 
                                                    name="reportType" 
                                                    value={formData.reportType}
                                                    onChange={(e) => setFormData({...formData, reportType: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer"
                                                >
                                                    {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Date</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input 
                                                    type="date"
                                                    name="date"
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                                                    className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Report Title</label>
                                            <input 
                                                type="text"
                                                placeholder="Provide a short title..."
                                                value={formData.title}
                                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Description</label>
                                        <textarea 
                                            placeholder="Detail the circumstances, actions taken, and any recommendations..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                            rows="8"
                                            className="w-full px-10 py-8 bg-slate-50 border-none rounded-[3rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none resize-none placeholder:text-slate-300 leading-relaxed"
                                            required
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Attach File</label>
                                        <div className={`relative group border-2 border-dashed rounded-[3rem] p-10 transition-all duration-500 overflow-hidden ${
                                            formData.attachment ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100 bg-slate-50 hover:border-primary/30'
                                        }`}>
                                            <input 
                                                type="file" 
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-20" 
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                disabled={uploading}
                                            />
                                            <div className="flex flex-col items-center justify-center text-center gap-6 relative z-10">
                                                {uploading ? (
                                                    <div className="flex flex-col items-center gap-4">
                                                        <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Uploading...</span>
                                                    </div>
                                                ) : formData.attachment ? (
                                                    <>
                                                        <div className="w-20 h-20 bg-white text-emerald-500 rounded-3xl flex items-center justify-center shadow-xl shadow-emerald-500/10 transition-transform group-hover:scale-110">
                                                            <CheckCircle2 size={40} />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-slate-900 leading-none mb-2">File Attached</p>
                                                            <p className="text-xs text-slate-400 font-bold truncate max-w-[200px] px-4">
                                                                {formData.attachmentFileName || 'attachment.bin'}
                                                            </p>
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={(e) => { e.stopPropagation(); setFormData({...formData, attachment: '', attachmentFileName: ''}); }}
                                                            className="px-6 py-2 bg-white border border-rose-100 text-rose-500 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-rose-50 transition-colors z-30"
                                                        >
                                                            Remove File
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="w-20 h-20 bg-white rounded-3xl shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300 group-hover:text-primary transition-all duration-500">
                                                            <Upload size={40} />
                                                        </div>
                                                        <div>
                                                            <p className="text-lg font-black text-slate-700 leading-none mb-2">Select File</p>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">PDF, Word, Images</p>
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
                                        type="submit"
                                        className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-3xl shadow-slate-900/40 hover:bg-black transition-all flex items-center gap-4 active:scale-95"
                                    >
                                        {editId ? 'Save Changes' : 'Submit Report'}
                                        <Send size={20} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="report-list"
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
                                    placeholder="Search reports by title or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-22 pr-10 py-6 bg-white border border-slate-50 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                                />
                            </div>
                            <div className="bg-white px-10 py-6 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 flex items-center gap-6 border border-slate-50">
                                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 leading-none">Total Reports</p>
                                    <p className="text-2xl font-black text-slate-900 leading-none">{reports.length} Items</p>
                                </div>
                            </div>
                        </div>

                        {/* Artifact Matrix */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredReports.length === 0 ? (
                                <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40">
                                    <History className="mx-auto text-slate-100 mb-8" size={80} />
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Reports</h3>
                                    <p className="text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto italic">No reports found in your history.</p>
                                </div>
                            ) : (
                                filteredReports.map((report, idx) => {
                                    const styles = getStatusStyles(report.status);
                                    return (
                                        <motion.div
                                            key={report._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setSelectedReport(report)}
                                            className="group relative bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-2xl shadow-slate-200/40 hover:shadow-primary/10 hover:-translate-y-2 transition-all duration-700 flex flex-col h-full overflow-hidden cursor-pointer"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                                            
                                            <div className="flex justify-between items-start mb-8 relative z-10">
                                                <div className={`p-5 rounded-3xl ${styles.bg} transition-all duration-700 group-hover:scale-110 shadow-lg`}>
                                                    <FileText size={32} />
                                                </div>
                                                <div className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles.bg} ${styles.border}`}>
                                                    <span className="flex items-center gap-2">{styles.icon} {report.status}</span>
                                                </div>
                                            </div>

                                            <div className="relative z-10 flex-1">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-slate-100">
                                                        {report.reportType}
                                                    </span>
                                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                                                        {report.senderRole}
                                                    </span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight group-hover:text-primary transition-colors duration-500 line-clamp-2">
                                                    {report.title}
                                                </h3>
                                                <p className="text-slate-500 font-bold text-sm line-clamp-2 mb-8 leading-relaxed">
                                                    {report.description}
                                                </p>
                                            </div>

                                            <div className="relative z-10 pt-8 border-t border-slate-50 flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                        <Calendar size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 text-left">Logged On</p>
                                                        <p className="text-xs font-black text-slate-900">{new Date(report.date).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="p-3 bg-slate-50 rounded-2xl text-slate-200 group-hover:bg-primary group-hover:text-white group-hover:shadow-xl transition-all duration-500">
                                                    <ArrowRight size={20} />
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

            {/* Audit Console Detail Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4 z-[100]"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[4rem] shadow-4xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col relative"
                        >
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
                            >
                                <X size={24} />
                            </button>

                            {/* Modal Content */}
                            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                                {/* Left: Artifact Logic */}
                                <div className="flex-1 overflow-y-auto p-12 lg:p-16 space-y-12 bg-slate-50/30">
                                    <div className="flex flex-col gap-6">
                                        <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl ${getStatusStyles(selectedReport.status).bg} ${getStatusStyles(selectedReport.status).text}`}>
                                            <FileText size={36} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">{selectedReport.title}</h2>
                                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusStyles(selectedReport.status).bg} ${getStatusStyles(selectedReport.status).text} ${getStatusStyles(selectedReport.status).border} flex items-center gap-2`}>
                                                    {getStatusStyles(selectedReport.status).icon} {selectedReport.status}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 text-slate-400 font-bold text-sm">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-indigo-400" />
                                                    {selectedReport.senderRole}
                                                </div>
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                <div className="flex items-center gap-2">
                                                    <Calendar size={16} className="text-primary" />
                                                    {new Date(selectedReport.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="flex items-center gap-3">
                                            <Target size={18} className="text-primary" />
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Report Details</h3>
                                        </div>
                                        <div className="p-10 bg-white rounded-[3rem] border border-slate-100 text-slate-700 font-medium leading-relaxed shadow-sm text-lg italic">
                                            "{selectedReport.description}"
                                        </div>
                                    </div>

                                    {selectedReport.attachment && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-3 text-emerald-500">
                                                <Download size={18} />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Attachment</h3>
                                            </div>
                                            <div className="rounded-[3.5rem] overflow-hidden border border-slate-100 shadow-2xl bg-white p-10 text-center">
                                                <button 
                                                    onClick={() => setPreviewFile({ 
                                                        url: selectedReport.attachment, 
                                                        title: selectedReport.title,
                                                        mimeType: selectedReport.mimeType || selectedReport.attachmentFileType
                                                    })}
                                                    className="px-8 py-4 bg-primary text-white rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl hover:bg-primary/90 transition-all flex items-center justify-center gap-3 mx-auto"
                                                >
                                                    View Attachment <Eye size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right: Communication Protocol */}
                                <div className="w-full lg:w-[450px] bg-white border-l border-slate-50 p-12 flex flex-col">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={18} className="text-primary" />
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Comments</h3>
                                        </div>
                                        <button 
                                            onClick={() => handleEditClick(selectedReport)}
                                            className="px-4 py-1.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all"
                                        >
                                            Edit Report
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-6 mb-10 pr-2 custom-scrollbar">
                                        {selectedReport.adminComments?.length > 0 ? (
                                            selectedReport.adminComments.map((comment, idx) => {
                                                const commentAdminId = comment.adminId?._id || comment.adminId;
                                                const isMyReply = user && (commentAdminId === user._id || commentAdminId === user.id);
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: isMyReply ? 20 : -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={idx} 
                                                        className={`flex flex-col ${isMyReply ? 'items-end' : 'items-start'}`}
                                                    >
                                                        <div className={`p-6 rounded-[2rem] text-sm font-bold shadow-sm max-w-[90%] ${
                                                            isMyReply 
                                                                ? 'bg-primary text-white rounded-br-none' 
                                                                : 'bg-slate-50 border border-slate-100 text-slate-700 rounded-bl-none'
                                                        }`}>
                                                            {comment.comment}
                                                        </div>
                                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-2 px-2">
                                                            {isMyReply ? 'My Reply' : 'Admin Reply'} • {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <History size={32} />
                                                </div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] max-w-[180px]">No comments yet. Awaiting review.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        <textarea
                                            value={replyComment}
                                            onChange={(e) => setReplyComment(e.target.value)}
                                            placeholder="Write a comment..."
                                            className="w-full bg-slate-50 border-none rounded-[2rem] p-6 text-sm font-bold placeholder:text-slate-300 focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px] resize-none outline-none leading-relaxed"
                                        />
                                        <button 
                                            onClick={handleReply}
                                            disabled={!replyComment.trim()}
                                            className="w-full py-5 bg-primary text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.25em] shadow-3xl shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                        >
                                            <Send size={18} /> Send Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
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

export default StaffReportDashboard;
