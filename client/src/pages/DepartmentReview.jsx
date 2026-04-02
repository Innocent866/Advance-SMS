import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    FileText, 
    MessageCircle,
    Eye,
    ChevronRight,
    Search,
    RefreshCw,
    Activity,
    Binary,
    Zap,
    Cpu,
    ShieldCheck,
    Layers,
    ArrowUpRight,
    Terminal,
    MonitorPlay,
    BookMarked,
    Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Loader from '../components/Loader';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import UnifiedFilePreview from '../components/UnifiedFilePreview';

const DepartmentReview = () => {
    usePageTitle('Pedagogical Oversight Hub');
    const { showNotification } = useNotification();
    const { user } = useAuth();
    
    const [materials, setMaterials] = useState([]);
    const [reports, setReports] = useState([]);
    const [activeTab, setActiveTab] = useState('materials'); // 'materials' or 'reports'
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [filter, setFilter] = useState('Pending HOD');
    const [previewFile, setPreviewFile] = useState(null);

    useEffect(() => {
        setSelectedItem(null);
        if (activeTab === 'materials') {
            fetchMaterials();
        } else {
            fetchReports();
        }
    }, [filter, activeTab]);

    const fetchMaterials = async () => {
        try {
            setLoading(true);
            const res = await api.get('/learning-materials', {
                params: { 
                    status: filter,
                    reviewOnly: true 
                }
            });
            setMaterials(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Transmission failure:', error);
            showNotification('Failed to sync pedagogical archives', 'error');
            setLoading(false);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/staff-reports', {
                params: { 
                    status: filter,
                    reviewOnly: true 
                }
            });
            setReports(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Report sync failure:', error);
            showNotification('Failed to sync staff reports', 'error');
            setLoading(false);
        }
    };

    const handleAction = async (id, action) => {
        try {
            const endpoint = activeTab === 'materials' 
                ? `/learning-materials/${id}/hod-review` 
                : `/staff-reports/hod-review/${id}`;
            
            await api[activeTab === 'materials' ? 'put' : 'post'](endpoint, {
                action,
                feedback
            });

            showNotification(`Artifact ${action === 'Approve' ? 'Validated' : 'Deferred'}`, 'success');
            setSelectedItem(null);
            setFeedback('');
            activeTab === 'materials' ? fetchMaterials() : fetchReports();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Protocol failure', 'error');
        }
    };

    if (loading && (materials.length === 0 && reports.length === 0)) return <Loader type="spinner" />;

    const items = activeTab === 'materials' ? materials : reports;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1700px] mx-auto pb-20 px-6"
        >
            {/* Neural Oversight Header */}
            <div className="relative mb-8 p-12 rounded-[4rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Oversight Protocol
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Departmental <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Oversight Hub</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Audit and validate pedagogical artifacts and staff reports from your department. 
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center">
                            <Layers className="text-primary mx-auto mb-4" size={28} />
                            <p className="text-3xl font-black">{items.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Active Queue</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center">
                            <ShieldCheck className="text-indigo-400 mx-auto mb-4" size={28} />
                            <p className="text-3xl font-black">{activeTab === 'materials' ? 'Lesson' : 'Staff'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Current Stream</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tab Control Surface */}
            <div className="flex items-center gap-4 mb-8">
                {[
                    { id: 'materials', label: 'Lesson Materials', icon: BookMarked },
                    { id: 'reports', label: 'Staff Reports', icon: FileText }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${
                            activeTab === tab.id 
                            ? 'bg-primary text-white shadow-2xl shadow-primary/20' 
                            : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
                        }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Spectrum Flow Filter */}
            <div className="flex flex-wrap items-center justify-between mb-12 gap-8 bg-white/50 backdrop-blur-3xl p-4 rounded-[3rem] border border-white shadow-2xl shadow-slate-200/40">
                <div className="flex flex-wrap gap-2">
                    {['Pending HOD', 'HOD Approved', 'HOD Rejected'].map((s) => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-10 py-5 rounded-[2.2rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-3 ${
                                filter === s 
                                ? 'bg-slate-900 text-white shadow-2xl shadow-slate-900/40 translate-y-[-2px]' 
                                : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${filter === s ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
                            {s.replace('HOD ', '')}
                        </button>
                    ))}
                </div>
                
                <div className="items-center gap-4 px-8 border-l border-slate-100 hidden md:flex">
                    <div className="p-3 bg-indigo-50 rounded-xl text-indigo-500">
                        <Cpu size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active System</p>
                        <p className="text-xs font-black text-slate-700">MATRIX V.2.0</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                {/* Artifact Matrix */}
                <div className="xl:col-span-7 space-y-8">
                    {items.length === 0 ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[4rem] p-32 text-center border border-slate-100 shadow-2xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
                            <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 border border-slate-100 shadow-inner">
                                <Clock size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Registry Clean</h3>
                            <p className="text-slate-400 mt-3 text-xl font-medium max-w-sm mx-auto">No pending items detected in the "{filter}" sector for {activeTab}.</p>
                        </motion.div>
                    ) : (
                        <div className="grid gap-8">
                            <AnimatePresence mode="popLayout">
                                {items.map((m, idx) => (
                                    <motion.div 
                                        key={m._id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => setSelectedItem(m)}
                                        className={`group relative bg-white rounded-[3rem] p-10 border-2 transition-all duration-700 cursor-pointer overflow-hidden ${
                                            selectedItem?._id === m._id 
                                            ? 'border-primary shadow-3xl shadow-primary/10 -translate-y-2' 
                                            : 'border-transparent shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:border-slate-100'
                                        }`}
                                    >
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-slate-50 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-primary/5 transition-colors" />
                                        
                                        <div className="flex justify-between items-center relative z-10">
                                            <div className="flex gap-8 items-center">
                                                <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-3xl font-black shadow-2xl transition-all duration-700 ${
                                                    selectedItem?._id === m._id ? 'bg-primary text-white rotate-6' : 'bg-slate-50 text-primary group-hover:bg-primary/10'
                                                }`}>
                                                    {activeTab === 'materials' 
                                                        ? (m.type === 'Video' ? <MonitorPlay size={32} /> : <BookMarked size={32} />)
                                                        : <FileText size={32} />
                                                    }
                                                </div>
                                                <div>
                                                    <h3 className={`text-2xl font-black tracking-tight transition-colors duration-500 ${
                                                        selectedItem?._id === m._id ? 'text-primary' : 'text-slate-900'
                                                    }`}>
                                                        {m.title}
                                                    </h3>
                                                    <div className="flex items-center gap-4 mt-3">
                                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-white transition-all">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.creatorId?.name || m.teacherId?.name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-white transition-all">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeTab === 'materials' ? m.subject : m.reportType}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 ${
                                                selectedItem?._id === m._id ? 'bg-primary text-white translate-x-1' : 'bg-slate-50 text-slate-300 group-hover:text-primary group-hover:translate-x-1'
                                            }`}>
                                                <ChevronRight size={28} />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex items-center justify-between relative z-10 pt-8 border-t border-slate-50">
                                            <div className="flex items-center gap-6">
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <Calendar size={14} className="text-primary" /> {new Date(m.createdAt || m.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                </span>
                                                <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                                    <Zap size={14} className="text-indigo-400" /> PRIORITY LEVEL 1
                                                </span>
                                            </div>
                                            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                ID: {m._id.slice(-6).toUpperCase()}
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>

                {/* Pedagogical Audit Console */}
                <div className="xl:col-span-5">
                    {selectedItem ? (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[4rem] shadow-3xl border border-slate-100 overflow-hidden sticky top-8"
                        >
                            <div className="p-12 bg-slate-900 text-white relative">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                                <div className="relative space-y-4">
                                    <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-white/10 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                                        <Terminal size={12} className="text-primary" /> Audit Case: {selectedItem._id.slice(-8).toUpperCase()}
                                    </div>
                                    <h3 className="text-4xl font-black tracking-tight leading-tight">{selectedItem.title}</h3>
                                    <div className="flex flex-wrap gap-3 pt-2">
                                        <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                                            {activeTab === 'materials' ? selectedItem.subject : selectedItem.reportType}
                                        </span>
                                        <span className="px-5 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 text-primary">
                                            {activeTab === 'materials' ? selectedItem.classLevel : (selectedItem.senderRole || 'Staff')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-12 space-y-12">
                                <div className="space-y-6">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] block ml-4">Qualitative Data</label>
                                    <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 relative group">
                                        <blockquote className="text-slate-600 leading-relaxed font-bold italic text-base">
                                            "{selectedItem.description || 'No qualitative data was provided.'}"
                                        </blockquote>
                                        <div className="absolute -top-4 -left-4 w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:rotate-12 transition-transform">
                                            <MessageCircle size={20} />
                                        </div>
                                    </div>
                                </div>

                                {(selectedItem.fileUrl || selectedItem.attachment || selectedItem.url) && (
                                    <div className="space-y-6">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] block ml-4">Visual Verification</label>
                                        <button 
                                            onClick={() => setPreviewFile({ 
                                                url: selectedItem.fileUrl || selectedItem.attachment || selectedItem.url, 
                                                title: selectedItem.title,
                                                mimeType: selectedItem.mimeType || selectedItem.attachmentFileType || (activeTab === 'materials' ? 'application/pdf' : 'text/plain')
                                            })}
                                            className="w-full group relative overflow-hidden h-32 rounded-[2.5rem] border-2 border-dashed border-slate-200 hover:border-primary transition-all flex items-center justify-center"
                                        >
                                            <div className="absolute inset-0 bg-slate-50 group-hover:bg-primary/5 transition-colors" />
                                            <div className="relative flex items-center gap-4 text-slate-400 group-hover:text-primary transition-colors">
                                                <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                    <Eye size={24} />
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-xs">Execute Artifact Review</span>
                                            </div>
                                        </button>
                                    </div>
                                )}

                                {filter === 'Pending HOD' ? (
                                    <div className="space-y-10 pt-10 border-t border-slate-100">
                                        <div className="space-y-6">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] block ml-4">Executive Oversight Feedback</label>
                                            <textarea 
                                                value={feedback}
                                                onChange={(e) => setFeedback(e.target.value)}
                                                placeholder="Document required adjustments or departmental comments here..."
                                                className="w-full px-10 py-8 rounded-[2.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all font-bold text-slate-700 resize-none h-40 leading-relaxed placeholder:text-slate-300"
                                            />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-8">
                                            <button 
                                                onClick={() => handleAction(selectedItem._id, 'Reject')}
                                                className="flex flex-col items-center justify-center gap-4 bg-rose-50 text-rose-500 p-8 rounded-[2.5rem] font-black hover:bg-rose-100 transition-all border border-rose-100/50 shadow-xl shadow-rose-500/5 group active:scale-95"
                                            >
                                                <XCircle size={36} className="group-hover:rotate-90 transition-transform duration-500" />
                                                DEFER
                                            </button>
                                            <button 
                                                onClick={() => handleAction(selectedItem._id, 'Approve')}
                                                className="flex flex-col items-center justify-center gap-4 bg-primary text-white p-8 rounded-[2.5rem] font-black hover:bg-black transition-all shadow-3xl shadow-primary/30 group active:scale-95"
                                            >
                                                <CheckCircle size={36} className="group-hover:scale-110 transition-transform duration-500" />
                                                VALIDATE
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="pt-10 border-t border-slate-100 space-y-8">
                                        <div className={`p-8 rounded-[2.5rem] flex items-center justify-between border ${
                                            filter === 'HOD Approved' 
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-xl shadow-emerald-500/5' 
                                            : 'bg-rose-50 text-rose-700 border-rose-100 shadow-xl shadow-rose-500/5'
                                        }`}>
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-lg">
                                                    {filter === 'HOD Approved' ? <CheckCircle className="text-emerald-500" size={28}/> : <XCircle className="text-rose-500" size={28}/>}
                                                </div>
                                                <span className="font-black uppercase tracking-widest text-xs">OVERSIGHT Status: {filter.replace('HOD ', '')}</span>
                                            </div>
                                            <div className="p-3 bg-white/50 rounded-xl">
                                                <Activity size={18} />
                                            </div>
                                        </div>
                                        {(selectedItem.hodFeedback || (selectedItem.adminComments?.length > 0)) && (
                                            <div className="space-y-4">
                                                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.35em] block ml-4">Audit Trail Feedback</label>
                                                 <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100 relative group overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -mr-16 -mt-16" />
                                                    <p className="relative text-lg text-slate-600 font-bold italic leading-relaxed">
                                                        "{selectedItem.hodFeedback || (selectedItem.adminComments && selectedItem.adminComments[0]?.comment) || 'No feedback documented.'}"
                                                    </p>
                                                 </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <div className="bg-white rounded-[4rem] p-32 text-center border border-slate-100 shadow-2xl shadow-slate-200/40 flex flex-col items-center gap-8 sticky top-8">
                            <div className="w-24 h-24 bg-slate-50 text-slate-300 rounded-[2.5rem] flex items-center justify-center animate-bounce shadow-inner border border-slate-100">
                                <Activity size={48} />
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Idle</h3>
                                <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-sm mx-auto">Select a pedagogical artifact or staff report from the registry to initiate oversight protocol.</p>
                            </div>
                            <div className="pt-8 w-full border-t border-slate-50">
                                <button 
                                    onClick={() => activeTab === 'materials' ? fetchMaterials() : fetchReports()}
                                    className="text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-3 mx-auto group"
                                >
                                    Refresh Registry <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-1000" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Unified File Preview */}
            <UnifiedFilePreview 
                file={previewFile} 
                isOpen={!!previewFile} 
                onClose={() => setPreviewFile(null)} 
            />
        </motion.div>
    );
};

export default DepartmentReview;
