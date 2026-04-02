import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Plus, Calendar, CheckCircle, XCircle, AlertCircle, Info, User, MessageSquare, LogIn } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const LeaveManagement = () => {
    usePageTitle('Leave Management');
    const { user } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [commentText, setCommentText] = useState('');
    const [formData, setFormData] = useState({
        studentId: '',
        reason: '',
        leaveType: 'Weekend',
        startDate: '',
        endDate: ''
    });

    const isInternalStaff = user?.role === 'school_admin' || user?.role === 'house_parent' || user?.role === 'hostel_warden' || user?.role === 'assistant_admin';
    const isAdmin = user?.role === 'school_admin' || user?.role === 'assistant_admin' || user?.role === 'super_admin';

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const res = await api.get('/boarding/leaves');
            setLeaves(res.data.data);
        } catch (error) {
            toast.error('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            await api.put(`/boarding/leave-approve/${id}`, { status, remarks: commentText });
            toast.success(`Leave request ${status.toLowerCase()}`);
            setCommentText('');
            setSelectedLeave(null);
            fetchLeaves();
        } catch (error) {
            toast.error('Failed to update request');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/boarding/leave-request', formData);
            toast.success('Leave request submitted');
            setIsModalOpen(false);
            fetchLeaves();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        }
    };

    const filteredLeaves = (leaves || []).filter(l => 
        ((l.studentId?.firstName || '') + ' ' + (l.studentId?.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Leave & Exit Management</h1>
                    <p className="text-gray-500">Track student movement, approvals, and exits.</p>
                </div>
                {(user?.role === 'student' || isInternalStaff) && (
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center space-x-2 bg-orange-600 text-white px-6 py-3 rounded-xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-200"
                    >
                        <Plus size={20} />
                        <span>{isInternalStaff ? 'Add Student Leave' : 'Request Leave'}</span>
                    </button>
                )}
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search by student name..." 
                            className="w-full pl-12 pr-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-100 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type & Period</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-400">Loading requests...</td></tr>
                            ) : filteredLeaves.length === 0 ? (
                                <tr><td colSpan="5" className="p-12 text-center text-gray-400">No leave requests found.</td></tr>
                            ) : (
                                filteredLeaves.map((leave) => (
                                    <tr key={leave._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-bold text-gray-800">{leave.studentId?.firstName} {leave.studentId?.lastName}</div>
                                            <div className="text-gray-400 text-xs">{leave.studentId?.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            <div className="font-medium text-gray-800">{leave.leaveType}</div>
                                            <div className="text-xs flex items-center gap-1 mt-1">
                                                <Calendar size={12} className="text-orange-400" />
                                                {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">{leave.reason}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide
                                                ${leave.status === 'Approved' ? 'bg-green-100 text-green-700' : 
                                                  leave.status === 'Rejected' ? 'bg-red-100 text-red-700' : 
                                                  leave.status === 'Pending' ? 'bg-gray-100 text-gray-600' : 
                                                  leave.status === 'Back from Leave' ? 'bg-indigo-100 text-indigo-700' :
                                                  'bg-blue-100 text-blue-700'}`}
                                            >
                                                {leave.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button 
                                                    onClick={() => setSelectedLeave(leave)}
                                                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Info size={18} />
                                                </button>
                                                {leave.status === 'Pending' && isAdmin && (
                                                    <>
                                                        <button 
                                                            onClick={() => handleApprove(leave._id, 'Approved')}
                                                            className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle size={18} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleApprove(leave._id, 'Rejected')}
                                                            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={18} />
                                                        </button>
                                                    </>
                                                )}
                                                {(leave.status === 'Out' || leave.status === 'Approved') && isInternalStaff && (
                                                    <button 
                                                        onClick={() => {
                                                            if(window.confirm('Confirm student has returned from leave?')) {
                                                                handleApprove(leave._id, 'Back from Leave');
                                                            }
                                                        }}
                                                        className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                        title="Confirm Return"
                                                    >
                                                        <LogIn size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal for Leave Details & Discussion */}
            <AnimatePresence>
                {selectedLeave && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedLeave(null)} />
                        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-xl p-8 z-50 overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">{selectedLeave.studentId?.firstName}'s Leave</h2>
                                    <p className="text-gray-500 text-sm">Case Details & Communication Log</p>
                                </div>
                                <button onClick={() => setSelectedLeave(null)}><XCircle className="text-gray-300" /></button>
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl">
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Type</p>
                                        <p className="font-semibold text-gray-700">{selectedLeave.leaveType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 uppercase">Period</p>
                                        <p className="font-semibold text-gray-700">{new Date(selectedLeave.startDate).toLocaleDateString()} - {new Date(selectedLeave.endDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase">Reason</p>
                                        <p className="text-gray-700">{selectedLeave.reason}</p>
                                    </div>
                                </div>

                                {selectedLeave.remarks && (
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs font-bold text-blue-400 uppercase mb-1">Admin Remarks</p>
                                        <p className="text-blue-700 text-sm">{selectedLeave.remarks}</p>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <MessageSquare size={16} />
                                        <span className="text-xs font-bold uppercase tracking-wider">Internal Discussion</span>
                                    </div>
                                    <div className="bg-gray-50 rounded-xl p-4 min-h-[100px] flex items-center justify-center text-gray-400 text-sm italic">
                                        No internal comments logged for this request yet.
                                    </div>
                                </div>

                                {isAdmin && selectedLeave.status === 'Pending' && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-500 uppercase">Add Decision Note / Comment</label>
                                        <textarea 
                                            rows="2"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-100 outline-none resize-none"
                                            placeholder="Add a remark for the houseparent or parent..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                        />
                                        <div className="flex gap-3">
                                            <button 
                                                onClick={() => handleApprove(selectedLeave._id, 'Approved')}
                                                className="flex-1 bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                onClick={() => handleApprove(selectedLeave._id, 'Rejected')}
                                                className="flex-1 bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal for Requesting Leave */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-50"
                        >
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Leave Request</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {isInternalStaff && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Student ID / User ID</label>
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Enter student unique ID..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Leave Type</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none"
                                        value={formData.leaveType}
                                        onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                                    >
                                        <option value="Weekend">Weekend</option>
                                        <option value="Mid-Term">Mid-Term</option>
                                        <option value="Emergency">Emergency</option>
                                        <option value="Medical">Medical</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Start Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none"
                                            value={formData.startDate}
                                            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">End Date</label>
                                        <input 
                                            type="date" 
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none"
                                            value={formData.endDate}
                                            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Reason</label>
                                    <textarea 
                                        required
                                        rows="3"
                                        placeholder="Brief explanation for leave request..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-orange-100 outline-none resize-none"
                                        value={formData.reason}
                                        onChange={(e) => setFormData({...formData, reason: e.target.value})}
                                    />
                                </div>
                                <div className="flex space-x-3 pt-6">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors">Cancel</button>
                                    <button type="submit" className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all font-bold shadow-lg shadow-orange-100">Submit Request</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LeaveManagement;
