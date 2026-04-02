import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Filter, 
    Search, 
    CheckCircle2, 
    AlertCircle, 
    MessageSquare, 
    User, 
    Calendar, 
    FileText, 
    ChevronRight, 
    X, 
    ShieldCheck, 
    Clock, 
    ArrowUpRight,
    Send,
    Download,
    Eye,
    Terminal,
    Cpu,
    Grid,
    Activity,
    Target,
    Fingerprint,
    Shield
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import FilePreview from '../components/FilePreview';
import UnifiedFilePreview from '../components/UnifiedFilePreview';
import Loader from '../components/Loader';

const AdminReportDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminComment, setAdminComment] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [previewFile, setPreviewFile] = useState(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRole, setFilterRole] = useState('All');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, filterStatus, filterRole, filterType, searchTerm]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await api.get('/staff-reports');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync reports:', error);
            toast.error('Failed to sync reports');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = reports;
        if (filterStatus !== 'All') result = result.filter(r => r.status === filterStatus);
        if (filterRole !== 'All') result = result.filter(r => r.senderRole === filterRole);
        if (filterType !== 'All') result = result.filter(r => r.reportType === filterType);
        if (searchTerm) {
            result = result.filter(r => 
                r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.creatorId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredReports(result);
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedReport) return;
        try {
            const payload = { status };
            if (adminComment) payload.comment = adminComment;

            const response = await api.put(`/staff-reports/${selectedReport._id}/status`, payload);

            toast.success(`Status updated: ${status}`);
            setAdminComment('');
            fetchReports(); 
            setSelectedReport(response.data.report); 
        } catch (error) {
            console.error('Status update failed:', error);
            toast.error('Failed to update status');
        }
    };

    const handleReply = async () => {
        if (!selectedReport || !adminComment.trim()) return;
        try {
            const response = await api.post(`/staff-reports/${selectedReport._id}/reply`, { comment: adminComment });
            toast.success('Reply submitted');
            setAdminComment('');
            fetchReports(); 
            setSelectedReport(response.data.report);
        } catch (error) {
            console.error('Transmission failure:', error);
            toast.error('Failed to send reply');
        }
    };

    const stats = {
        pending: reports.filter(r => r.status === 'Submitted').length,
        action: reports.filter(r => r.status === 'Action Required').length,
        resolved: reports.filter(r => r.status === 'Resolved').length,
        total: reports.length
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Submitted': return { bg: 'bg-amber-500/10 text-amber-500', border: 'border-amber-500/20', icon: <Clock size={14} /> };
            case 'Reviewed': return { bg: 'bg-indigo-500/10 text-indigo-400', border: 'border-indigo-500/20', icon: <Search size={14} /> };
            case 'Action Required': return { bg: 'bg-rose-500/10 text-rose-500', border: 'border-rose-500/20', icon: <AlertCircle size={14} /> };
            case 'Resolved': return { bg: 'bg-emerald-500/10 text-emerald-500', border: 'border-emerald-500/20', icon: <CheckCircle2 size={14} /> };
            default: return { bg: 'bg-slate-500/10 text-slate-400', border: 'border-slate-500/20', icon: <Terminal size={14} /> };
        }
    };

    if (loading && reports.length === 0) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto pb-20 px-4"
        >
            {/* Executive Oversight Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1 border-r border-white/5 pr-12">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Shield size={14} className="text-primary" /> Reports
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                            Staff <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400 italic">Reports Hub</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg leading-relaxed">
                            Review and manage staff reports, incidents, and administrative documentation.
                        </p>
                    </div>

                    {/* Matrix Statistics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-3/5">
                        {[
                            { label: 'Pending Review', value: stats.pending, color: 'amber', icon: Clock },
                            { label: 'Action Needed', value: stats.action, color: 'rose', icon: AlertCircle },
                            { label: 'Resolved', value: stats.resolved, color: 'emerald', icon: CheckCircle2 },
                            { label: 'Total Reports', value: stats.total, color: 'primary', icon: Grid }
                        ].map((stat, idx) => (
                            <div key={stat.label} className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 relative overflow-hidden group">
                                <div className={`p-3 bg-${stat.color === 'primary' ? 'primary' : stat.color}-500/20 text-${stat.color === 'primary' ? 'primary' : stat.color}-500 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-2">{stat.label}</h3>
                                <p className="text-4xl font-black text-white leading-none">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Precision Filter Terminal */}
            <div className="bg-white p-6 rounded-[3rem] border border-slate-50 shadow-3xl mb-12 flex flex-col xl:flex-row gap-6 items-center">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by staff name, title, or description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-22 pr-10 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none transition-all placeholder:text-slate-300"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Activity size={16} className="text-slate-400" />
                        <select 
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="All">All Statuses</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Reviewed">Reviewed</option>
                            <option value="Action Required">Action Required</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <Fingerprint size={16} className="text-slate-400" />
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="bg-transparent border-none text-[10px] font-black uppercase tracking-widest text-slate-700 focus:ring-0 cursor-pointer outline-none"
                        >
                            <option value="All">All Types</option>
                            <option value="Academic">Academic</option>
                            <option value="Discipline">Discipline</option>
                            <option value="Health">Health</option>
                            <option value="Attendance">Attendance</option>
                            <option value="Incident">Incident</option>
                            <option value="General">General</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Audit Grid */}
            <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                    {filteredReports.map((report, idx) => {
                        const styles = getStatusStyles(report.status);
                        return (
                            <motion.div
                                layout
                                key={report._id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ delay: idx * 0.05 }}
                                onClick={() => setSelectedReport(report)}
                                className="group bg-white p-8 rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/40 hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-500 cursor-pointer flex flex-col lg:flex-row items-center gap-10 overflow-hidden relative"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                                
                                <div className={`w-24 h-24 rounded-[2rem] ${styles.bg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
                                    <FileText size={40} />
                                </div>

                                <div className="flex-1 relative z-10 w-full">
                                    <div className="flex flex-wrap items-center gap-4 mb-3">
                                        <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-primary transition-colors">{report.title}</h3>
                                        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border ${styles.bg} ${styles.border}`}>
                                            {styles.icon} {report.status}
                                        </div>
                                        <span className="px-4 py-1.5 bg-slate-950 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-full">
                                            {report.reportType}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 font-bold text-lg line-clamp-2 max-w-4xl mb-6 italic">
                                        "{report.description}"
                                    </p>
                                    <div className="flex flex-wrap items-center gap-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-slate-950 group-hover:text-white transition-colors duration-500">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Submitted By</p>
                                                <p className="text-sm font-black text-slate-900">{report.creatorId?.name} <span className="text-primary italic opacity-60">({report.senderRole})</span></p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date Submitted</p>
                                                <p className="text-sm font-black text-slate-900">{new Date(report.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        {report.attachment && (
                                            <div className="flex items-center gap-2 text-emerald-500 font-black text-xs uppercase tracking-[0.2em]">
                                                <Download size={14} /> File Attached
                                            </div>
                                        )}
                                        {report.adminComments?.length > 0 && (
                                            <div className="flex items-center gap-2 text-indigo-500 font-black text-xs uppercase tracking-[0.2em]">
                                                <MessageSquare size={14} /> {report.adminComments.length} Comments
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-shrink-0 lg:pl-10 lg:border-l border-slate-100 flex items-center justify-center">
                                    <div className="w-14 h-14 bg-slate-50 rounded-3xl text-slate-200 group-hover:bg-primary group-hover:text-white group-hover:shadow-2xl group-hover:rotate-45 transition-all duration-700 flex items-center justify-center">
                                        <ArrowUpRight size={32} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Premium Audit Console Modal */}
            <AnimatePresence>
                {selectedReport && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4 z-[100]"
                    >
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white rounded-[4rem] shadow-4xl w-full max-w-[95vw] max-h-[95vh] overflow-hidden flex flex-col relative"
                        >
                            <button 
                                onClick={() => setSelectedReport(null)}
                                className="absolute top-10 right-10 p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all z-20"
                            >
                                <X size={28} />
                            </button>

                            {/* Modal Header */}
                            <div className="p-16 border-b border-slate-50 bg-slate-50/50 flex flex-col gap-8">
                                <div className="flex flex-col lg:flex-row justify-between items-start gap-10">
                                    <div className="flex gap-10 items-start">
                                        <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center shadow-3xl ${getStatusStyles(selectedReport.status).bg} ${getStatusStyles(selectedReport.status).text}`}>
                                            <FileText size={48} />
                                        </div>
                                        <div className="space-y-4">
                                            <div className="flex flex-wrap items-center gap-4">
                                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">{selectedReport.title}</h2>
                                                <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${getStatusStyles(selectedReport.status).bg} ${getStatusStyles(selectedReport.status).text} ${getStatusStyles(selectedReport.status).border} flex items-center gap-2`}>
                                                    {getStatusStyles(selectedReport.status).icon} {selectedReport.status}
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-8 text-slate-400 font-bold text-lg">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary">
                                                        <User size={18} />
                                                    </div>
                                                    {selectedReport.creatorId?.name} <span className="text-sm opacity-50 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">{selectedReport.senderRole}</span>
                                                </div>
                                                <div className="w-2 h-2 rounded-full bg-slate-200" />
                                                <div className="flex items-center gap-3">
                                                    <Calendar size={18} className="text-primary" />
                                                    {new Date(selectedReport.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                                {/* Analysis Chamber (50%) */}
                                <div className="w-full lg:w-1/2 overflow-y-auto p-12 lg:p-16 space-y-16 bg-slate-50/20 custom-scrollbar">
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-4">
                                            <Target size={24} className="text-primary" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Report Description</h3>
                                        </div>
                                        <div className="p-12 bg-white rounded-[4rem] border border-slate-100 text-slate-700 font-medium leading-relaxed shadow-xl text-xl italic relative">
                                            <div className="absolute top-8 left-8 text-slate-100"><MessageSquare size={64} /></div>
                                            <span className="relative z-10">"{selectedReport.description}"</span>
                                        </div>
                                    </div>

                                    {selectedReport.attachment && (
                                        <div className="space-y-8">
                                            <div className="flex items-center gap-4 text-emerald-500">
                                                <Download size={24} />
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Attachment</h3>
                                            </div>
                                            <div className="rounded-[4rem] overflow-hidden border border-slate-100 shadow-3xl bg-white transition-transform hover:scale-[1.005] p-10 text-center">
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

                                {/* Decisions & Conversation Console (50%) */}
                                <div className="w-full lg:w-1/2 bg-slate-50/30 border-l border-slate-100 p-12 lg:p-16 flex flex-col overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center justify-between mb-12">
                                        <div className="flex items-center gap-4">
                                            <MessageSquare size={24} className="text-primary" />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Action Thread</h3>
                                        </div>
                                        {selectedReport.adminComments?.length > 0 && (
                                            <div className="px-5 py-2 bg-primary/10 rounded-full text-[10px] font-black text-primary uppercase tracking-widest leading-none border border-primary/20">
                                                {selectedReport.adminComments.length} Responses
                                            </div>
                                        )}
                                    </div>

                                    {/* Scrollable Comment History */}
                                    <div className="space-y-8 mb-12">
                                        {(selectedReport.adminComments && selectedReport.adminComments.length > 0) ? (
                                            selectedReport.adminComments.map((comment, idx) => {
                                                const commentAdminId = comment.adminId?._id || comment.adminId;
                                                const isMyComment = user && (String(commentAdminId) === String(user._id || user.id));
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: isMyComment ? 20 : -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={idx} 
                                                        className={`flex flex-col ${isMyComment ? 'items-end' : 'items-start'} gap-3`}
                                                    >
                                                        <div className={`p-8 rounded-[2.5rem] text-sm font-bold shadow-sm max-w-[95%] relative transition-all hover:shadow-md ${
                                                            isMyComment 
                                                                ? 'bg-slate-900 text-white rounded-br-none' 
                                                                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-none'
                                                        }`}>
                                                            {comment.comment}
                                                        </div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4 flex items-center gap-3">
                                                            {isMyComment ? (
                                                                <><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> Admin (You)</>
                                                            ) : (
                                                                <><div className="w-2 h-2 rounded-full bg-indigo-400" /> {comment.adminId?.name || 'Staff'}</>
                                                            )}
                                                            <span className="opacity-40">•</span>
                                                            <Clock size={10} /> {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-24 text-center space-y-8 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100 mx-4">
                                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                                                    <Activity size={40} className="opacity-20" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No Activity Logged</p>
                                                    <p className="text-xs font-bold text-slate-300 max-w-[220px]">This report has no documented administrative responses yet.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Input Surface (Sticky-like at bottom of scroll) */}
                                    <div className="mt-auto pt-12 border-t border-slate-100 space-y-8">
                                        <div className="relative group">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-indigo-500/20 rounded-[3rem] blur opacity-0 group-focus-within:opacity-100 transition duration-500" />
                                            <textarea
                                                value={adminComment}
                                                onChange={(e) => setAdminComment(e.target.value)}
                                                placeholder="Enter your administrative decision or comment here..."
                                                className="relative w-full bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 text-sm font-bold placeholder:text-slate-300 focus:ring-0 focus:border-primary/30 transition-all min-h-[160px] resize-none outline-none leading-relaxed shadow-sm shadow-slate-200/50"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <motion.button 
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUpdateStatus('Action Required')}
                                                className="py-6 bg-white border-2 border-rose-100 text-rose-500 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center justify-center gap-3 shadow-xl shadow-rose-500/5"
                                            >
                                                <AlertCircle size={20} /> Need Action
                                            </motion.button>
                                            <motion.button 
                                                whileHover={{ scale: 1.02, y: -2 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={() => handleUpdateStatus('Reviewed')}
                                                className="py-6 bg-white border-2 border-indigo-100 text-indigo-500 rounded-3xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary/5 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/5"
                                            >
                                                <Search size={20} /> Mark Reviewed
                                            </motion.button>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <motion.button 
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleUpdateStatus('Resolved')}
                                                className="w-full py-7 bg-emerald-600 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.4em] shadow-3xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all flex items-center justify-center gap-5 border-b-4 border-emerald-800 active:border-b-0"
                                            >
                                                <CheckCircle2 size={24} /> Resolve Report
                                            </motion.button>

                                            <div className="py-6 flex items-center gap-6">
                                                <div className="h-px bg-slate-100 flex-1" />
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest whitespace-nowrap">Communication Terminal</span>
                                                <div className="h-px bg-slate-100 flex-1" />
                                            </div>

                                            <motion.button 
                                                whileHover={{ scale: 1.01, y: -2 }}
                                                whileTap={{ scale: 0.99 }}
                                                disabled={!adminComment.trim()}
                                                onClick={handleReply}
                                                className="w-full py-7 bg-slate-950 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.4em] shadow-3xl shadow-slate-950/40 hover:bg-black transition-all flex items-center justify-center gap-5 disabled:opacity-50 disabled:cursor-not-allowed border-b-4 border-slate-800 active:border-b-0"
                                            >
                                                <Send size={22} className="text-primary" /> Send Reply
                                            </motion.button>
                                        </div>
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

export default AdminReportDashboard;
