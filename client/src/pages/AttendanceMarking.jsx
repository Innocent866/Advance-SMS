import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import { CheckCircle, Calendar, Save, Search, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AttendanceMarking = () => {
    usePageTitle('Mark Attendance');
    const { showNotification } = useNotification();
    const { user } = useAuth();

    // Filters
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [arms, setArms] = useState([]);
    const [selectedArm, setSelectedArm] = useState('');
    
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [session, setSession] = useState('2025/2026'); // TODO: Make dynamic
    const [term, setTerm] = useState('First Term');

    // Data
    const [loading, setLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            console.log('Fetching classes...');
            const res = await api.get('/academic/classes');
            console.log('Classes fetched:', res.data);
            setClasses(res.data);
            if (!res.data || res.data.length === 0) {
                 showNotification('No classes found for this school.', 'info');
            }
        } catch (error) {
            console.error('Error fetching classes:', error);
            showNotification('Failed to load classes. Please refresh.', 'error');
        }
    };

    const handleClassChange = (e) => {
        const classId = e.target.value;
        setSelectedClassId(classId);
        setSelectedArm('');
        const cls = classes.find(c => c._id === classId);
        setArms(cls ? cls.arms : []);
    };

    const handleLoadList = async () => {
        if (!selectedClassId || !selectedArm) {
            showNotification('Please select a class and arm', 'error');
            return;
        }

        setLoading(true);
        try {
            // 1. Fetch Students (Client-side filtering for now)
            const resStudents = await api.get('/students'); 
            const classStudents = resStudents.data.filter(s => 
                (s.classId === selectedClassId || s.classId?._id === selectedClassId) && 
                s.arm === selectedArm && 
                s.status === 'active'
            );
            setStudents(classStudents);

            // 2. Fetch Existing Attendance
            const resAttendance = await api.get(`/attendance?classId=${selectedClassId}&arm=${selectedArm}&date=${date}`);
            
            if (resAttendance.data && resAttendance.data.records && resAttendance.data.records.length > 0) {
                 setIsAlreadyMarked(true);
                 const map = {};
                 resAttendance.data.records.forEach(r => {
                     map[r.studentId._id || r.studentId] = r.status;
                 });
                 setAttendanceMap(map);
                 showNotification('Attendance already marked for this date (Update Mode).', 'info');
            } else {
                 setIsAlreadyMarked(false);
                 const map = {};
                 classStudents.forEach(s => map[s._id] = 'Present');
                 setAttendanceMap(map);
            }

        } catch (error) {
            console.error(error);
            showNotification('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceMap(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const markAll = (status) => {
        const newMap = {};
        students.forEach(s => newMap[s._id] = status);
        setAttendanceMap(newMap);
    };

    const handleSubmit = async () => {
        if (students.length === 0) return;

        setLoading(true);
        try {
            const records = students.map(s => ({
                studentId: s._id,
                status: attendanceMap[s._id] || 'Present',
                remark: ''
            }));

            await api.post('/attendance', {
                classId: selectedClassId,
                arm: selectedArm,
                date,
                session,
                term,
                records
            });

            showNotification('Attendance saved successfully', 'success');
            setIsAlreadyMarked(true);
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Error saving attendance', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>
                    <p className="text-gray-500 text-sm">Daily class attendance register.</p>
                </div>
                 <div className="flex gap-2">
                     <button 
                        onClick={() => markAll('Present')}
                        className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
                    >
                        Mark All Present
                     </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || students.length === 0}
                        className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        <Save size={20} />
                        <span>{loading ? 'Saving...' : 'Save Attendance'}</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select 
                        value={selectedClassId} onChange={handleClassChange}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Arm</label>
                     <select 
                        value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                    >
                        <option value="">Select Arm</option>
                        {arms.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
                    </select>
                </div>
                 <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                     <select 
                        value={term} onChange={(e) => setTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg outline-none"
                    >
                         <option>First Term</option>
                         <option>Second Term</option>
                         <option>Third Term</option>
                    </select>
                </div>
                <button 
                    onClick={handleLoadList}
                    disabled={loading}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <Search size={18} /> Load Class
                </button>
            </div>

            {/* Student List */}
            {students.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                         <h3 className="font-bold text-gray-700">Student List ({students.length})</h3>
                         {isAlreadyMarked && (
                             <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                 <CheckCircle size={14} /> Recorded
                             </span>
                         )}
                    </div>
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-200">
                             <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600">Student</th>
                                <th className="px-6 py-4 font-semibold text-gray-600 text-center">Status</th>
                             </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {students.map(student => (
                                <tr key={student._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold overflow-hidden">
                                                 {student.profilePicture ? (
                                                     <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                                                 ) : (
                                                     student.firstName[0]
                                                 )}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{student.firstName} {student.lastName}</div>
                                                <div className="text-xs text-gray-500">{student.studentId}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                       <div className="flex justify-center gap-4">
                                            {['Present', 'Absent', 'Late'].map(status => (
                                                <label key={status} className="flex items-center gap-2 cursor-pointer">
                                                    <input 
                                                        type="radio" 
                                                        name={`status-${student._id}`}
                                                        checked={attendanceMap[student._id] === status}
                                                        onChange={() => handleStatusChange(student._id, status)}
                                                        className="w-4 h-4 text-primary focus:ring-primary"
                                                    />
                                                    <span className={`text-sm font-medium ${
                                                        status === 'Present' ? 'text-green-700' : 
                                                        status === 'Absent' ? 'text-red-700' : 'text-orange-700'
                                                    }`}>
                                                        {status}
                                                    </span>
                                                </label>
                                            ))}
                                       </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                 !loading && (
                    <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Users className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-gray-500 font-medium">Select Class and Arm to load students</h3>
                    </div>
                )
            )}
        </div>
    );
};

export default AttendanceMarking;
