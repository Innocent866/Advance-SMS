import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaFilter, FaSearch, FaCheck, FaExclamationTriangle, FaCommentDots, FaUserTag, FaCalendarDay } from 'react-icons/fa';

const AdminReportDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminComment, setAdminComment] = useState('');

    // Filters
    const [filterStatus, setFilterStatus] = useState('All');
    const [filterRole, setFilterRole] = useState('All');
    const [filterType, setFilterType] = useState('All');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, filterStatus, filterRole, filterType]);

    const fetchReports = async () => {
        try {
            const response = await api.get('/staff-reports');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let result = reports;
        if (filterStatus !== 'All') result = result.filter(r => r.status === filterStatus);
        if (filterRole !== 'All') result = result.filter(r => r.senderRole === filterRole);
        if (filterType !== 'All') result = result.filter(r => r.reportType === filterType);
        setFilteredReports(result);
    };

    const handleUpdateStatus = async (status) => {
        if (!selectedReport) return;
        try {
            const payload = { status };
            if (adminComment) payload.comment = adminComment;

            const response = await api.put(`/staff-reports/${selectedReport._id}/status`, payload);

            toast.success(`Report status updated to ${status}`);
            setAdminComment('');
            fetchReports(); // Refresh list background
            setSelectedReport(response.data.report); // Update modal with fresh data (including new comments)
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Submitted': 'bg-yellow-100 text-yellow-800',
            'Reviewed': 'bg-blue-100 text-blue-800',
            'Action Required': 'bg-red-100 text-red-800',
            'Resolved': 'bg-green-100 text-green-800'
        };
        return <span className={`px-2 py-1 rounded-md text-xs font-semibold ${styles[status] || 'bg-gray-100'}`}>{status}</span>;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar Placeholder or layout wrapper would be here in real app */}
            <div className="flex-1 p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Staff Reports Management</h1>
                    <p className="text-gray-600 mt-2">Oversee all reports submitted by staff members.</p>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    {/* List & Filters */}
                    <div className="space-y-6">
                        {/* Filters Bar */}
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                                <FaFilter /> Filters:
                            </div>
                            <select 
                                className="p-2 border rounded text-sm bg-gray-50"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Submitted">Submitted</option>
                                <option value="Reviewed">Reviewed</option>
                                <option value="Action Required">Action Required</option>
                                <option value="Resolved">Resolved</option>
                            </select>
                            <select 
                                className="p-2 border rounded text-sm bg-gray-50"
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value)}
                            >
                                <option value="All">All Roles</option>
                                <option value="Teacher">Teacher</option>
                                <option value="Class Teacher">Class Teacher</option>
                                <option value="HOD">HOD</option>
                                <option value="Counselor">Counselor</option>
                                <option value="Principal">Principal</option>
                                <option value="Vice Principal">Vice Principal</option>
                                <option value="Other">Other</option>
                            </select>
                             <select 
                                className="p-2 border rounded text-sm bg-gray-50"
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
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

                        {/* List */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                            {loading ? (
                                <div className="p-8 text-center">Loading...</div>
                            ) : filteredReports.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No reports found matching filters.</div>
                            ) : (
                                <div className="divide-y divide-gray-100">
                                    {filteredReports.map(report => (
                                        <div 
                                            key={report._id} 
                                            onClick={() => setSelectedReport(report)}
                                            className="p-4 hover:bg-indigo-50 cursor-pointer transition flex items-start gap-4"
                                        >
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                                                    {getStatusBadge(report.status)}
                                                </div>
                                                <div className="text-sm text-gray-600 mb-2 line-clamp-2">{report.description}</div>
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><FaUserTag /> {report.creatorId?.name} ({report.senderRole})</span>
                                                    <span className="flex items-center gap-1"><FaCalendarDay /> {new Date(report.date).toLocaleDateString()}</span>
                                                    <span className="bg-slate-100 px-2 rounded">{report.reportType}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Details Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedReport.title}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {getStatusBadge(selectedReport.status)}
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md border border-indigo-200">
                                            {selectedReport.reportType}
                                        </span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setSelectedReport(null)}
                                    className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            
                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                {/* Meta Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Submitted By</span>
                                        <span className="font-medium text-gray-900">{selectedReport.creatorId?.name}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Staff Role</span>
                                        <span className="font-medium text-gray-900">{selectedReport.senderRole}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Date</span>
                                        <span className="font-medium text-gray-900">{new Date(selectedReport.date).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-2">Description</h4>
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedReport.description}
                                    </div>
                                </div>

                                {/* Attachment */}
                                {selectedReport.attachment && (
                                    <div>
                                            <h4 className="text-sm font-bold text-gray-900 uppercase mb-2">Attachment</h4>
                                            <a href={selectedReport.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-2 rounded-lg text-sm transition">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path></svg>
                                                View Attachment
                                            </a>
                                    </div>
                                )}

                                {/* Admin Actions */}
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                                        <FaCommentDots /> Admin Response & Actions
                                    </h4>
                                    
                                    {/* History of comments */}
                                    <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                                        {selectedReport.adminComments?.length > 0 ? (
                                            selectedReport.adminComments.map((comment, idx) => {
                                                const adminId = comment.adminId?._id || comment.adminId;
                                                const isMe = user && (adminId === user._id || adminId === user.id);
                                                const senderName = isMe ? 'Me' : (comment.adminId?.name || 'Staff');

                                                return (
                                                     <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
                                                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                                                            isMe 
                                                                ? 'bg-blue-600 text-white rounded-br-none' 
                                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                                        }`}>
                                                            <p className="whitespace-pre-wrap">{comment.comment}</p>
                                                            <div className={`text-xs mt-1 ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                                                                {new Date(comment.createdAt).toLocaleString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="text-center text-gray-400 text-sm italic py-4">No conversation yet.</div>
                                        )}
                                    </div>

                                    <textarea
                                        className="w-full p-3 border border-gray-300 rounded-lg mb-4 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[80px]"
                                        placeholder="Add a comment or internal note..."
                                        value={adminComment}
                                        onChange={(e) => setAdminComment(e.target.value)}
                                    ></textarea>
                                    
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleUpdateStatus('Reviewed')}
                                                className="flex-1 bg-blue-50 text-blue-700 py-2.5 rounded-lg text-sm hover:bg-blue-100 transition font-medium border border-blue-200"
                                            >
                                                Mark Reviewed
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus('Action Required')}
                                                className="flex-1 bg-red-50 text-red-700 py-2.5 rounded-lg text-sm hover:bg-red-100 transition font-medium border border-red-200"
                                            >
                                                Action Required
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => handleUpdateStatus('Resolved')}
                                            className="w-full bg-green-600 text-white py-2.5 rounded-lg text-sm hover:bg-green-700 transition font-medium flex justify-center items-center gap-2 shadow-sm"
                                        >
                                            <FaCheck /> Mark as Resolved
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminReportDashboard;
