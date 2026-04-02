import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
    Plus, 
    Trash2, 
    CheckCircle, 
    Layers, 
    Calendar, 
    Book, 
    User, 
    Link as LinkIcon, 
    Copy, 
    X, 
    ChevronRight, 
    Search, 
    Filter, 
    Settings2, 
    Activity, 
    Workflow,
    ShieldCheck,
    AlertCircle,
    RotateCcw,
    Users,
    FileText
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const AcademicSettings = () => {
    usePageTitle('School Setup');
    const [activeTab, setActiveTab] = useState('classes');
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header / Hero */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-2"
                    >
                        <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-600/20">
                            <Settings2 size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">School Management</span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Academic Settings</h1>
                    <p className="text-gray-500 font-medium mt-1">Configure classes, subjects, and teacher assignments for your institution.</p>
                </div>
            </div>
            
            {/* Glassmorphic Tab Navigation */}
            <div className="bg-white/50 backdrop-blur-xl p-2 rounded-[2rem] border border-gray-100 shadow-sm mb-10 inline-flex flex-wrap gap-2">
                <TabButton id="classes" label="Classes & Arms" icon={<Layers size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="subjects" label="Subjects" icon={<Book size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="sessions" label="Sessions & Terms" icon={<Calendar size={18} />} active={activeTab} set={setActiveTab} />
                <TabButton id="assignments" label="Teacher Assignments" icon={<User size={18} />} active={activeTab} set={setActiveTab} />
            </div>

            <AnimatePresence mode="wait">
                <motion.div 
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="min-h-[500px]"
                >
                    {activeTab === 'classes' && <ClassesManager />}
                    {activeTab === 'subjects' && <SubjectsManager />}
                    {activeTab === 'sessions' && <SessionsManager />}
                    {activeTab === 'assignments' && <AssignmentsManager />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

const TabButton = ({ id, label, icon, active, set }) => (
    <button 
        onClick={() => set(id)}
        className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 ${
            active === id 
            ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-white'
        }`}
    >
        {icon} 
        <span>{label}</span>
    </button>
);

// --- Sub-Components Overhaul ---

const ClassesManager = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ name: '', category: 'JSS' });
    const [armForm, setArmForm] = useState({ classId: '', name: '' });
    const [expandedClass, setExpandedClass] = useState(null);
    const [selectedArm, setSelectedArm] = useState(null); 
    const [generatedLink, setGeneratedLink] = useState(null);
    const [isCopying, setIsCopying] = useState(false);

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
        await api.post('/academic/classes/subjects', { classId, subjectId, armId: selectedArm });
        fetch(); 
    };

    const handleGenerateLink = async (classId, armName) => {
        try {
            const res = await api.post('/students/generate-upload-link', { classId, arm: armName });
            setGeneratedLink(res.data.uploadLink);
        } catch (error) {
            console.error(error);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(generatedLink);
        setIsCopying(true);
        setTimeout(() => setIsCopying(false), 2000);
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Control Sidebar */}
            <div className="xl:col-span-4 space-y-8">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 px-1">Add New Class</h3>
                    <form onSubmit={handleAddClass} className="space-y-4">
                        <input 
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 placeholder:text-gray-300" 
                            placeholder="Class Name (e.g. JSS 1)" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
                        />
                        <div className="flex gap-2">
                            <select 
                                className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer" 
                                value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                            >
                                <option value="JSS">JSS (Junior)</option>
                                <option value="SSS">SSS (Senior)</option>
                            </select>
                            <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>
                    </form>

                    <div className="h-px bg-gray-100 my-8"></div>

                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-6 px-1">Add Class Arm</h3>
                    <form onSubmit={handleAddArm} className="space-y-4">
                        <select 
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700 appearance-none cursor-pointer" 
                            value={armForm.classId} onChange={e => setArmForm({...armForm, classId: e.target.value})}
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-gray-700 placeholder:text-gray-300" 
                                placeholder="Arm Name (A, Gold, etc.)" 
                                value={armForm.name} onChange={e => setArmForm({...armForm, name: e.target.value})} required 
                            />
                            <button type="submit" className="bg-emerald-600 text-white p-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* List Visualization */}
            <div className="xl:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-2 px-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Class List</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{classes.length} Classes</span>
                </div>
                
                <div className="space-y-4">
                    {classes.map((c, idx) => (
                        <motion.div 
                            key={c._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${expandedClass === c._id ? 'border-indigo-200 shadow-xl shadow-indigo-500/5 ring-4 ring-indigo-50' : 'border-gray-100 shadow-sm hover:border-indigo-100 hover:shadow-md'}`}
                        >
                            <div 
                                className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 cursor-pointer"
                                onClick={() => setExpandedClass(expandedClass === c._id ? null : c._id)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center font-black transition-colors ${expandedClass === c._id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'}`}>
                                        {c.name.split(' ')[1] || c.name[0]}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-black text-gray-900 tracking-tight">{c.name}</p>
                                            <span className="text-[10px] font-black bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">{c.category}</span>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {c.arms.map(arm => (
                                                <span key={arm._id} className="text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg uppercase tracking-widest">
                                                    Arm {arm.name}
                                                </span>
                                            ))}
                                            {c.arms.length === 0 && <span className="text-[10px] font-bold text-gray-300 italic">No Arms Added</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8 pr-4">
                                    <div className="text-center">
                                        <p className="text-xs font-black text-gray-900 uppercase tracking-widest">{c.subjects?.length || 0}</p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subjects</p>
                                    </div>
                                    <ChevronRight className={`text-gray-300 transition-transform duration-500 ${expandedClass === c._id ? 'rotate-90 text-indigo-600' : ''}`} />
                                </div>
                            </div>
                            
                            <AnimatePresence>
                                {expandedClass === c._id && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-indigo-50/30 border-t border-indigo-100"
                                    >
                                        <div className="p-8">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                                 <div className="flex items-center gap-3">
                                                     <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                                         <Workflow size={18} />
                                                     </div>
                                                      <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest">Subject Assignment</h4>
                                                 </div>
                                                 <div className="relative">
                                                     <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                                                     <select 
                                                        className="pl-9 pr-8 py-2.5 bg-white border border-indigo-100 rounded-xl text-[10px] font-black text-indigo-700 uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                                                        value={selectedArm || ''}
                                                        onChange={e => setSelectedArm(e.target.value || null)}
                                                     >
                                                        <option value="">Whole Class</option>
                                                        {c.arms.map(a => <option key={a._id} value={a._id}>Specific: Arm {a.name}</option>)}
                                                     </select>
                                                 </div>
                                             </div>

                                             {selectedArm && (
                                                 <motion.div 
                                                    initial={{ opacity: 0, y: -10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="mb-8 p-6 bg-white rounded-3xl border border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-6"
                                                >
                                                     <div className="flex items-center gap-4">
                                                         <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                                                             <LinkIcon size={20} />
                                                         </div>
                                                         <div>
                                                              <p className="text-sm font-black text-gray-900">Student Upload Link</p>
                                                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Generate a link for students to join this class.</p>
                                                         </div>
                                                     </div>
                                                     <button 
                                                         onClick={() => handleGenerateLink(c._id, c.arms.find(a => a._id === selectedArm)?.name)}
                                                         className="w-full md:w-auto bg-indigo-600 text-white text-[10px] px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-gray-900 transition-all shadow-lg shadow-indigo-600/10 active:scale-95"
                                                     >
                                                         Generate Link
                                                     </button>
                                                 </motion.div>
                                             )}
                                            
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                                {subjects.map(s => {
                                                    const isGeneral = c.subjects?.some(sub => sub._id === s._id || sub === s._id);
                                                    const isArmSpecific = selectedArm 
                                                        ? c.arms.find(a => a._id === selectedArm)?.subjects?.some(sub => sub._id === s._id || sub === s._id)
                                                        : false;

                                                    const isAssigned = selectedArm ? isArmSpecific : isGeneral;

                                                    return (
                                                        <button 
                                                            key={s._id}
                                                            onClick={() => toggleSubject(c._id, s._id)}
                                                            className={`flex items-center gap-3 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                                isAssigned 
                                                                    ? 'bg-white text-emerald-600 border-2 border-emerald-500 shadow-lg shadow-emerald-500/10' 
                                                                    : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-200 hover:text-indigo-600 opacity-60'
                                                            }`}
                                                        >
                                                            {isAssigned ? <CheckCircle size={16} /> : <div className="w-4 h-4 border-2 rounded-full border-gray-200" />}
                                                            <span className="truncate">{s.name}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Link Modal Redesign */}
            <AnimatePresence>
                {generatedLink && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3.5rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8 relative z-10">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Upload Link</h3>
                                <button onClick={() => setGeneratedLink(null)} className="p-3 bg-gray-50 text-gray-400 hover:text-gray-900 rounded-full transition-colors"><X size={20} /></button>
                            </div>
                            <div className="flex items-center gap-4 mb-8 bg-indigo-50/50 p-6 rounded-[2rem] relative z-10">
                                <div className="p-3 bg-indigo-600 text-white rounded-2xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <p className="text-xs font-bold text-indigo-900 leading-relaxed">
                                     Student upload link generated. This link should be shared with the class teacher.
                                </p>
                            </div>
                            <div className="group relative bg-gray-50 p-6 rounded-[2rem] border border-gray-100 mb-8 overflow-hidden relative z-10">
                                <code className="text-[10px] text-gray-400 font-mono block break-all mb-4 px-2 select-all">
                                    {generatedLink}
                                </code>
                                <button 
                                    onClick={copyToClipboard}
                                    className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${isCopying ? 'bg-emerald-600 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}
                                >
                                    {isCopying ? (
                                        <>
                                            <CheckCircle size={18} />
                                            <span>Link Copied</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={18} />
                                            <span>Copy Link</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <button 
                                onClick={() => setGeneratedLink(null)}
                                className="w-full text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors py-4"
                            >
                                Dismiss
                            </button>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32"></div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
             <div className="xl:col-span-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm"
                >
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-6 px-1">Register Subject</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <input 
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 placeholder:text-gray-300" 
                            placeholder="Full Name (e.g. Mathematics)" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} required 
                        />
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 placeholder:text-gray-300 uppercase" 
                                placeholder="Code (MTH)" 
                                value={form.code} onChange={e => setForm({...form, code: e.target.value})} required 
                            />
                            <button type="submit" className="bg-indigo-600 text-white p-4 rounded-2xl shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                                <Plus size={24} />
                            </button>
                        </div>
                    </form>
                    <div className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border border-indigo-100 flex items-center gap-4">
                        <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-sm">
                            <Book size={20} />
                        </div>
                        <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest leading-relaxed">
                            Define subjects carefully. Codes are used for result processing and lesson planning.
                        </p>
                    </div>
                </motion.div>
            </div>
            <div className="xl:col-span-8">
                 <div className="flex items-center justify-between mb-6 px-4">
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Subject List</h3>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{subjects.length} Subjects</span>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((s, idx) => (
                        <motion.div 
                            key={s._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="p-5 bg-white border border-gray-100 rounded-[2rem] shadow-sm flex justify-between items-center group hover:border-indigo-200 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition-colors">
                                    <FileText size={18} />
                                </div>
                                <span className="text-xs font-black text-gray-700 tracking-tight">{s.name}</span>
                            </div>
                            <span className="text-[10px] font-black px-2 py-1 bg-gray-50 text-gray-400 uppercase tracking-widest rounded-lg border border-gray-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">{s.code}</span>
                        </motion.div>
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
        const terms = [{ name: 'First Term' }, { name: 'Second Term' }, { name: 'Third Term' }];
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
        <div className="space-y-12">
             <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-10 items-center justify-between relative overflow-hidden"
            >
                <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">School Calendar</h3>
                    <p className="text-gray-500 font-medium">Configure active academic years and term switching.</p>
                </div>
                <div className="flex gap-4 items-end w-full md:w-auto">
                    <div className="flex-1 md:w-64">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Session Year</label>
                         <input 
                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 placeholder:text-gray-300" 
                            placeholder="e.g. 2025/2026" 
                            value={form.name} onChange={e => setForm({...form, name: e.target.value})} 
                        />
                    </div>
                    <button onClick={handleCreate} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-gray-900/10">Add Session</button>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32"></div>
             </motion.div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sessions.map((s, idx) => (
                    <motion.div 
                        key={s._id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`p-10 rounded-[4rem] border transition-all duration-500 ${s.isActive ? 'border-indigo-100 bg-white shadow-2xl shadow-indigo-500/10 ring-4 ring-indigo-50' : 'border-gray-100 bg-white opacity-60'}`}
                    >
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black text-gray-900">{s.name}</h3>
                                {s.isActive && (
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Current Session</span>
                                    </div>
                                )}
                            </div>
                            <button className="p-4 bg-rose-50 text-rose-300 hover:text-rose-600 hover:bg-rose-100 rounded-3xl transition-all"><Trash2 size={24} /></button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            {s.terms.map((term, i) => (
                                <button 
                                    key={i}
                                    onClick={() => handleActivate(s._id, term.name)}
                                    className={`group flex items-center justify-between p-6 rounded-[2.5rem] border-2 transition-all duration-300 ${
                                        s.isActive && s.currentTerm === term.name 
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                        : 'bg-white border-gray-50 text-gray-400 hover:border-indigo-100 hover:text-indigo-600'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-3 rounded-2xl transition-colors ${s.isActive && s.currentTerm === term.name ? 'bg-white/20' : 'bg-gray-50 group-hover:bg-indigo-50'}`}>
                                            <Calendar size={20} />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-sm font-black uppercase tracking-widest">{term.name}</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${s.isActive && s.currentTerm === term.name ? 'opacity-60' : 'opacity-30'}`}>
                                                {s.isActive && s.currentTerm === term.name ? 'Active' : 'Inactive'}
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight className={`transition-transform duration-500 ${s.isActive && s.currentTerm === term.name ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                ))}
             </div>
        </div>
    );
};

const AssignmentsManager = () => {
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [form, setForm] = useState({ teacherId: '', classId: '', subjectId: '', arm: '' });
    const [searchQuery, setSearchQuery] = useState('');

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
            setForm({ teacherId: '', classId: '', subjectId: '', arm: '' });
            // Refresh teacher data? Or optimistic update. Simplest is reload all.
            const res = await api.get('/teachers');
            setTeachers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const allAssignments = teachers.flatMap(t => 
        (t.teachingAssignments || []).map((assign, idx) => ({
            ...assign,
            teacherName: `${t.firstName} ${t.lastName}`,
            teacherEmail: t.email,
            teacherId: t._id,
            uniqueKey: `${t._id}-${idx}`
        }))
    );

    const filteredAssignments = allAssignments.filter(a => {
        const className = classes.find(c => c._id === a.classId)?.name || '';
        const subjectName = subjects.find(s => s._id === a.subjectId)?.name || '';
        const search = searchQuery.toLowerCase();
        return (
            a.teacherName.toLowerCase().includes(search) ||
            className.toLowerCase().includes(search) ||
            subjectName.toLowerCase().includes(search)
        );
    });

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            {/* Create Assignment Form */}
            <div className="xl:col-span-4">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm sticky top-8"
                >
                    <h3 className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] mb-8 px-1">Assign Teacher</h3>
                    <form onSubmit={handleAssign} className="space-y-6">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Teacher</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                    value={form.teacherId} onChange={e => setForm({...form, teacherId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Teacher</option>
                                    {teachers.map(t => <option key={t._id} value={t._id}>{t.firstName} {t.lastName}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Class</label>
                            <div className="relative">
                                <Layers size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select 
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                    value={form.classId} onChange={e => setForm({...form, classId: e.target.value})}
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <AnimatePresence>
                            {selectedClass && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Subject</label>
                                        <div className="relative">
                                            <Book size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select 
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                                value={form.subjectId} onChange={e => setForm({...form, subjectId: e.target.value})}
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Class Arm</label>
                                        <div className="relative">
                                            <Workflow size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <select 
                                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                                value={form.arm} onChange={e => setForm({...form, arm: e.target.value})}
                                            >
                                                <option value="">Whole Class</option>
                                                {selectedClass.arms?.map(a => <option key={a._id || a.name} value={a.name}>Strict: Arm {a.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button type="submit" className="w-full bg-indigo-600 text-white py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-widest mt-4 shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all">
                            Save Assignment
                        </button>
                    </form>
                </motion.div>
            </div>

            {/* Current Assignments Table */}
            <div className="xl:col-span-8 space-y-8">
                 <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                        <div>
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-1">Teacher Assignments</h3>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Managing {filteredAssignments.length} Assignments</p>
                        </div>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                className="w-full pl-12 pr-5 py-3.5 bg-gray-50 border-none rounded-2xl font-bold text-gray-700 text-xs placeholder:text-gray-300 focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="Search Assignments..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto -mx-8">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Class</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Subject</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Teacher</th>
                                    <th className="px-10 py-5 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredAssignments.map((assign, idx) => {
                                    const classData = classes.find(c => c._id === assign.classId);
                                    const subjectData = subjects.find(s => s._id === assign.subjectId);
                                    return (
                                        <motion.tr 
                                            key={assign.uniqueKey} 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.02 }}
                                            className="group hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-xs">
                                                        {classData?.name.split(' ')[1] || 'L'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-gray-900 tracking-tight">{classData?.name || 'Loading...'}</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <div className={`w-1 h-1 rounded-full ${assign.arm ? 'bg-amber-500 shadow-sm shadow-amber-500/50' : 'bg-emerald-500 shadow-sm shadow-emerald-500/50'}`}></div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                {assign.arm ? `Arm ${assign.arm}` : 'Whole Class'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-3 py-1.5 bg-gray-50 text-gray-500 group-hover:bg-indigo-600 group-hover:text-white transition-all text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-100">
                                                    {subjectData?.code || 'SOC'}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div 
                                                    className="flex items-center gap-3 cursor-pointer group/teacher"
                                                    onClick={() => navigate(`/teachers/${assign.teacherId}`)}
                                                >
                                                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center font-black text-gray-400 group-hover/teacher:bg-indigo-50 group-hover/teacher:text-indigo-600 transition-colors">
                                                        {assign.teacherName[0]}
                                                    </div>
                                                    <span className="text-xs font-black text-gray-700 tracking-tight group-hover/teacher:text-indigo-600 transition-colors">{assign.teacherName}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <button className="p-3 text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                                                    <RotateCcw size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                                {filteredAssignments.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-24 text-center">
                                            <Users size={48} className="mx-auto text-gray-200 mb-6" />
                                            <h4 className="text-xl font-black text-gray-900">Isolation Detected</h4>
                                            <p className="text-sm font-medium text-gray-400 mt-2">No educational nodes match your search parameters.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcademicSettings;
