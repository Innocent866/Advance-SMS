import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, CheckCircle, Layers, Calendar, Book, User } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const AcademicSettings = () => {
    usePageTitle('Academic Settings');
    const [activeTab, setActiveTab] = useState('classes');
    
    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Academic Configuration</h1>
            
            <div className="flex space-x-4 border-b border-gray-200 mb-6 overflow-x-auto">
                <TabButton id="classes" label="Classes & Arms" icon={<Layers size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="subjects" label="Subjects" icon={<Book size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="sessions" label="Sessions & Terms" icon={<Calendar size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="assignments" label="Assignments (Teacher)" icon={<User size={18} />} active={activeTab} set={setActiveTab} />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 min-h-[400px]">
                {activeTab === 'classes' && <ClassesManager />}
                {activeTab === 'subjects' && <SubjectsManager />}
                {activeTab === 'sessions' && <SessionsManager />}
                {activeTab === 'assignments' && <AssignmentsManager />}
            </div>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, set }) => (
    <button 
        onClick={() => set(id)}
        className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors whitespace-nowrap border-b-2 ${
            active === id ? 'border-primary text-primary bg-green-50/50' : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
    >
        {icon} {label}
    </button>
);

// --- Sub-Components ---

const ClassesManager = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ name: '', category: 'JSS' });
    const [armForm, setArmForm] = useState({ classId: '', name: '' });
    const [expandedClass, setExpandedClass] = useState(null);

    useEffect(() => { fetch(); fetchSubjects(); }, []);
    const fetch = async () => { const res = await api.get('/academic/classes'); setClasses(res.data); };
    const fetchSubjects = async () => { const res = await api.get('/academic/subjects'); setSubjects(res.data); };
    
    const handleAddClass = async (e) => {
        e.preventDefault();
        await api.post('/academic/classes', form);
        setForm({ name: '', category: 'JSS' });
        fetch();
    };

    const handleAddArm = async (e) => {
        e.preventDefault();
        await api.post('/academic/classes/arms', { classId: armForm.classId, armName: armForm.name });
        setArmForm({ classId: '', name: '' });
        fetch();
    };

    const toggleSubject = async (classId, subjectId) => {
        await api.post('/academic/classes/subjects', { classId, subjectId });
        fetch(); // Refresh to see update
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
                <h3 className="font-bold text-gray-700 mb-4">Create Class Level</h3>
                <form onSubmit={handleAddClass} className="flex gap-2 mb-8">
                    <input 
                        className="flex-1 p-2 border rounded" placeholder="Class Name (e.g. JSS 1)" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
                    />
                    <select 
                        className="p-2 border rounded" 
                        value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    >
                        <option value="JSS">JSS</option>
                        <option value="SSS">SSS</option>
                    </select>
                    <button type="submit" className="bg-primary text-white p-2 rounded"><Plus /></button>
                </form>

                <h3 className="font-bold text-gray-700 mb-4">Add Arms</h3>
                <form onSubmit={handleAddArm} className="flex gap-2 mb-8">
                     <select 
                        className="flex-1 p-2 border rounded" 
                        value={armForm.classId} onChange={e => setArmForm({...armForm, classId: e.target.value})}
                        required
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <input 
                        className="w-24 p-2 border rounded" placeholder="Arm (A)" 
                        value={armForm.name} onChange={e => setArmForm({...armForm, name: e.target.value})} required 
                    />
                    <button type="submit" className="bg-secondary text-white p-2 rounded"><Plus /></button>
                </form>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                <h3 className="font-bold text-gray-700">Existing Classes</h3>
                {classes.map(c => (
                    <div key={c._id} className="border rounded-lg bg-gray-50 overflow-hidden">
                        <div 
                            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                            onClick={() => setExpandedClass(expandedClass === c._id ? null : c._id)}
                        >
                            <div>
                                <p className="font-bold">{c.name} <span className="text-xs bg-gray-200 px-1 rounded ml-2">{c.category}</span></p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {c.arms.map(arm => (
                                        <span key={arm._id} className="text-xs bg-white border px-2 py-1 rounded text-gray-600">
                                            {arm.name}
                                        </span>
                                    ))}
                                    {c.arms.length === 0 && <span className="text-xs text-gray-400 italic">No arms</span>}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500">
                                {c.subjects?.length || 0} Subjects
                            </div>
                        </div>
                        
                        {expandedClass === c._id && (
                            <div className="p-4 bg-white border-t border-gray-100">
                                <h4 className="text-sm font-bold mb-2">Assign Subjects</h4>
                                <div className="grid grid-cols-2 gap-2">
                                    {subjects.map(s => {
                                        const isAssigned = c.subjects?.some(sub => sub._id === s._id || sub === s._id);
                                        return (
                                            <button 
                                                key={s._id}
                                                onClick={() => toggleSubject(c._id, s._id)}
                                                className={`flex items-center gap-2 p-2 rounded text-sm transition-colors ${
                                                    isAssigned ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                                }`}
                                            >
                                                {isAssigned ? <CheckCircle size={14} /> : <div className="w-3.5 h-3.5 border rounded-full border-gray-400" />}
                                                {s.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SubjectsManager = () => {
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ name: '', code: '' });

    useEffect(() => { fetch(); }, []);
    const fetch = async () => { const res = await api.get('/academic/subjects'); setSubjects(res.data); };

    const handleAdd = async (e) => {
        e.preventDefault();
        await api.post('/academic/subjects', form);
        setForm({ name: '', code: '' });
        fetch();
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div>
                <h3 className="font-bold text-gray-700 mb-4">Add New Subject</h3>
                <form onSubmit={handleAdd} className="space-y-4">
                    <input 
                        className="w-full p-2 border rounded" placeholder="Subject Name" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
                    />
                    <input 
                        className="w-full p-2 border rounded" placeholder="Code (e.g. MTH)" 
                        value={form.code} onChange={e => setForm({...form, code: e.target.value})} required 
                    />
                    <button type="submit" className="w-full bg-primary text-white py-2 rounded font-bold">Add Subject</button>
                </form>
            </div>
            <div>
                 <h3 className="font-bold text-gray-700 mb-4">All Subjects ({subjects.length})</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {subjects.map(s => (
                        <div key={s._id} className="p-3 border rounded bg-white flex justify-between items-center">
                            <span>{s.name}</span>
                            <span className="font-mono text-xs text-gray-400">{s.code}</span>
                        </div>
                    ))}
                 </div>
            </div>
        </div>
    );
};

const SessionsManager = () => {
    const [sessions, setSessions] = useState([]);
    const [form, setForm] = useState({ name: '' });
    
    useEffect(() => { fetch(); }, []);
    const fetch = async () => { const res = await api.get('/academic/sessions'); setSessions(res.data); };

    const handleCreate = async (e) => {
        e.preventDefault();
        // Default terms
        const terms = [
            { name: 'First Term' },
            { name: 'Second Term' },
            { name: 'Third Term' }
        ];
        await api.post('/academic/sessions', { name: form.name, terms });
        setForm({ name: '' });
        fetch();
    };

    const handleActivate = async (id, term) => {
        if(confirm(`Set ${term} as active?`)) {
            await api.post('/academic/sessions/activate', { sessionId: id, currentTerm: term });
            fetch();
        }
    };

    return (
        <div>
             <div className="flex gap-4 mb-8 items-end">
                <div className="flex-1 max-w-xs">
                     <label className="block text-sm font-medium mb-1">New Session Year</label>
                     <input 
                        className="w-full p-2 border rounded" placeholder="e.g. 2025/2026" 
                        value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                    />
                </div>
                <button onClick={handleCreate} className="bg-primary text-white px-4 py-2 rounded font-bold">Create Session</button>
             </div>

             <div className="space-y-4">
                {sessions.map(s => (
                    <div key={s._id} className={`p-6 rounded-xl border ${s.isActive ? 'border-primary bg-green-50' : 'border-gray-200 bg-white'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">{s.name} {s.isActive && <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Active</span>}</h3>
                            <button className="text-red-500 hover:bg-red-50 p-2 rounded"><Trash2 size={18} /></button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4">
                            {s.terms.map((term, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleActivate(s._id, term.name)}
                                    className={`p-3 rounded border text-left transition-colors ${
                                        s.isActive && s.currentTerm === term.name 
                                        ? 'bg-primary text-white border-primary' 
                                        : 'hover:bg-gray-50 border-gray-200'
                                    }`}
                                >
                                    <div className="font-bold">{term.name}</div>
                                    <div className="text-xs opacity-75">Click to Activate</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
             </div>
        </div>
    );
};

const AssignmentsManager = () => {
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ teacherId: '', classId: '', subjectId: '', arm: '' });

    useEffect(() => { 
        const load = async () => {
            const [t, c, s] = await Promise.all([
                api.get('/teachers'),
                api.get('/academic/classes'),
                api.get('/academic/subjects')
            ]);
            setTeachers(t.data);
            setClasses(c.data);
            setSubjects(s.data);
        };
        load();
    }, []);

    const selectedClass = classes.find(c => c._id === form.classId);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            await api.post('/academic/assignments/teacher', form);
            alert('Teacher Assigned Successfully');
            setForm({ teacherId: '', classId: '', subjectId: '', arm: '' });
        } catch (error) {
            alert('Error assigning teacher');
        }
    };

    return (
        <div className="max-w-xl">
            <h3 className="font-bold text-gray-700 mb-6">Assign Teacher to Subject</h3>
            <form onSubmit={handleAssign} className="space-y-4 bg-white p-6 border rounded-xl">
                <div>
                    <label className="block text-sm font-medium mb-1">Select Teacher</label>
                    <select 
                        className="w-full p-2 border rounded"
                        value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})}
                        required
                    >
                        <option value="">Select Teacher</option>
                        {teachers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.email})</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Select Class</label>
                    <select 
                        className="w-full p-2 border rounded"
                        value={form.classId} onChange={e => setForm({...form, classId: e.target.value})}
                        required
                    >
                        <option value="">Select Class</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>

                {selectedClass && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Select Subject</label>
                            <select 
                                className="w-full p-2 border rounded"
                                value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Select Arm (Optional)</label>
                             <select 
                                className="w-full p-2 border rounded"
                                value={form.arm} onChange={e => setForm({...form, arm: e.target.value})}
                            >
                                <option value="">All Arms</option>
                                {selectedClass.arms?.map(a => <option key={a._id || a.name} value={a.name}>{a.name}</option>)}
                            </select>
                        </div>
                    </>
                )}

                <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-bold mt-4">
                    Assign Teacher
                </button>
            </form>
        </div>
    );
};

export default AcademicSettings;
