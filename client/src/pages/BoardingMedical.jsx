import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Heart, 
    AlertTriangle, 
    Search, 
    Plus, 
    Pill, 
    User, 
    Phone, 
    ChevronUp, 
    ChevronDown,
    Calendar,
    CheckCircle,
    XCircle
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MedicalRecordCard = ({ record, isAdmin, isHouseParent, onApprove, onEdit, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [approving, setApproving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleAction = async (status) => {
        try {
            setApproving(true);
            await onApprove(record._id, status);
        } finally {
            setApproving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this medical record?')) return;
        try {
            setDeleting(true);
            await onDelete(record._id);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <motion.div 
            layout
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        >
            <div 
                className="p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center space-x-4">
                    <div className="bg-red-50 p-3 rounded-full text-red-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-800">{record.studentId?.firstName} {record.studentId?.lastName}</h4>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                record.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                record.status === 'UnApproved' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-600'
                            }`}>
                                {record.status || 'Pending'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500">{new Date(record.date).toLocaleDateString()} • {record.diagnosis || 'Observation'}</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        record.outcome === 'Returned to Class' ? 'bg-green-100 text-green-700' :
                        record.outcome === 'Sent Home' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                        {record.outcome}
                    </span>
                    {isExpanded ? <ChevronUp className="text-gray-400" /> : <ChevronDown className="text-gray-400" />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-6 pb-6 border-t border-gray-50 pt-4 bg-gray-50/30"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Clinical Details</h5>
                                <p className="text-sm text-gray-700"><span className="font-medium">Symptoms:</span> {record.symptoms}</p>
                                <p className="text-sm text-gray-700"><span className="font-medium">Treatment:</span> {record.treatment}</p>
                                {record.medications?.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                            <Pill size={14} /> Medication:
                                        </p>
                                        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                                            {record.medications?.map((m, i) => (
                                                <li key={i}>{m.name} - {m.dosage} ({m.frequency})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3">
                                <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Student Info</h5>
                                <p className="text-sm text-gray-700 flex items-center gap-2">
                                    <User size={14} className="text-gray-400" /> 
                                    {record.studentId?.firstName} {record.studentId?.lastName} ({record.studentId?.studentId})
                                </p>
                                {record.emergencyContact && (
                                    <p className="text-sm text-gray-700 flex items-center gap-2">
                                        <Phone size={14} className="text-gray-400" />
                                        {record.emergencyContact.name}: {record.emergencyContact.phone}
                                    </p>
                                )}
                                <div className="pt-4 flex flex-wrap gap-3">
                                    {isHouseParent && (
                                        <button 
                                            onClick={() => onEdit(record)}
                                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-black transition-all"
                                        >
                                            Edit Record
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <>
                                            {(!record.status || record.status !== 'Approved') && (
                                                <button 
                                                    disabled={approving}
                                                    onClick={() => handleAction('Approved')}
                                                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-all disabled:opacity-50"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                            {record.status !== 'UnApproved' && (
                                                <button 
                                                    disabled={approving}
                                                    onClick={() => handleAction('UnApproved')}
                                                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-all disabled:opacity-50"
                                                >
                                                    UnApprove
                                                </button>
                                            )}
                                        </>
                                    )}
                                    <button 
                                        disabled={deleting}
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-gray-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-50 transition-all disabled:opacity-50 flex items-center gap-1"
                                    >
                                        {deleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">Attended by: {record.attendedBy?.firstName} {record.attendedBy?.lastName}</p>
                                {record.approvedBy && (
                                    <p className="text-xs text-blue-500 font-medium">Approved by: {record.approvedBy?.firstName} {record.approvedBy?.lastName}</p>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const BoardingMedical = () => {
    usePageTitle('Medical Records');
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
        symptoms: '',
        diagnosis: '',
        treatment: '',
        outcome: 'Returned to Class',
        remarks: ''
    });

    const [boarders, setBoarders] = useState([]);
    const [submitting, setSubmitting] = useState(false);

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
            const res = await api.get('/boarding/medical');
            setRecords(res.data.data || []);
        } catch (error) {
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleApprove = async (id, status) => {
        try {
            await api.put(`/boarding/medical/${id}/approve`, { status });
            toast.success(`Record ${status.toLowerCase()}`);
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        setFormData({
            studentId: record.studentId?._id || '',
            symptoms: record.symptoms || '',
            diagnosis: record.diagnosis || '',
            treatment: record.treatment || '',
            outcome: record.outcome || 'Returned to Class',
            remarks: record.remarks || ''
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/boarding/medical/${id}`);
            toast.success('Record deleted');
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete record');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.studentId) return toast.error('Please select a student');

        try {
            setSubmitting(true);
            if (editingRecord) {
                await api.put(`/boarding/medical/${editingRecord._id}`, formData);
                toast.success('Medical record updated');
            } else {
                await api.post('/boarding/medical', formData);
                toast.success('Medical visit recorded successfully');
            }
            setIsModalOpen(false);
            setEditingRecord(null);
            setFormData({
                studentId: '',
                symptoms: '',
                diagnosis: '',
                treatment: '',
                outcome: 'Returned to Class',
                remarks: ''
            });
            fetchRecords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Operation failed');
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRecords = records.filter(r => 
        (r.studentId?.firstName + ' ' + r.studentId?.lastName).toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.studentId?.studentId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Health & Medical Records</h1>
                    <p className="text-gray-500">Monitor and track health visits for all boarding students.</p>
                </div>
                {!isAdmin && (
                    <button 
                        onClick={() => {
                            setEditingRecord(null);
                            setFormData({
                                studentId: '',
                                symptoms: '',
                                diagnosis: '',
                                treatment: '',
                                outcome: 'Returned to Class',
                                remarks: ''
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-200"
                    >
                        <Plus size={20} />
                        <span>New Clinic Visit</span>
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-red-50 p-4 rounded-xl text-red-500">
                        <Heart size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Visits</p>
                        <h3 className="text-2xl font-bold text-gray-800">{records.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-orange-50 p-4 rounded-xl text-orange-500">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Pending Approval</p>
                        <h3 className="text-2xl font-bold text-gray-800">{records.filter(r => r.status === 'Pending').length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
                    <div className="bg-blue-50 p-4 rounded-xl text-blue-500">
                        <Activity size={32} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Health Status</p>
                        <h3 className="text-2xl font-bold text-gray-800 text-green-600">Stable</h3>
                    </div>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="Search by student name or admission number..." 
                    className="w-full pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-2 focus:ring-red-100 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-gray-400">Loading records...</div>
                ) : filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-20 text-center">
                        <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Activity size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">No medical records yet</h3>
                        <p className="text-gray-500 mt-2">Clinic visits will appear here once recorded.</p>
                    </div>
                ) : (
                    filteredRecords.map(record => (
                        <MedicalRecordCard 
                            key={record._id} 
                            record={record} 
                            isAdmin={isAdmin}
                            isHouseParent={isHouseParent}
                            onApprove={handleApprove}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))
                )}
            </div>

            {/* NEW CLINIC VISIT MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
                                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    <Heart className="text-red-500" />
                                    {editingRecord ? 'Edit Medical Record' : 'Record New Clinic Visit'}
                                </h2>
                                <button 
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setEditingRecord(null);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Activity size={20} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Select Student</label>
                                    <select
                                        name="studentId"
                                        required
                                        disabled={!!editingRecord}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none disabled:opacity-60"
                                        value={formData.studentId}
                                        onChange={handleInputChange}
                                    >
                                        <option value="">Search or select boarder...</option>
                                        {boarders.map(b => (
                                            <option key={b._id} value={b._id}>
                                                {b.firstName} {b.lastName} ({b.studentId})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Symptoms</label>
                                        <textarea
                                            name="symptoms"
                                            required
                                            rows="3"
                                            placeholder="Description of symptoms..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none resize-none"
                                            value={formData.symptoms}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Diagnosis</label>
                                        <textarea
                                            name="diagnosis"
                                            required
                                            rows="3"
                                            placeholder="Professional diagnosis..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none resize-none"
                                            value={formData.diagnosis}
                                            onChange={handleInputChange}
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Treatment & Medication</label>
                                    <textarea
                                        name="treatment"
                                        required
                                        rows="3"
                                        placeholder="Details of treatment and drugs administered..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none resize-none"
                                        value={formData.treatment}
                                        onChange={handleInputChange}
                                    ></textarea>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Visit Outcome</label>
                                        <select
                                            name="outcome"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none"
                                            value={formData.outcome}
                                            onChange={handleInputChange}
                                        >
                                            <option value="Returned to Class">Returned to Class</option>
                                            <option value="Sent Home">Sent Home</option>
                                            <option value="Hostel Rest">Hostel Rest</option>
                                            <option value="Hospital Referral">Hospital Referral</option>
                                            <option value="Observation">Observation</option>
                                        </select>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Additional Remarks</label>
                                        <input
                                            type="text"
                                            name="remarks"
                                            placeholder="Optional comments..."
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-red-100 outline-none"
                                            value={formData.remarks}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsModalOpen(false);
                                            setEditingRecord(null);
                                        }}
                                        className="px-6 py-2.5 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex items-center space-x-2 bg-red-600 text-white px-8 py-2.5 rounded-xl hover:bg-red-700 transition-all font-bold shadow-lg shadow-red-100 disabled:opacity-50"
                                    >
                                        <Activity size={20} className={submitting ? 'animate-spin' : ''} />
                                        <span>{submitting ? (editingRecord ? 'Updating...' : 'Recording...') : (editingRecord ? 'Update Record' : 'Record Visit')}</span>
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

export default BoardingMedical;
