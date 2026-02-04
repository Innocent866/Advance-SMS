import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaPlus, FaFileAlt, FaPaperclip, FaSchool, FaChalkboardTeacher, FaCalendarAlt, FaUserTie } from 'react-icons/fa';

const StaffReportDashboard = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [replyComment, setReplyComment] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);

    const handleReply = async () => {
        // ... handled in separate block usually, but let's keep references correct if context needed
        if (!selectedReport || !replyComment.trim()) return;
        try {
            const response = await api.post(`/staff-reports/${selectedReport._id}/reply`, { comment: replyComment });
            toast.success('Reply sent');
            setReplyComment('');
            fetchMyReports(); 
            setSelectedReport(response.data.report);
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        }
    };

    const handleRowClick = (report) => {
        setSelectedReport(report);
        setReplyComment('');
    };

    const [formData, setFormData] = useState({
        senderRole: 'Teacher',
        reportType: 'Academic',
        date: new Date().toISOString().split('T')[0],
        title: '',
        description: '',
        attachment: ''
    });

    const resetForm = () => {
        setFormData({
            senderRole: 'Teacher',
            reportType: 'Academic',
            date: new Date().toISOString().split('T')[0],
            title: '',
            description: '',
            attachment: ''
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
            attachment: report.attachment || ''
        });
        setEditId(report._id);
        setSelectedReport(null); // Close modal
        setShowForm(true);
    };

    // ... define reportTypes and senderRoles ...

    const reportTypes = ['Academic', 'Discipline', 'Health', 'Attendance', 'Incident', 'General'];
    const senderRoles = ['Teacher', 'Class Teacher', 'HOD', 'Principal', 'Vice Principal', 'Counselor', 'Other'];

    useEffect(() => {
        fetchMyReports();
    }, []);

    const fetchMyReports = async () => {
        try {
            const response = await api.get('/staff-reports/my-reports');
            setReports(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching reports:', error);
            toast.error('Failed to load reports');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                 await api.put(`/staff-reports/${editId}`, formData);
                 toast.success('Report updated successfully!');
            } else {
                 await api.post('/staff-reports', formData);
                 toast.success('Report submitted successfully!');
            }
            resetForm();
            fetchMyReports();
        } catch (error) {
            console.error('Error saving report:', error);
            toast.error('Failed to save report');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Submitted': return 'bg-yellow-100 text-yellow-800';
            case 'Reviewed': return 'bg-blue-100 text-blue-800';
            case 'Action Required': return 'bg-red-100 text-red-800';
            case 'Resolved': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Staff Reports</h1>
                        <p className="text-gray-600 mt-2">Submit and track your reports to the administration</p>
                    </div>
                    <button 
                        onClick={() => showForm ? resetForm() : setShowForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                        <FaPlus /> {showForm ? 'Cancel' : 'Create Report'}
                    </button>
                </div>

                {showForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-indigo-100">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-indigo-900">
                            <FaFileAlt /> {editId ? 'Edit Report Details' : 'New Report Details'}
                        </h2>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Role & Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">My Role</label>
                                <div className="relative">
                                    <FaUserTie className="absolute left-3 top-3 text-gray-400" />
                                    <select 
                                        name="senderRole" 
                                        value={formData.senderRole}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {senderRoles.map(role => <option key={role} value={role}>{role}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                                <div className="relative">
                                    <FaSchool className="absolute left-3 top-3 text-gray-400" />
                                    <select 
                                        name="reportType" 
                                        value={formData.reportType}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    >
                                        {reportTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Date & Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Report</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Report Title</label>
                                <input 
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Brief summary of the report"
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>

                            {/* Description - Full Width */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="6"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Provide all necessary details here..."
                                    required
                                ></textarea>
                            </div>

                            {/* Attachment (Optional) */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Attachment URL (Optional)</label>
                                <div className="relative">
                                    <FaPaperclip className="absolute left-3 top-3 text-gray-400" />
                                    <input 
                                        type="url"
                                        name="attachment"
                                        value={formData.attachment}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/file.pdf"
                                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Direct link to document or image.</p>
                            </div>

                            <div className="md:col-span-2 flex justify-end">
                                <button 
                                    type="submit"
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                                >
                                    {editId ? 'Update Report' : 'Submit Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Reports List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50">
                        <h3 className="font-semibold text-gray-800">My Reports History</h3>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Loading reports...</div>
                    ) : reports.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">You haven't submitted any reports yet.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-semibold">
                                    <tr>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Type</th>
                                        <th className="px-6 py-4">Role Used</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Admin Comments</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {reports.map((report) => (
                                        <tr 
                                            key={report._id} 
                                            onClick={() => handleRowClick(report)}
                                            className="hover:bg-indigo-50 transition cursor-pointer"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900">{report.title}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-full bg-gray-100 text-xs font-medium border border-gray-200">
                                                    {report.reportType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{report.senderRole}</td>
                                            <td className="px-6 py-4">{new Date(report.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-gray-500 max-w-xs truncate">
                                                {report.adminComments.length > 0 ? report.adminComments[report.adminComments.length - 1].comment : '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Report Details Modal */}
                {selectedReport && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
                            <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-start sticky top-0 z-10">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-1">{selectedReport.title}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(selectedReport.status)}`}>
                                            {selectedReport.status}
                                        </span>
                                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-md border border-indigo-200">
                                            {selectedReport.reportType}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => handleEditClick(selectedReport)}
                                        className="text-gray-500 hover:text-indigo-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-gray-100 transition border border-gray-200"
                                    >
                                        Edit Report
                                    </button>
                                    <button 
                                        onClick={() => setSelectedReport(null)}
                                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>
                            </div>
                            
                            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                                {/* Meta Info */}
                                <div className="grid grid-cols-2 gap-4 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <span className="block text-gray-500 text-xs uppercase mb-1">Submitted As</span>
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

                                {/* Admin Actions / Conversation */}
                                <div className="border-t pt-6">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase mb-3 flex items-center gap-2">
                                        Comments & Replies
                                    </h4>
                                    
                                    {/* History of comments */}
                                    <div className="space-y-4 mb-4 bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
                                        {selectedReport.adminComments?.length > 0 ? (
                                            selectedReport.adminComments.map((comment, idx) => {
                                                const adminId = comment.adminId?._id || comment.adminId;
                                                const isMe = user && (adminId === user._id || adminId === user.id);
                                                const senderName = isMe ? 'Me' : (comment.adminId?.name || 'Admin');
                                                
                                                return (
                                                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                        <span className="text-xs text-gray-500 mb-1 px-1">{senderName}</span>
                                                        <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${
                                                            isMe 
                                                                ? 'bg-indigo-600 text-white rounded-br-none' 
                                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                                                        }`}>
                                                            <p className="whitespace-pre-wrap">{comment.comment}</p>
                                                            <div className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-gray-400'}`}>
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
                                        placeholder="Type a reply..."
                                        value={replyComment}
                                        onChange={(e) => setReplyComment(e.target.value)}
                                    ></textarea>
                                    
                                    <div className="flex justify-end">
                                        <button 
                                            onClick={handleReply}
                                            disabled={!replyComment.trim()}
                                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Send Reply
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

export default StaffReportDashboard;
