import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FileText, 
    Download, 
    Building, 
    Users, 
    Activity, 
    Clock, 
    PieChart, 
    BarChart2, 
    TrendingUp, 
    ShieldAlert, 
    Plus, 
    Search, 
    ChevronRight, 
    Calendar,
    CheckCircle,
    XCircle,
    Trash2,
    Paperclip,
    ExternalLink,
    Edit3,
    MessageSquare,
    Send
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const ReportCard = ({ title, value, subValue, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} text-white`}>
                <Icon size={24} />
            </div>
            {subValue && (
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    {subValue}
                </span>
            )}
        </div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
);

const BoardingReports = () => {
    usePageTitle('Boarding Reports');
    const { user } = useAuth();
    const isAdmin = ['school_admin', 'assistant_admin', 'super_admin'].includes(user?.role);
    const isHouseParent = user?.role === 'house_parent';

    const [analytics, setAnalytics] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [hostels, setHostels] = useState([]);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'Daily',
        hostelId: ''
    });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [selectedReportForView, setSelectedReportForView] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [commenting, setCommenting] = useState(false);

    useEffect(() => {
        fetchAnalytics();
        fetchReports();
        if (isHouseParent) fetchHostels();
    }, []);

    const fetchAnalytics = async () => {
        try {
            const res = await api.get('/boarding/analytics');
            setAnalytics(res.data.data);
        } catch (error) {
            console.error('Failed to load boarding analytics');
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await api.get('/boarding/reports');
            setReports(res.data.data || []);
        } catch (error) {
            toast.error('Failed to load reports');
        } finally {
            setLoading(false);
        }
    };

    const fetchHostels = async () => {
        try {
            const res = await api.get('/hostels');
            setHostels(res.data.data || res.data || []);
        } catch (error) {
            console.error('Failed to fetch hostels');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            const data = new FormData();
            data.append('title', formData.title);
            data.append('content', formData.content);
            data.append('type', formData.type);
            data.append('hostelId', formData.hostelId);
            
            selectedFiles.forEach(file => {
                data.append('attachments', file);
            });

            if (editingId) {
                await api.put(`/boarding/reports/${editingId}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Report updated successfully');
            } else {
                await api.post('/boarding/reports', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success('Report sent successfully');
            }

            setIsModalOpen(false);
            setFormData({ title: '', content: '', type: 'Daily', hostelId: '' });
            setSelectedFiles([]);
            setEditingId(null);
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process report');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (report) => {
        setFormData({
            title: report.title,
            content: report.content,
            type: report.type,
            hostelId: report.hostelId?._id || report.hostelId || ''
        });
        setEditingId(report._id);
        setSelectedFiles([]);
        setIsModalOpen(true);
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim() || !selectedReportForView) return;

        try {
            setCommenting(true);
            const res = await api.post(`/boarding/reports/${selectedReportForView._id}/comment`, {
                text: commentText
            });
            setSelectedReportForView(res.data.data);
            setCommentText('');
            toast.success('Comment added');
            fetchReports(); // Update the list too
        } catch (error) {
            toast.error('Failed to add comment');
        } finally {
            setCommenting(false);
        }
    };

    const handleUnapprove = async (id) => {
        try {
            const res = await api.put(`/boarding/reports/${id}/unapprove`);
            toast.success('Report unapproved');
            if (selectedReportForView && selectedReportForView._id === id) {
                setSelectedReportForView(res.data.data);
            }
            fetchReports();
        } catch (error) {
            toast.error('Failed to unapprove report');
        }
    };

    const handleApprove = async (id) => {
        try {
            const res = await api.put(`/boarding/reports/${id}/approve`);
            toast.success('Report approved');
            if (selectedReportForView && selectedReportForView._id === id) {
                setSelectedReportForView(res.data.data);
            }
            fetchReports();
        } catch (error) {
            toast.error('Failed to approve report');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this report?')) return;
        try {
            await api.delete(`/boarding/reports/${id}`);
            toast.success('Report deleted');
            fetchReports();
        } catch (error) {
            toast.error('Failed to delete report');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Boarding Reports & Insights</h1>
                    <p className="text-gray-500">Monitor hostel performance and track official communications.</p>
                </div>
                <div className="flex items-center gap-3">
                    {isHouseParent && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20"
                        >
                            <Plus size={20} />
                            <span>Compose Report</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <ReportCard 
                    title="Room Occupancy" 
                    value={`${analytics?.occupancy?.percentage}%`} 
                    subValue={`${analytics?.occupancy?.occupied}/${analytics?.occupancy?.total} Beds`}
                    icon={PieChart} 
                    color="bg-blue-600" 
                />
                <ReportCard 
                    title="Total Boarders" 
                    value={analytics?.boarders || 0} 
                    icon={Users} 
                    color="bg-purple-600" 
                />
                <ReportCard 
                    title="Health Incidents" 
                    value={analytics?.health?.recentVisits || 0} 
                    subValue="Last 30 Days"
                    icon={Activity} 
                    color="bg-red-600" 
                />
                <ReportCard 
                    title="Pending Leaves" 
                    value={analytics?.leaves?.pending || 0} 
                    icon={Clock} 
                    color="bg-orange-600" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Submitted Reports Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText className="text-primary" />
                            {isAdmin ? 'Received Reports' : 'My Sent Reports'}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-12 text-center text-gray-400">Loading reports...</div>
                        ) : reports.length === 0 ? (
                            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                                <FileText size={48} className="text-gray-200 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-gray-800">No reports found</h3>
                                <p className="text-gray-500">Official reports will appear here once submitted.</p>
                            </div>
                        ) : (
                            reports.map(report => (
                                <motion.div 
                                    key={report._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={() => setSelectedReportForView(report)}
                                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className={`p-3 rounded-xl ${
                                                report.type === 'Incident' ? 'bg-red-50 text-red-500' :
                                                report.type === 'Weekly' ? 'bg-blue-50 text-blue-500' :
                                                'bg-gray-50 text-gray-500'
                                            }`}>
                                                <ShieldAlert size={20} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                        report.type === 'Incident' ? 'bg-red-100 text-red-700' :
                                                        report.type === 'Weekly' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {report.type}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800">{report.title}</h4>
                                                </div>
                                                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{report.content}</p>
                                                <div className="flex items-center gap-4 text-xs text-gray-400">
                                                    <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(report.createdAt).toLocaleDateString()}</span>
                                                    <span className="flex items-center gap-1"><Users size={12} /> {report.createdBy?.firstName} {report.createdBy?.lastName}</span>
                                                    {report.hostelId && <span className="flex items-center gap-1"><Building size={12} /> {report.hostelId.name}</span>}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            {report.status === 'Approved' ? (
                                                <div className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                                                    <CheckCircle size={14} /> Approved
                                                </div>
                                            ) : isAdmin ? (
                                                <button 
                                                    onClick={() => handleApprove(report._id)}
                                                    className="flex items-center gap-1 bg-primary text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-primary/10"
                                                >
                                                    <CheckCircle size={14} /> Approve
                                                </button>
                                            ) : (
                                                <div className="flex items-center gap-1 text-orange-600 bg-orange-50 px-3 py-1 rounded-full text-xs font-bold border border-orange-100">
                                                    <Clock size={14} /> Pending
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                {isHouseParent && report.status !== 'Approved' && (
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEdit(report);
                                                        }}
                                                        className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg"
                                                        title="Edit Report"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(report._id);
                                                    }}
                                                    className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {report.attachments && report.attachments.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-gray-50 flex flex-wrap gap-2">
                                            {report.attachments.map((file, i) => {
                                                const fileUrl = `${api.defaults.baseURL.replace('/api', '')}/${file}`;
                                                const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
                                                const previewUrl = isImage ? fileUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                                                
                                                return (
                                                    <a 
                                                        key={i}
                                                        href={previewUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-100 transition-all"
                                                    >
                                                        <Paperclip size={14} className="text-gray-400" />
                                                        Evidence {i + 1}
                                                        <ExternalLink size={12} className="ml-1 opacity-40" />
                                                    </a>
                                                );
                                            })}
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>

                {/* Info / Quick Links */}
                <div className="space-y-6">
                    <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-xl space-y-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <TrendingUp size={120} />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-4">Hostel Performance</h3>
                            <div className="space-y-6">
                                {analytics?.hostelBreakdown?.slice(0, 3).map((hostel, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">{hostel.name}</span>
                                            <span className="font-bold text-gray-100">{Math.round((hostel.occupancy / hostel.capacity) * 100)}%</span>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div 
                                                className="h-full bg-primary rounded-full"
                                                style={{ width: `${(hostel.occupancy / hostel.capacity) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-6 rounded-3xl">
                        <h4 className="font-bold text-gray-800 mb-2">Reporting Guidelines</h4>
                        <ul className="text-xs text-gray-500 space-y-2 list-disc list-inside">
                            <li>Incident reports must be submitted within 24 hours.</li>
                            <li>Weekly summaries are due every Friday by 4 PM.</li>
                            <li>Ensure all details are accurate and unbiased.</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* COMPOSE REPORT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <FileText className="text-primary" />
                                    {editingId ? 'Edit Official Report' : 'Compose Official Report'}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingId(null);
                                        setFormData({ title: '', content: '', type: 'Daily', hostelId: '' });
                                        setSelectedFiles([]);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Report Type</label>
                                        <select 
                                            name="type"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.type}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Daily">Daily Report</option>
                                            <option value="Weekly">Weekly Summary</option>
                                            <option value="Monthly">Monthly Overview</option>
                                            <option value="Incident">Incident Report</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Hostel (Optional)</label>
                                        <select 
                                            name="hostelId"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={formData.hostelId}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">All / Not Specific</option>
                                            {hostels.map(h => <option key={h._id} value={h._id}>{h.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Title</label>
                                    <input 
                                        type="text" 
                                        name="title"
                                        required
                                        placeholder="Brief title of the report..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content</label>
                                    <textarea 
                                        name="content"
                                        required
                                        rows="6"
                                        placeholder="Detailed description and findings..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                                        value={formData.content}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attachments (Evidence)</label>
                                        <span className="text-[10px] text-gray-400">Max 5 files</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-gray-100 hover:border-primary/50 hover:bg-primary/5 p-4 rounded-2xl cursor-pointer transition-all group">
                                            <Plus size={20} className="text-gray-300 group-hover:text-primary" />
                                            <span className="text-sm font-bold text-gray-400 group-hover:text-primary">Add Files</span>
                                            <input 
                                                type="file" 
                                                multiple 
                                                className="hidden" 
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                onChange={(e) => setSelectedFiles(Array.from(e.target.files).slice(0, 5))}
                                            />
                                        </label>
                                    </div>
                                    {selectedFiles.length > 0 && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedFiles.map((file, i) => (
                                                <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                                                    <Paperclip size={14} className="text-primary" />
                                                    <span className="text-xs font-medium text-gray-600 truncate">{file.name}</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                                        className="ml-auto text-gray-300 hover:text-red-500"
                                                    >
                                                        <XCircle size={14} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingId(null);
                                            setFormData({ title: '', content: '', type: 'Daily', hostelId: '' });
                                            setSelectedFiles([]);
                                        }}
                                        className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center gap-2 bg-primary text-white px-8 py-2.5 rounded-xl hover:shadow-lg shadow-primary/30 transition-all font-bold disabled:opacity-50"
                                    >
                                        {submitting ? (editingId ? 'Updating...' : 'Sending...') : (editingId ? 'Save Changes' : 'Send to Admin')}
                                        <TrendingUp size={18} />
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* DETAIL VIEW MODAL */}
            <AnimatePresence>
                {selectedReportForView && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-5xl h-[85vh] overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${
                                        selectedReportForView.type === 'Incident' ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-primary shadow-lg shadow-primary/20'
                                    } text-white`}>
                                        <FileText size={28} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-black text-gray-900">{selectedReportForView.title}</h2>
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                selectedReportForView.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                            }`}>
                                                {selectedReportForView.status}
                                            </span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-400">
                                            {selectedReportForView.type} Report • {new Date(selectedReportForView.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedReportForView(null)}
                                    className="p-3 hover:bg-white rounded-2xl transition-all text-gray-400 hover:text-red-500 hover:shadow-md"
                                >
                                    <XCircle size={28} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-hidden flex">
                                {/* Left Side: Content & Attachments */}
                                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-10 border-r border-gray-100">
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Official Statement</h4>
                                        <div className="p-8 bg-gray-50 rounded-3xl border border-gray-100 text-gray-700 leading-relaxed font-medium whitespace-pre-wrap italic shadow-inner">
                                            "{selectedReportForView.content}"
                                        </div>
                                    </div>

                                    {selectedReportForView.attachments?.length > 0 && (
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em]">Evidence & Attachments</h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedReportForView.attachments.map((file, i) => {
                                                    const fileUrl = `${api.defaults.baseURL.replace('/api', '')}/${file}`;
                                                    const isImage = /\.(jpg|jpeg|png|webp|gif)$/i.test(file);
                                                    const previewUrl = isImage ? fileUrl : `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;
                                                    
                                                    return (
                                                        <a 
                                                            key={i}
                                                            href={previewUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-5 bg-white border border-gray-100 rounded-[1.5rem] hover:shadow-lg transition-all"
                                                        >
                                                            <div className="p-3 bg-indigo-50 text-indigo-500 rounded-xl">
                                                                <Paperclip size={20} />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-black text-gray-800">Evidence {i + 1}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 uppercase">{isImage ? 'Image' : 'Document'}</p>
                                                            </div>
                                                            <ExternalLink size={18} className="text-gray-300" />
                                                        </a>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <div className="pt-10 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400">
                                                    <Users size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Author</p>
                                                    <p className="text-sm font-black text-gray-900">{selectedReportForView.createdBy?.firstName} {selectedReportForView.createdBy?.lastName}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                {isAdmin && selectedReportForView.status === 'Approved' && (
                                                    <button 
                                                        onClick={() => handleUnapprove(selectedReportForView._id)}
                                                        className="flex items-center gap-2 bg-orange-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200 hover:scale-105 transition-all"
                                                    >
                                                        <XCircle size={18} /> Unapprove Report
                                                    </button>
                                                )}
                                                {isHouseParent && selectedReportForView.status !== 'Approved' && String(selectedReportForView.createdBy?._id || selectedReportForView.createdBy) === String(user?._id || user?.id) && (
                                                    <button 
                                                        onClick={() => {
                                                            const report = { ...selectedReportForView };
                                                            setSelectedReportForView(null);
                                                            handleEdit(report);
                                                        }}
                                                        className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-200 transition-all"
                                                    >
                                                        <Edit3 size={18} /> Edit Report
                                                    </button>
                                                )}
                                                {isAdmin && selectedReportForView.status !== 'Approved' && (
                                                    <button 
                                                        onClick={() => handleApprove(selectedReportForView._id)}
                                                        className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                                    >
                                                        <CheckCircle size={18} /> Approve Report
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => {
                                                        const id = selectedReportForView._id;
                                                        setSelectedReportForView(null);
                                                        handleDelete(id);
                                                    }}
                                                    className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                                    title="Delete Report"
                                                >
                                                    <Trash2 size={24} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Comment Thread */}
                                <div className="w-[400px] flex flex-col bg-gray-50/30">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/50">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare size={16} /> Discussion Thread
                                        </h4>
                                        <span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-[10px] font-black text-gray-400">
                                            {selectedReportForView.comments?.length || 0}
                                        </span>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
                                        {selectedReportForView.comments?.length > 0 ? (
                                            selectedReportForView.comments.map((comment, idx) => {
                                                const isMyComment = user && (String(comment.senderId?._id || comment.senderId) === String(user._id || user.id));
                                                return (
                                                    <motion.div 
                                                        initial={{ opacity: 0, x: isMyComment ? 20 : -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        key={idx} 
                                                        className={`flex flex-col ${isMyComment ? 'items-end' : 'items-start'} gap-2`}
                                                    >
                                                        <div className={`p-5 rounded-2xl text-sm font-bold shadow-sm max-w-[90%] ${
                                                            isMyComment 
                                                                ? 'bg-primary text-white rounded-br-none' 
                                                                : 'bg-white border border-gray-100 text-gray-700 rounded-bl-none'
                                                        }`}>
                                                            {comment.text}
                                                        </div>
                                                        <div className="flex items-center gap-2 px-2">
                                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{isMyComment ? 'You' : comment.senderId?.name || 'Staff member'}</span>
                                                            <span className="text-[10px] text-gray-300">•</span>
                                                            <span className="text-[10px] font-bold text-gray-300">{new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4 opacity-40">
                                                <div className="p-4 bg-gray-100 rounded-full">
                                                    <MessageSquare size={32} className="text-gray-400" />
                                                </div>
                                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No Discussion Yet</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment Input */}
                                    <form onSubmit={handleCommentSubmit} className="p-6 bg-white border-t border-gray-100">
                                        <div className="relative group">
                                            <textarea
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                placeholder="Write a message..."
                                                className="w-full bg-gray-50 border border-gray-100 rounded-[1.5rem] p-5 pr-14 text-sm font-bold placeholder:text-gray-300 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all resize-none h-[100px] outline-none"
                                            />
                                            <button 
                                                type="submit"
                                                disabled={!commentText.trim() || commenting}
                                                className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                                            >
                                                <Send size={18} />
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default BoardingReports;
