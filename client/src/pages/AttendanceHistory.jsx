import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import { Calendar, Search, FileText, Download } from 'lucide-react';

const AttendanceHistory = () => {
    usePageTitle('Attendance Reports');
    const { showNotification } = useNotification();

    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [arms, setArms] = useState([]);
    const [selectedArm, setSelectedArm] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Data
    const [loading, setLoading] = useState(false);
    const [attendance, setAttendance] = useState(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const res = await api.get('/academic/classes');
            setClasses(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        setSelectedArm('');
        const cls = classes.find(c => c._id === classId);
        setArms(cls ? cls.arms : []); 
    };

    const handleSearch = async () => {
        if (!selectedClassId || !selectedArm) {
            showNotification('Please select a class and arm', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await api.get(`/attendance?classId=${selectedClassId}&arm=${selectedArm}&date=${date}`);
            setAttendance(res.data);
            if (!res.data || !res.data.records || res.data.records.length === 0) {
                 showNotification('No attendance record found for this date.', 'info');
            }
        } catch (error) {
            console.error(error);
            showNotification('Error fetching history', 'error');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = () => {
        if (!attendance?.records) return { present: 0, absent: 0, late: 0, total: 0 };
        const total = attendance.records.length;
        const present = attendance.records.filter(r => r.status === 'Present').length;
        const absent = attendance.records.filter(r => r.status === 'Absent').length;
        const late = attendance.records.filter(r => r.status === 'Late').length;
        return { present, absent, late, total };
    };

    const stats = calculateStats();

    return (
        <div className="max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Attendance History</h1>
                    <p className="text-gray-500 text-sm">View and export attendance records.</p>
                </div>
                <button className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                    <Download size={18} />
                    <span>Export Report</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-end">
                <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                     <div className="relative">
                        <Calendar size={18} className="absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg outline-none"
                        />
                     </div>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select 
                        value={selectedClassId} onChange={handleClassChange}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Arm</label>
                     <select 
                        value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                    >
                        <option value="">Select Arm</option>
                        {arms.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={handleSearch}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                    <Search size={18} /> View
                </button>
            </div>

            {/* Stats Cards */}
            {attendance && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <div className="text-blue-500 text-sm font-bold mb-1">Total Students</div>
                        <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                         <div className="text-green-500 text-sm font-bold mb-1">Present</div>
                         <div className="text-2xl font-bold text-green-700">{stats.present}</div>
                    </div>
                     <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                         <div className="text-red-500 text-sm font-bold mb-1">Absent</div>
                         <div className="text-2xl font-bold text-red-700">{stats.absent}</div>
                    </div>
                     <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                         <div className="text-orange-500 text-sm font-bold mb-1">Late</div>
                         <div className="text-2xl font-bold text-orange-700">{stats.late}</div>
                    </div>
                </div>
            )}

            {/* List */}
             {attendance?.records?.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex justify-between">
                             <h3 className="font-bold text-gray-700">Detailed Record</h3>
                             <span className="text-sm text-gray-500">Marked by: Admin/Teacher</span>
                        </div>
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                             <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Student</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Status</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendance.records.map((record, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">
                                        {record.studentId?.firstName} {record.studentId?.lastName}
                                        <div className="text-xs text-gray-400">{record.studentId?.studentId}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            record.status === 'Present' ? 'bg-green-100 text-green-700' : 
                                            record.status === 'Absent' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                        }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
             ) : (
                !loading && (
                    <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-gray-500 font-medium">Select a Class and Date to view history</h3>
                    </div>
                )
             )}

        </div>
    );
};

export default AttendanceHistory;
