import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Search, Plus, AlertCircle, FileText, User, Calendar, MoreVertical, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const DisciplineManagement = () => {
    usePageTitle('Discipline Management');
    const { user } = useAuth();
    const isAdmin = ['school_admin', 'assistant_admin', 'super_admin'].includes(user?.role);
    const isHouseParent = user?.role === 'house_parent';

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);

    const [formData, setFormData] = useState({
        studentId: '',
        incidentType: 'Misconduct',
        description: '',
        actionTaken: '',
        incidentDate: new Date().toISOString().split('T')[0],
        severity: 'Low'
    });

    const [boarders, setBoarders] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [approving, setApproving] = useState(null); // track which record is being approved

    useEffect(() => {
        fetchRecords();
        fetchBoarders();
    }, []);

    const fetchBoarders = async () => {
        try {
            const res = await api.get('/students');
            const allStudents = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setBoarders(allStudents.filter(s => s.isBoarder));
        } catch (error) {
            console.error('Failed to fetch boarders', error);
        }
    };

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await api.get('/boarding/discipline');
            setRecords(res.data.data || []);
        } catch (error) {
            toast.error('Failed to fetch records');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id, status) => {
        try {
            setApproving(id);
            await api.put(`/boarding/discipline/${id}/approve`, { status });
            toast.success(`Incident ${status === 'Approved' ? 'approved' : 'unapproved'}`);
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setApproving(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this discipline record?')) return;
        try {
            await api.delete(`/boarding/discipline/${id}`);
            toast.success('Record deleted');
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete record');
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            studentId: record.studentId?._id || '',
            incidentType: record.incidentType || 'Misconduct',
            description: record.description || '',
            actionTaken: record.actionTaken || '',
            incidentDate: record.incidentDate ? new Date(record.incidentDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            severity: record.severity || 'Low'
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId) return toast.error('Please select a student');

        try {
            setSubmitting(true);
            if (editingRecord) {
                await api.put(`/boarding/discipline/${editingRecord._id}`, formData);
                toast.success('Incident record updated');
            } else {
                await api.post('/boarding/discipline', formData);
                toast.success('Incident recorded');
            }
            setIsModalOpen(false);
            setEditingRecord(null);
            setFormData({
                studentId: '',
                incidentType: 'Misconduct',
                description: '',
                actionTaken: '',
                incidentDate: new Date().toISOString().split('T')[0],
                severity: 'Low'
            });
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRecords = (records || []).filter(r => 
        ((r.studentId?.firstName || '') + ' ' + (r.studentId?.lastName || '')).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Hostel Discipline Logs</h1>
                    <p className="text-gray-500">Track and manage disciplinary incidents within hostels.</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={() => {
                            setEditingRecord(null);
                            setFormData({
                                studentId: '',
                                incidentType: 'Misconduct',
                                description: '',
                                actionTaken: '',
                                incidentDate: new Date().toISOString().split('T')[0],
                                severity: 'Low'
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-200"
                    >
                        <Plus size={20} />
                        <span>Log Incident</span>
                    </button>
                )}
            </header>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Filter by student name..." 
                            className="w-full pl-12 pr-4 py-2 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                           <Clock size={16} className="text-orange-500" />
                           <span className="text-sm font-bold text-gray-600">Pending: {records.filter(r => r.status === 'Pending').length}</span>
                        </div>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading records...</div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">No disciplinary records found.</div>
                    ) : (
                        filteredRecords.map((record) => (
                            <div key={record._id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-3 rounded-xl ${
                                            record.severity === 'High' ? 'bg-red-50 text-red-600' :
                                            record.severity === 'Medium' ? 'bg-orange-50 text-orange-600' :
                                            'bg-blue-50 text-blue-600'
                                        }`}>
                                            <ShieldAlert size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-bold text-gray-800 text-lg">{record.studentId?.firstName} {record.studentId?.lastName}</h3>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                    record.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    record.status === 'UnApproved' ? 'bg-red-100 text-red-700' :
                                                    'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {record.status || 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                                                    <Calendar size={12} /> {new Date(record.incidentDate).toLocaleDateString()}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                                    record.severity === 'High' ? 'border-red-200 text-red-600 bg-red-50' :
                                                    record.severity === 'Medium' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                                                    'border-blue-200 text-blue-600 bg-blue-50'
                                                }`}>
                                                    {record.severity} Severity
                                                </span>
                                            </div>
                                            <div className="mt-4 space-y-2">
                                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{record.description}"</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <CheckCircle size={14} className="text-green-500" />
                                                    <span className="font-medium">Action:</span> {record.actionTaken}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 shrink-0">
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-gray-400">Reported by: {record.reportedBy?.firstName || 'Staff'}</span>
                                            {record.approvedBy && (
                                                <span className="text-xs text-blue-500 font-medium">Approved by: {record.approvedBy?.firstName}</span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                {isHouseParent && (
                                                    <button 
                                                        onClick={() => handleEdit(record)}
                                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
                                                    >
                                                        Edit
                                                    </button>
                                                )}
                                                
                                                <div className="flex items-center space-x-2">
                                                    {isAdmin && (
                                                        <>
                                                            {record.status !== 'Approved' && (
                                                                <button 
                                                                    onClick={() => handleApprove(record._id, 'Approved')}
                                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                                    title="Approve"
                                                                >
                                                                    <CheckCircle size={18} />
                                                                </button>
                                                            )}
                                                            {record.status !== 'UnApproved' && (
                                                                <button 
                                                                    onClick={() => handleApprove(record._id, 'UnApproved')}
                                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                                    title="UnApprove"
                                                                >
                                                                    <XCircle size={18} />
                                                                </button>
                                                            )}
                                                        </>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDelete(record._id)}
                                                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                         <motion.div 
                             initial={{ opacity: 0, scale: 0.95 }}
                             animate={{ opacity: 1, scale: 1 }}
                             exit={{ opacity: 0, scale: 0.95 }}
                             className="bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 overflow-hidden"
                         >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
                                <h2 className="text-xl font-bold text-gray-800">
                                    {editingRecord ? 'Edit Incident Record' : 'Log New Incident'}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                                >
                                    <XCircle size={20} />
                                </button>
                            </div>

                             <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                 <div className="space-y-2">
                                     <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider text-[10px]">Select Student</label>
                                     <select
                                         name="studentId"
                                         required
                                         disabled={!!editingRecord}
                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none disabled:opacity-60"
                                         value={formData.studentId}
                                         onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                                     >
                                         <option value="">Search or select boarder...</option>
                                         {boarders.map(b => (
                                             <option key={b._id} value={b._id}>
                                                 {b.firstName} {b.lastName} ({b.studentId})
                                             </option>
                                         ))}
                                     </select>
                                 </div>

                                 <div className="grid grid-cols-2 gap-4">
                                     <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Severity</label>
                                         <select 
                                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none"
                                             value={formData.severity}
                                             onChange={(e) => setFormData({...formData, severity: e.target.value})}
                                         >
                                             <option value="Low">Low</option>
                                             <option value="Medium">Medium</option>
                                             <option value="High">High</option>
                                         </select>
                                     </div>
                                     <div>
                                         <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Incident Date</label>
                                         <input 
                                             type="date" 
                                             required
                                             className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none"
                                             value={formData.incidentDate}
                                             onChange={(e) => setFormData({...formData, incidentDate: e.target.value})}
                                         />
                                     </div>
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Incident Type</label>
                                     <input 
                                         type="text" 
                                         required
                                         placeholder="e.g. Curfew Breach, Fighting, Vandalism"
                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none"
                                         value={formData.incidentType}
                                         onChange={(e) => setFormData({...formData, incidentType: e.target.value})}
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Description</label>
                                     <textarea 
                                         required
                                         rows="3"
                                         placeholder="Details of the incident..."
                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none resize-none"
                                         value={formData.description}
                                         onChange={(e) => setFormData({...formData, description: e.target.value})}
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wider text-[10px]">Action Taken</label>
                                     <input 
                                         type="text" 
                                         required
                                         placeholder="e.g. Warning letter, Parent suspension, Cleaning duty"
                                         className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-100 outline-none"
                                         value={formData.actionTaken}
                                         onChange={(e) => setFormData({...formData, actionTaken: e.target.value})}
                                     />
                                 </div>
                                 <div className="flex space-x-3 pt-6 border-t border-gray-50">
                                     <button 
                                         type="button" 
                                         onClick={() => {
                                             setIsModalOpen(false);
                                             setEditingRecord(null);
                                         }}
                                         className="flex-1 px-4 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                                     >
                                         Cancel
                                     </button>
                                     <button 
                                         type="submit" 
                                         disabled={submitting}
                                         className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all font-bold shadow-lg shadow-gray-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                     >
                                         {submitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                         <span>{submitting ? (editingRecord ? 'Updating...' : 'Saving...') : (editingRecord ? 'Update Record' : 'Save Record')}</span>
                                     </button>
                                 </div>
                             </form>
                         </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DisciplineManagement;
