import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Search, Building, Save, ChevronDown, Filter } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const HostelAttendance = () => {
    usePageTitle('Hostel Attendance');
    const [hostels, setHostels] = useState([]);
    const [selectedHostel, setSelectedHostel] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceType, setAttendanceType] = useState('Night Roll Call');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [records, setRecords] = useState({}); // { studentId: status }

    useEffect(() => {
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            const res = await api.get('/hostels');
            setHostels(res.data.data);
            if (res.data.data.length > 0) {
                setSelectedHostel(res.data.data[0]._id);
                fetchStudents(res.data.data[0]._id);
            }
        } catch (error) {
            toast.error('Failed to load hostels');
        }
    };

    const fetchStudents = async (hostelId) => {
        try {
            setLoading(true);
            const res = await api.get(`/hostels/${hostelId}/students`);
            setStudents(res.data.data);
            // Initialize records with 'Present'
            const initialRecords = {};
            res.data.data.forEach(s => {
                initialRecords[s._id] = 'Present';
            });
            setRecords(initialRecords);
        } catch (error) {
            toast.error('Failed to load students');
        } finally {
            setLoading(false);
        }
    };

    const handleHostelChange = (e) => {
        const id = e.target.value;
        setSelectedHostel(id);
        fetchStudents(id);
    };

    const updateStatus = (studentId, status) => {
        setRecords(prev => ({ ...prev, [studentId]: status }));
    };

    const handleSubmit = async () => {
        const formattedRecords = Object.entries(records).map(([studentId, status]) => ({
            studentId,
            status
        }));

        try {
            await api.post('/boarding/attendance', {
                hostelId: selectedHostel,
                date,
                type: attendanceType,
                records: formattedRecords
            });
            toast.success('Attendance saved successfully');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save attendance');
        }
    };

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Hostel Roll Call</h1>
                    <p className="text-gray-500">Mark daily attendance for boarding students.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || students.length === 0}
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-2.5 rounded-xl hover:bg-primary/90 transition-all font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Save size={20} />
                        <span>Save Attendance</span>
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Hostel</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                            value={selectedHostel}
                            onChange={handleHostelChange}
                        >
                             {hostels?.map(h => (
                                 <option key={h._id} value={h._id}>{h.name}</option>
                             ))}
                        </select>
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Attendance Type</label>
                    <div className="relative">
                        <select 
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                            value={attendanceType}
                            onChange={(e) => setAttendanceType(e.target.value)}
                        >
                            <option value="Night Roll Call">Night Roll Call</option>
                            <option value="Morning Check">Morning Check</option>
                            <option value="Weekend">Weekend</option>
                        </select>
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <label className="block text-sm font-bold text-gray-400 uppercase tracking-wider text-[10px]">Date</label>
                    <input 
                        type="date" 
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Room / Bed</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="3" className="p-12 text-center text-gray-400">Loading student list...</td></tr>
                            ) : students.length === 0 ? (
                                <tr><td colSpan="3" className="p-12 text-center text-gray-400">No students assigned to this hostel.</td></tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-800">{student.firstName} {student.lastName}</div>
                                            <div className="text-gray-400 text-xs">{student.studentId}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700">Room {student.roomId?.roomNumber || 'N/A'}</div>
                                            <div className="text-xs text-gray-400">Bed: {student.bedNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                {[
                                                    { label: 'Present', color: 'text-green-600', bg: 'bg-green-50', activeBg: 'bg-green-600', icon: CheckCircle },
                                                    { label: 'Absent', color: 'text-red-600', bg: 'bg-red-50', activeBg: 'bg-red-600', icon: XCircle },
                                                    { label: 'Late', color: 'text-orange-600', bg: 'bg-orange-50', activeBg: 'bg-orange-600', icon: Clock },
                                                    { label: 'On Leave', color: 'text-blue-600', bg: 'bg-blue-50', activeBg: 'bg-blue-600', icon: Filter }
                                                ].map((status) => (
                                                    <button 
                                                        key={status.label}
                                                        onClick={() => updateStatus(student._id, status.label)}
                                                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all border ${
                                                            records[student._id] === status.label 
                                                                ? `${status.activeBg} text-white border-transparent shadow-md scale-105` 
                                                                : `${status.bg} ${status.color} border-transparent hover:border-current`
                                                        }`}
                                                    >
                                                        <status.icon size={20} />
                                                        <span className="text-[10px] font-bold mt-1 uppercase leading-none">{status.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HostelAttendance;
