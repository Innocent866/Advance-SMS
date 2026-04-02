import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    CheckCircle, 
    Calendar, 
    Save, 
    Search, 
    Users, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    X, 
    ChevronRight, 
    ArrowRight,
    Target,
    Activity,
    Cpu,
    Database,
    Binary,
    Terminal,
    GraduationCap,
    Send,
    Shield
} from 'lucide-react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

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
    const [session, setSession] = useState(''); 
    const [term, setTerm] = useState('First Term');
    const [sessions, setSessions] = useState([]);

    // Data
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [students, setStudents] = useState([]);
    const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
    const [isAlreadyMarked, setIsAlreadyMarked] = useState(false);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            setLoading(true);
            const [resSessions, resClasses] = await Promise.all([
                api.get('/academic/sessions'),
                api.get('/academic/classes')
            ]);
            
            setSessions(resSessions.data);
            setClasses(resClasses.data);

            const activeSession = resSessions.data.find(s => s.isActive);
            if (activeSession) {
                setSession(activeSession.name);
                setTerm(activeSession.currentTerm || 'First Term');
            } else if (resSessions.data.length > 0) {
                 setSession(resSessions.data[0].name);
            }
            setLoading(false);
        } catch (error) {
            console.error('Metadata sync failure:', error);
            showNotification('Failed to load classes and sessions', 'error');
            setLoading(false);
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
            showNotification('Please select Class and Arm', 'error');
            return;
        }

        setLoading(true);
        try {
            const resStudents = await api.get('/students'); 
            const classStudents = resStudents.data.filter(s => 
                (s.classId === selectedClassId || s.classId?._id === selectedClassId) && 
                s.arm === selectedArm && 
                s.status === 'active'
            );
            setStudents(classStudents);

            const resAttendance = await api.get(`/attendance?classId=${selectedClassId}&arm=${selectedArm}&date=${date}`);
            
            if (resAttendance.data && resAttendance.data.records && resAttendance.data.records.length > 0) {
                 setIsAlreadyMarked(true);
                 const map = {};
                 resAttendance.data.records.forEach(r => {
                     map[r.studentId._id || r.studentId] = r.status;
                 });
                 setAttendanceMap(map);
                  showNotification('Attendance records retrieved.', 'info');
            } else {
                 setIsAlreadyMarked(false);
                 const map = {};
                 classStudents.forEach(s => map[s._id] = 'Present');
                 setAttendanceMap(map);
            }
        } catch (error) {
            console.error('Record load failure:', error);
            showNotification('Error loading attendance data', 'error');
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
        showNotification(`All students marked as ${status}`, 'success');
    };

    const handleSubmit = async () => {
        if (students.length === 0) return;

        setSubmitting(true);
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
            console.error('Persistence failure:', error);
            showNotification(error.response?.data?.message || 'Failed to save attendance', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const stats = {
        present: Object.values(attendanceMap).filter(s => s === 'Present').length,
        absent: Object.values(attendanceMap).filter(s => s === 'Absent').length,
        late: Object.values(attendanceMap).filter(s => s === 'Late').length,
        total: students.length
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto pb-32 px-4"
        >
            {/* Neural Attendance Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Target size={14} className="text-primary" /> Attendance
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Mark <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400 italic">Attendance</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Record daily student attendance and track participation.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto">
                        {[
                            { label: 'Present', value: stats.present, color: 'emerald', icon: CheckCircle2 },
                            { label: 'Absent', value: stats.absent, color: 'rose', icon: X },
                            { label: 'Late', value: stats.late, color: 'amber', icon: Clock },
                            { label: 'Total Students', value: stats.total, color: 'primary', icon: Users }
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center group hover:bg-white/10 transition-all cursor-default min-w-[140px]">
                                <stat.icon size={22} className={`text-${stat.color === 'primary' ? 'primary' : stat.color}-400 mx-auto mb-3 group-hover:scale-110 transition-transform`} />
                                <p className={`text-2xl font-black ${stat.color === 'emerald' ? 'text-emerald-400' : stat.color === 'rose' ? 'text-rose-400' : stat.color === 'amber' ? 'text-amber-400' : 'text-white'}`}>{stat.value}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Precision Selection Hub */}
            <div className="bg-white p-6 rounded-[3rem] border border-slate-50 shadow-3xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <input 
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none shadow-sm"
                            />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Class</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={selectedClassId} onChange={handleClassChange}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Arm</label>
                        <div className="relative">
                            <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">Select Arm</option>
                                {arms.map((a, i) => <option key={i} value={a.name}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Term</label>
                        <div className="relative">
                            <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={term} onChange={(e) => setTerm(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm"
                            >
                                <option>First Term</option>
                                <option>Second Term</option>
                                <option>Third Term</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end h-full items-end pb-1">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLoadList}
                            disabled={loading}
                            className="w-full py-5 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-3xl shadow-slate-900/40 hover:bg-black transition-all flex items-center justify-center gap-4"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                            Load List
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Attendance Register Matrix */}
            <AnimatePresence mode="wait">
                {students.length > 0 ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden relative"
                    >
                        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
                             <div className="flex items-center gap-6">
                                <h3 className="font-black text-slate-900 tracking-tight text-xl">Student List ({students.length} Students)</h3>
                                {isAlreadyMarked && (
                                    <span className="bg-emerald-500/10 text-emerald-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-100 flex items-center gap-2">
                                        <CheckCircle2 size={14} /> Marked
                                    </span>
                                )}
                             </div>
                             <div className="flex gap-4">
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => markAll('Present')}
                                    className="px-6 py-3 bg-white border-2 border-emerald-100 text-emerald-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-50 transition-all flex items-center gap-3 shadow-sm"
                                >
                                    Mark All Present
                                </motion.button>
                                <motion.button 
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => markAll('Absent')}
                                    className="px-6 py-3 bg-white border-2 border-rose-100 text-rose-600 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-rose-50 transition-all flex items-center gap-3 shadow-sm"
                                >
                                    Mark All Absent
                                </motion.button>
                             </div>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/30">
                                     <tr>
                                        <th className="px-12 py-6 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">Student Name</th>
                                        <th className="px-12 py-6 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 text-center">Status</th>
                                     </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {students.map((student, idx) => (
                                        <motion.tr 
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03 }}
                                            key={student._id} 
                                            className="hover:bg-slate-50/50 group transition-colors"
                                        >
                                            <td className="px-12 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden">
                                                         {student.profilePicture ? (
                                                             <img src={student.profilePicture} alt="" className="w-full h-full object-cover" />
                                                         ) : (
                                                             <Users size={24} className="relative z-10" />
                                                         )}
                                                         <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full blur-lg" />
                                                    </div>
                                                    <div>
                                                        <div className="font-black text-slate-900 text-lg tracking-tight">{student.firstName} {student.lastName}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{student.studentId}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-12 py-6">
                                               <div className="flex justify-center gap-3">
                                                    {[
                                                        { id: 'Present', color: 'emerald', icon: CheckCircle2 },
                                                        { id: 'Absent', color: 'rose', icon: X },
                                                        { id: 'Late', color: 'amber', icon: Clock }
                                                    ].map((status) => (
                                                        <motion.button
                                                            key={status.id}
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleStatusChange(student._id, status.id)}
                                                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 border ${
                                                                attendanceMap[student._id] === status.id
                                                                    ? `bg-${status.color === 'emerald' ? 'emerald' : status.color === 'rose' ? 'rose' : 'amber'}-500 text-white border-transparent shadow-xl shadow-${status.color === 'emerald' ? 'emerald' : status.color === 'rose' ? 'rose' : 'amber'}-500/20`
                                                                    : `bg-slate-50 text-slate-400 border-slate-100 hover:bg-${status.color === 'emerald' ? 'emerald' : status.color === 'rose' ? 'rose' : 'amber'}-50/50 hover:text-${status.color === 'emerald' ? 'emerald' : status.color === 'rose' ? 'rose' : 'amber'}-500`
                                                            }`}
                                                        >
                                                            <status.icon size={14} />
                                                            {status.id}
                                                        </motion.button>
                                                    ))}
                                               </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40"
                    >
                        <Terminal className="mx-auto text-slate-100 mb-8" size={80} />
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Students</h3>
                        <p className="text-slate-400 mt-4 text-xl font-medium max-w-lg mx-auto italic">
                            Select a Class and Arm to load students.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Persistence Decision Console */}
            <AnimatePresence>
                {students.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-12 py-6 bg-slate-950/90 backdrop-blur-2xl rounded-[3rem] shadow-4xl border border-white/5 flex items-center gap-12"
                    >
                        <div className="flex items-center gap-6 pr-12 border-r border-white/10">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Summary</p>
                                <p className="text-xl font-black text-white leading-none">{students.length} Records</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col">
                                    <span className="text-emerald-400 text-xs font-black tabular-nums">{stats.present} P</span>
                                    <span className="text-rose-400 text-xs font-black tabular-nums">{stats.absent} A</span>
                                </div>
                            </div>
                        </div>
                        
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="bg-primary text-white px-12 py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-3xl shadow-primary/40 hover:bg-primary/90 transition-all flex items-center gap-4 disabled:opacity-50"
                        >
                            {submitting ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                            {submitting ? 'Saving...' : 'Save Attendance'}
                        </motion.button>
                        
                        <button 
                            onClick={() => setStudents([])}
                            className="p-3 bg-white/5 text-slate-400 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AttendanceMarking;
