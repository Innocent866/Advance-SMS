import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, ChevronLeft } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ParentAttendance = () => {
    usePageTitle('Child Attendance');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await api.get('/parents/child-attendance');
                setRecords(res.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch attendance", error);
                setLoading(false);
            }
        };
        fetchAttendance();
    }, []);

    const getStatusStyles = (status) => {
        switch (status) {
            case 'Present':
                return { 
                    bg: 'bg-green-100', 
                    text: 'text-green-700', 
                    icon: <CheckCircle className="text-green-600" size={18} /> 
                };
            case 'Absent':
                return { 
                    bg: 'bg-red-100', 
                    text: 'text-red-700', 
                    icon: <XCircle className="text-red-600" size={18} /> 
                };
            case 'Late':
                return { 
                    bg: 'bg-amber-100', 
                    text: 'text-amber-700', 
                    icon: <Clock className="text-amber-600" size={18} /> 
                };
            default:
                return { 
                    bg: 'bg-gray-100', 
                    text: 'text-gray-700', 
                    icon: <AlertCircle className="text-gray-600" size={18} /> 
                };
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading attendance records...</div>;

    const stats = {
        present: records.filter(r => r.status === 'Present').length,
        absent: records.filter(r => r.status === 'Absent').length,
        late: records.filter(r => r.status === 'Late').length,
        total: records.length
    };

    const attendanceRate = stats.total > 0 
        ? Math.round(((stats.present + stats.late) / stats.total) * 100) 
        : 0;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <button 
                    onClick={() => window.history.back()}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ChevronLeft size={24} className="text-gray-600" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Child Attendance</h1>
                    <p className="text-gray-500">View daily attendance history and summaries for your child.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Attendance Rate</p>
                    <h3 className="text-3xl font-bold text-primary">{attendanceRate}%</h3>
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-3">
                        <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${attendanceRate}%` }}
                        ></div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Days Present</p>
                    <h3 className="text-3xl font-bold text-green-600">{stats.present}</h3>
                    <p className="text-xs text-gray-400 mt-1">Total academic days</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Days Absent</p>
                    <h3 className="text-3xl font-bold text-red-600">{stats.absent}</h3>
                    <p className="text-xs text-gray-400 mt-1">Requiring attention</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500 font-medium mb-1">Days Late</p>
                    <h3 className="text-3xl font-bold text-amber-600">{stats.late}</h3>
                    <p className="text-xs text-gray-400 mt-1">Punctuality log</p>
                </div>
            </div>

            {/* Attendance List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <Calendar size={18} className="text-gray-400" />
                        Daily Records
                    </h3>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Term/Session</th>
                                <th className="px-6 py-4">Marked By</th>
                                <th className="px-6 py-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.length > 0 ? records.map((record) => {
                                const styles = getStatusStyles(record.status);
                                return (
                                    <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            {new Date(record.date).toLocaleDateString('en-GB', { 
                                                weekday: 'short', 
                                                day: 'numeric', 
                                                month: 'short', 
                                                year: 'numeric' 
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles.bg} ${styles.text}`}>
                                                {styles.icon}
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {record.term} <br />
                                            <span className="text-xs opacity-75">{record.session}</span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {record.markedBy}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 italic">
                                            {record.remark || '-'}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                                        <Calendar size={48} className="mx-auto mb-4 opacity-10" />
                                        No attendance records found for your child.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ParentAttendance;
