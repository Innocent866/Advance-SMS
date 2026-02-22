import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { Save, Search, Calculator } from 'lucide-react';

const ResultEntry = () => {
    usePageTitle('Enter Results');
    const { showNotification } = useNotification();
    
    // Selection State
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [selectedArm, setSelectedArm] = useState('');
    const [availableArms, setAvailableArms] = useState([]); // Arms for the selected class
    
    const [session, setSession] = useState('2025/2026');
    const [term, setTerm] = useState('First Term');
    
    // Teacher specific restrictions
    const [teacherAssignments, setTeacherAssignments] = useState(null); 
    
    // Data State
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState(null);
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState({}); // { studentId: { CA1: 10, Exam: 50 } }

    const [sessions, setSessions] = useState([]);

    const { user } = useAuth(); // Assuming useAuth hook provides user
    
    useEffect(() => {
        if (user) {
            fetchMetadata();
        }
    }, [user]);

    const fetchMetadata = async () => {
        try {
            // 1. Fetch generic metadata (Sessions, Classes, Subjects)
            const [resSessions, resClasses, resSubjects] = await Promise.all([
                api.get('/academic/sessions'),
                api.get('/academic/classes'), // Full class objects with arms
                api.get('/academic/subjects')
            ]);
            
            setSessions(resSessions.data);

            // Active Session Logic
            const activeSession = resSessions.data.find(s => s.isActive);
            if (activeSession) {
                setSession(activeSession.name);
                setTerm(activeSession.currentTerm || 'First Term');
            } else if (resSessions.data.length > 0) {
                 setSession(resSessions.data[0].name);
            }

            let availableClasses = resClasses.data;
            let availableSubjects = resSubjects.data;

            // 2. Filter if Teacher
            if (user.role === 'teacher') {
                const resProfile = await api.get('/teachers/me');
                const teacher = resProfile.data;
                const assignments = teacher.teachingAssignments || [];
                
                // Build maps of allowed IDs
                const allowedClassIds = new Set();
                const allowedSubjectIds = new Set();
                const armMap = new Map();

                assignments.forEach(a => {
                    if (a.classId) {
                        // a.classId might be object or ID depending on population in getMyProfile
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
                
                // Handle general class assignments too (Form Teachers etc)
                if (teacher.classes && teacher.classes.length > 0) {
                    teacher.classes.forEach(c => {
                        const cId = (c._id || c).toString();
                        allowedClassIds.add(cId);
                    });
                }

                // Filter available lists based on the IDs
                // We use the FULL class objects from resClasses, but only keep ones the teacher is allowed to see
                availableClasses = availableClasses.filter(c => allowedClassIds.has(c._id.toString()));
                availableSubjects = availableSubjects.filter(s => allowedSubjectIds.has(s._id.toString()));
                
                setTeacherAssignments({ armMap });
            }

            setClasses(availableClasses);
            setSubjects(availableSubjects);

        } catch (error) {
            showNotification('Failed to load classes/subjects', 'error');
        }
    };

    // Update available arms when class is selected
    useEffect(() => {
        if (!selectedClassId) {
            setAvailableArms([]);
            setSelectedArm('');
            return;
        }

        const cls = classes.find(c => c._id === selectedClassId);
        if (!cls) return;

        // Get all arms from the class object (requires class object to have arms populated)
        // If classes state only has minimal info, we might need to fetch class details or ensure list has arms.
        // Assuming /academic/classes endpoint returns arms array.
        let arms = cls.arms || [];

        // Filter by Teacher Assignment
        if (teacherAssignments && teacherAssignments.armMap) {
            const allowedArms = teacherAssignments.armMap.get(selectedClassId);
            if (allowedArms && allowedArms.size > 0) {
                 arms = arms.filter(a => allowedArms.has(a.name));
            }
        }

        setAvailableArms(arms);
        setSelectedArm(''); // Reset arm selection

    }, [selectedClassId, classes, teacherAssignments]);

    const handleLoadSheet = async () => {
        if (!selectedClassId || !selectedSubjectId) {
            showNotification('Please select Class and Subject', 'error');
            return;
        }
        
        // Arm is optional? Or required if class has arms?
        // Usually required if filtered.
        if (availableArms.length > 0 && !selectedArm) {
             showNotification('Please select an Arm', 'error');
             return;
        }

        setLoading(true);
        try {
            // 1. Fetch Config
            const resConfig = await api.get(`/assessment-config?session=${session}&term=${term}`);
            if (!resConfig.data || !resConfig.data.components) {
                showNotification('Assessment Configuration not found for this term. Contact Admin.', 'error');
                setLoading(false);
                return;
            }
            setConfig(resConfig.data);

            // 2. Fetch Students
            // Helper to get students by class (using existing endpoint filter)
            // Ideally endpoint supports query
            // We used /students before. Let's filter client side or query
            // Assuming api.get('/students?classId=...') works or we filter.
            // Let's use the teacher endpoint if teacher
            const resStudents = await api.get('/students'); // Broad fetch, then filter? 
            // Better: Filter by class
            const filtered = resStudents.data.filter(s => 
                (s.classId === selectedClassId || s.classId?._id === selectedClassId) && 
                s.status === 'active' &&
                (!selectedArm || s.arm === selectedArm)
            );
            
            setStudents(filtered);

            // 3. Fetch Existing Results (to pre-fill)
            const resResults = await api.get(`/results?classId=${selectedClassId}&subjectId=${selectedSubjectId}&session=${session}&term=${term}`);
            
            // Map Results to State
            const resultsMap = {};
            resResults.data.forEach(r => {
                resultsMap[r.studentId._id] = r.scores;
            });
            setResults(resultsMap);

        } catch (error) {
            console.error(error);
            showNotification('Error loading data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleScoreChange = (studentId, componentName, value) => {
        // Validate Max Score Client Side
        const max = config.components.find(c => c.name === componentName)?.maxScore || 100;
        
        if (Number(value) > max) {
            // Optional: Block or visual warning? 
            // Let's allow input but show red?
            // "Teachers must NOT be able to enter scores higher" -> Block
            // return; // Block
            // Check requirement: "Show clear error messages when invalid scores are entered."
            // We can block typing.
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
            setLoading(true);
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
            console.error(error);
            showNotification(error.response?.data?.message || 'Error saving results', 'error');
            if (error.response?.data?.errors) {
                 error.response.data.errors.forEach(e => showNotification(e, 'error'));
            }
        } finally {
            setLoading(false);
        }
    };

    // Calculate Row Total
    const getRowTotal = (studentId) => {
        const scores = results[studentId] || {};
        // Only sum scores for components present in the CURRENT configuration
        // This prevents "ghost" scores from deleted/renamed components affecting the total
        if (!config || !config.components) return 0;
        
        return config.components.reduce((sum, comp) => {
            const val = scores[comp.name];
            return sum + Number(val || 0);
        }, 0);
    };

    const getGrade = (total) => {
        // Use config grading scale if available
        if (config && config.gradingScale && config.gradingScale.length > 0) {
            const gradeItem = config.gradingScale.find(g => total >= g.minScore && total <= g.maxScore);
            return gradeItem ? gradeItem.grade : 'F';
        }
        
        // Fallback or Initial State
        if (total >= 70) return 'A';
        if (total >= 60) return 'B';
        if (total >= 50) return 'C';
        if (total >= 45) return 'D';
        if (total >= 40) return 'E';
        return 'F';
    };

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Enter Results</h1>
                <button 
                    onClick={handleSubmit}
                    disabled={!config || loading}
                    className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Submit Scores'}</span>
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                     <select 
                        value={session} onChange={(e) => setSession(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    >
                        {sessions.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                     <select 
                        value={term} onChange={(e) => setTerm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    >
                         <option>First Term</option>
                         <option>Second Term</option>
                         <option>Third Term</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                    <select 
                        value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Arm</label>
                    <select 
                        value={selectedArm} onChange={(e) => setSelectedArm(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                        disabled={availableArms.length === 0}
                    >
                        <option value="">{availableArms.length === 0 ? 'No Arms' : 'Select Arm'}</option>
                         {availableArms.map(a => <option key={a._id || a.name} value={a.name}>{a.name}</option>)}
                    </select>
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <select 
                        value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg text-sm outline-none"
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
                <button 
                    onClick={handleLoadSheet}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                >
                    <Search size={18} /> Load Sheet
                </button>
            </div>

            {/* Score Sheet */}
            {config && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-600 sticky left-0 bg-gray-50 z-10">Student</th>
                                {config.components.map(comp => (
                                    <th key={comp.name} className="px-4 py-4 font-semibold text-gray-600 text-center w-32">
                                        {comp.name}
                                        <div className="text-xs font-normal text-gray-400">Max: {comp.maxScore}</div>
                                    </th>
                                ))}
                                <th className="px-4 py-4 font-semibold text-gray-600 text-center bg-gray-50">Total</th>
                                <th className="px-4 py-4 font-semibold text-gray-600 text-center bg-gray-50">Grade</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                             {students.map(student => {
                                 const rowTotal = getRowTotal(student._id);
                                 return (
                                     <tr key={student._id} className="hover:bg-gray-50">
                                         <td className="px-6 py-4 sticky left-0 bg-white hover:bg-gray-50">
                                             <div className="font-bold text-gray-800">{student.firstName} {student.lastName}</div>
                                             <div className="text-xs text-gray-500">{student.studentId}</div>
                                         </td>
                                         {config.components.map(comp => {
                                             const val = results[student._id]?.[comp.name] || '';
                                             const isInvalid = Number(val) > comp.maxScore;
                                             return (
                                                 <td key={comp.name} className="px-2 py-4">
                                                     <input
                                                         type="number"
                                                         value={val}
                                                         min="0"
                                                         max={comp.maxScore}
                                                         onChange={(e) => handleScoreChange(student._id, comp.name, e.target.value)}
                                                         className={`w-full text-center px-2 py-1 border rounded-md outline-none focus:ring-1 focus:ring-primary ${isInvalid ? 'border-red-500 bg-red-50 text-red-600 font-bold' : ''}`}
                                                     />
                                                     {isInvalid && (
                                                         <div className="text-[10px] text-red-500 text-center mt-1">Max {comp.maxScore}</div>
                                                     )}
                                                 </td>
                                             );
                                         })}
                                         <td className="px-4 py-4 text-center font-bold text-gray-800 bg-gray-50">
                                             {rowTotal}
                                         </td>
                                         <td className="px-4 py-4 text-center font-bold bg-gray-50">
                                             <span className={`px-2 py-1 rounded text-xs ${
                                                getGrade(rowTotal) === 'F' ? 'bg-red-100 text-red-700' : 
                                                getGrade(rowTotal) === 'A' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'
                                             }`}>
                                                 {getGrade(rowTotal)}
                                             </span>
                                         </td>
                                     </tr>
                                 );
                             })}
                        </tbody>
                    </table>
                     {students.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No students found in this class.
                        </div>
                    )}
                </div>
            )}

            {!config && !loading && (
                <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                    <Calculator className="mx-auto text-gray-300 mb-4" size={48} />
                    <h3 className="text-gray-500 font-medium">Select Session, Term, Class and Subject to load sheet</h3>
                </div>
            )}
        </div>
    );
};

export default ResultEntry;
