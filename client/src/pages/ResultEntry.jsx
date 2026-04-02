import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, 
    Search, 
    Calculator, 
    ChevronRight, 
    AlertCircle, 
    CheckCircle2, 
    User, 
    BookOpen, 
    Layers, 
    Calendar, 
    Filter,
    ArrowRight,
    Zap,
    Target,
    Activity,
    Cpu,
    Database,
    Binary,
    Terminal,
    GraduationCap,
    Clock,
    Send,
    X
} from 'lucide-react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const ResultEntry = () => {
    usePageTitle('Result Entry');
    const { showNotification } = useNotification();
    const { user } = useAuth();
    
    // Selection State
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedArm, setSelectedArm] = useState('');
    const [availableArms, setAvailableArms] = useState([]);
    const [session, setSession] = useState('');
    const [term, setTerm] = useState('First Term');
    const [sessions, setSessions] = useState([]);
    
    // Teacher specific restrictions
    const [teacherAssignments, setTeacherAssignments] = useState(null); 
    
    // Data State
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [config, setConfig] = useState(null);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState({}); // { studentId: { CA1: 10, Exam: 50 } }

    useEffect(() => {
        if (user) {
            fetchMetadata();
        }
    }, [user]);

    const fetchMetadata = async () => {
        try {
            setLoading(true);
            const [resSessions, resClasses, resSubjects] = await Promise.all([
                api.get('/academic/sessions'),
                api.get('/academic/classes'), 
                api.get('/academic/subjects')
            ]);
            
            setSessions(resSessions.data);

            const activeSession = resSessions.data.find(s => s.isActive);
            if (activeSession) {
                setSession(activeSession.name);
                setTerm(activeSession.currentTerm || 'First Term');
            } else if (resSessions.data.length > 0) {
                 setSession(resSessions.data[0].name);
            }

            let availableClasses = resClasses.data;
            let availableSubjects = resSubjects.data;

            if (user.role === 'teacher') {
                const resProfile = await api.get('/teachers/me');
                const teacher = resProfile.data;
                const assignments = teacher.teachingAssignments || [];
                
                const allowedClassIds = new Set();
                const allowedSubjectIds = new Set();
                const armMap = new Map();

                assignments.forEach(a => {
                    if (a.classId) {
                        const cId = (a.classId._id || a.classId).toString();
                        allowedClassIds.add(cId);

                        if (a.arm) {
                             const existing = armMap.get(cId) || new Set();
                             existing.add(a.arm);
                             armMap.set(cId, existing);
                        }
                    }
                    if (a.subjectId) {
                        const sId = (a.subjectId._id || a.subjectId).toString();
                        allowedSubjectIds.add(sId);
                    }
                });
                
                if (teacher.classes && teacher.classes.length > 0) {
                    teacher.classes.forEach(c => {
                        const cId = (c._id || c).toString();
                        allowedClassIds.add(cId);
                    });
                }

                availableClasses = availableClasses.filter(c => allowedClassIds.has(c._id.toString()));
                availableSubjects = availableSubjects.filter(s => allowedSubjectIds.has(s._id.toString()));
                
                setTeacherAssignments({ armMap });
            }

            setClasses(availableClasses);
            setSubjects(availableSubjects);
            setLoading(false);
        } catch (error) {
            console.error('Failed to sync metadata:', error);
            showNotification('Failed to load classes and subjects', 'error');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!selectedClassId) {
            setAvailableArms([]);
            setSelectedArm('');
            return;
        }

        const cls = classes.find(c => c._id === selectedClassId);
        if (!cls) return;

        let arms = cls.arms || [];

        if (teacherAssignments && teacherAssignments.armMap) {
            const allowedArms = teacherAssignments.armMap.get(selectedClassId);
            if (allowedArms && allowedArms.size > 0) {
                 arms = arms.filter(a => allowedArms.has(a.name));
            }
        }

        setAvailableArms(arms);
        setSelectedArm(''); 
    }, [selectedClassId, classes, teacherAssignments]);

    const handleLoadSheet = async () => {
        if (!selectedClassId || !selectedSubjectId) {
            showNotification('Please select a Class and Subject', 'error');
            return;
        }
        
        if (availableArms.length > 0 && !selectedArm) {
             showNotification('Please select an Arm', 'error');
             return;
        }

        setLoading(true);
        try {
            const resConfig = await api.get(`/assessment-config?session=${session}&term=${term}`);
            if (!resConfig.data || !resConfig.data.components) {
                showNotification('Assessment configuration not found for this term.', 'error');
                setLoading(false);
                return;
            }
            setConfig(resConfig.data);

            const resStudents = await api.get('/students'); 
            const filtered = resStudents.data.filter(s => 
                (s.classId === selectedClassId || s.classId?._id === selectedClassId) && 
                s.status === 'active' &&
                (!selectedArm || s.arm === selectedArm)
            );
            
            setStudents(filtered);

            const resResults = await api.get(`/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}&session=${session}&term=${term}`);
            
            const resultsMap = {};
            resResults.data.forEach(r => {
                resultsMap[r.studentId._id] = r.scores;
            });
            setResults(resultsMap);
            showNotification('Scores loaded', 'success');
        } catch (error) {
            console.error('Matrix load failure:', error);
            showNotification('Error loading score data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (studentId, componentName, value) => {
        const max = config.components.find(c => c.name === componentName)?.maxScore || 100;
        
        if (Number(value) > max) {
            // We allow it for individual feedback in UI but mark as invalid
        }

        if (value < 0) return;

        setResults(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [componentName]: value
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);
            const payload = {
                classId: selectedClassId,
                subjectId: selectedSubjectId,
                session,
                term,
                results: students.map(s => ({
                    studentId: s._id,
                    scores: results[s._id] || {}
                })).filter(r => Object.keys(r.scores).length > 0)
            };

            await api.post('/results', payload);
            showNotification('Results saved successfully', 'success');
        } catch (error) {
            showNotification(error.response?.data?.message || 'Failed to save results', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const getRowTotal = (studentId) => {
        const scores = results[studentId] || {};
        if (!config || !config.components) return 0;
        
        return config.components.reduce((sum, comp) => {
            const val = scores[comp.name];
            return sum + Number(val || 0);
        }, 0);
    };

    const getGrade = (total) => {
        if (config && config.gradingScale && config.gradingScale.length > 0) {
            const gradeItem = config.gradingScale.find(g => total >= g.minScore && total <= g.maxScore);
            return gradeItem ? gradeItem.grade : 'F';
        }
        
        if (total >= 70) return 'A';
        if (total >= 60) return 'B';
        if (total >= 50) return 'C';
        if (total >= 45) return 'D';
        if (total >= 40) return 'E';
        return 'F';
    };

    const getGradeColor = (grade) => {
        switch(grade) {
            case 'A': return 'bg-emerald-500/10 text-emerald-600 border-emerald-100';
            case 'B': return 'bg-blue-500/10 text-blue-600 border-blue-100';
            case 'C': return 'bg-indigo-500/10 text-indigo-600 border-indigo-100';
            case 'D': return 'bg-amber-500/10 text-amber-600 border-amber-100';
            case 'E': return 'bg-orange-500/10 text-orange-600 border-orange-100';
            case 'F': return 'bg-rose-500/10 text-rose-600 border-rose-100';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-100';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-[1600px] mx-auto pb-32 px-4"
        >
            {/* Neural Selection Hub Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em]">
                            <Cpu size={14} className="text-primary" /> Results
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Result Entry <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400 italic">Management</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Enter and manage student scores with automatic grade calculation.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center group hover:bg-white/10 transition-all cursor-default">
                                <Activity size={24} className="text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-black text-white">{students.length}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Total Students</p>
                            </div>
                            <div className="bg-white/5 backdrop-blur-3xl p-6 rounded-3xl border border-white/10 text-center group hover:bg-white/10 transition-all cursor-default">
                                <Target size={24} className="text-emerald-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <p className="text-2xl font-black text-emerald-400">{config?.components?.length || 0}</p>
                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-1">Components</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Loading Console */}
            <div className="bg-white p-6 rounded-[3rem] border border-slate-50 shadow-3xl mb-12 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32" />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end relative z-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Session</label>
                        <div className="relative">
                            <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={session} onChange={(e) => setSession(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm"
                            >
                                {sessions.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
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
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Class</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
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
                            <Layers className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                                className={`w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm transition-opacity ${availableArms.length === 0 ? 'opacity-50' : 'opacity-100'}`}
                                disabled={availableArms.length === 0}
                            >
                                <option value="">{availableArms.length === 0 ? 'No Arms Available' : 'Select Arm'}</option>
                                {availableArms.map(a => <option key={a._id || a.name} value={a.name}>{a.name}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] block ml-4">Subject</label>
                        <div className="relative">
                            <BookOpen className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                            <select 
                                value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}
                                className="w-full pl-16 pr-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 outline-none appearance-none cursor-pointer shadow-sm"
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end relative z-10">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLoadSheet}
                        disabled={loading}
                        className="px-12 py-6 bg-slate-950 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.25em] shadow-3xl shadow-slate-900/40 hover:bg-black transition-all flex items-center justify-center gap-4 min-w-[200px]"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <Search size={20} />}
                        Load Scores
                    </motion.button>
                </div>
            </div>

            {/* Score Sheet Matrix */}
            <AnimatePresence mode="wait">
                {config ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[4rem] border border-slate-100 shadow-4xl overflow-hidden relative"
                    >
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                <thead className="bg-slate-50/50 backdrop-blur-md sticky top-0 z-20">
                                    <tr>
                                        <th className="px-10 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-slate-400 border-b border-slate-100 sticky left-0 bg-slate-50/80 backdrop-blur-md z-30">Student Name</th>
                                        {config.components.map(comp => (
                                            <th key={comp.name} className="px-6 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-center border-b border-slate-100 min-w-[150px]">
                                                <div className="text-slate-900 mb-2">{comp.name}</div>
                                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[9px] text-slate-400 group-hover:bg-primary/10 transition-colors">
                                                    Max Score: <span className="text-slate-900">{comp.maxScore}</span>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="px-6 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-center border-b border-slate-100 bg-slate-100/30">Total</th>
                                        <th className="px-6 py-8 font-black text-[10px] uppercase tracking-[0.3em] text-center border-b border-slate-100 bg-slate-100/30">Grade</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                     {students.map((student, sIdx) => {
                                         const rowTotal = getRowTotal(student._id);
                                         const grade = getGrade(rowTotal);
                                         return (
                                             <motion.tr 
                                                 initial={{ opacity: 0, x: -20 }}
                                                 animate={{ opacity: 1, x: 0 }}
                                                 transition={{ delay: sIdx * 0.03 }}
                                                 key={student._id} 
                                                 className="hover:bg-slate-50/50 group transition-colors"
                                             >
                                                 <td className="px-10 py-6 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 border-r border-slate-50">
                                                     <div className="flex items-center gap-4">
                                                         <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-sm relative overflow-hidden">
                                                             <User size={20} className="relative z-10" />
                                                             <div className="absolute top-0 right-0 w-8 h-8 bg-white/20 rounded-full blur-lg" />
                                                         </div>
                                                         <div>
                                                             <div className="font-black text-slate-900 tracking-tight">{student.firstName} {student.lastName}</div>
                                                             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{student.studentId}</div>
                                                         </div>
                                                     </div>
                                                 </td>
                                                 {config.components.map(comp => {
                                                     const val = results[student._id]?.[comp.name] || '';
                                                     const isInvalid = Number(val) > comp.maxScore;
                                                     return (
                                                         <td key={comp.name} className="px-4 py-6">
                                                             <div className="relative group/input">
                                                                 <input
                                                                     type="number"
                                                                     value={val}
                                                                     min="0"
                                                                     max={comp.maxScore}
                                                                     onChange={(e) => handleScoreChange(student._id, comp.name, e.target.value)}
                                                                     className={`w-full text-center px-6 py-4 bg-slate-50 border-none rounded-2xl font-black text-lg outline-none transition-all focus:ring-4 focus:ring-primary/10 ${
                                                                         isInvalid ? 'bg-rose-50 text-rose-600 ring-4 ring-rose-500/10' : 'text-slate-700'
                                                                     }`}
                                                                 />
                                                                 {isInvalid && (
                                                                     <motion.div 
                                                                         initial={{ scale: 0 }} 
                                                                         animate={{ scale: 1 }}
                                                                         className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                                                                     >
                                                                         <AlertCircle size={12} />
                                                                     </motion.div>
                                                                 )}
                                                             </div>
                                                         </td>
                                                     );
                                                 })}
                                                 <td className="px-6 py-6 text-center font-black text-2xl text-slate-900 bg-slate-100/10 tabular-nums">
                                                     {rowTotal}
                                                 </td>
                                                 <td className="px-6 py-6 text-center bg-slate-100/10">
                                                     <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl font-black text-xl border transition-all duration-500 ${getGradeColor(grade)} shadow-sm`}>
                                                         {grade}
                                                     </div>
                                                 </td>
                                             </motion.tr>
                                         );
                                     })}
                                </tbody>
                            </table>
                            {students.length === 0 && (
                                <div className="p-24 text-center">
                                    <Database className="mx-auto text-slate-100 mb-6" size={80} />
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">No Students</h3>
                                    <p className="text-slate-400 mt-4 text-xl font-medium max-w-md mx-auto italic">No students found for the selected class and arm.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-40 bg-white rounded-[4rem] border border-dashed border-slate-200 shadow-2xl shadow-slate-200/40"
                    >
                        <Terminal className="mx-auto text-slate-100 mb-8" size={80} />
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight">Select Filters</h3>
                        <p className="text-slate-400 mt-4 text-xl font-medium max-w-lg mx-auto italic">
                            Choose a session, class, and subject to start entering results.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submission Protocol Toolbar */}
            <AnimatePresence>
                {config && students.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 px-12 py-6 bg-slate-950/90 backdrop-blur-2xl rounded-[3rem] shadow-4xl border border-white/5 flex items-center gap-12"
                    >
                        <div className="flex items-center gap-6 pr-12 border-r border-white/10">
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Ready to Save</p>
                                <p className="text-xl font-black text-white leading-none">{students.length} Students</p>
                            </div>
                            <div className="h-10 w-[1px] bg-white/10" />
                            <div>
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Average</p>
                                <p className="text-xl font-black text-primary leading-none">
                                    {students.length > 0 ? (students.reduce((acc, s) => acc + getRowTotal(s._id), 0) / students.length).toFixed(1) : 0}
                                </p>
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
                            {submitting ? 'Saving...' : 'Save Results'}
                        </motion.button>
                        
                        <button 
                            onClick={() => setConfig(null)}
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

export default ResultEntry;
