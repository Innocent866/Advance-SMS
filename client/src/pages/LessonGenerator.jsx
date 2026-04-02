import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
    BookOpen, 
    Sparkles, 
    Save, 
    Clock, 
    Copy, 
    AlignLeft, 
    List, 
    MonitorPlay, 
    Loader2 as Loader, 
    FileText, 
    Presentation, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle, 
    GraduationCap,
    Zap,
    Cpu,
    Target,
    Terminal,
    Database,
    Binary,
    ShieldCheck,
    AlertCircle,
    ArrowRight,
    Award,
    Calendar,
    Brain,
    Edit2,
    MessageSquare,
    Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const LessonGenerator = () => {
    usePageTitle('AI Lesson Planner');
    const { user } = useAuth();
    const location = useLocation();

    // Role verification protocol
    if (user && user.role !== 'teacher') {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 p-6">
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-16 bg-white rounded-[3.5rem] shadow-4xl border border-rose-100 max-w-xl relative overflow-hidden"
                >
                   <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-full blur-3xl -mr-16 -mt-16" />
                   <div className="bg-rose-500/10 p-6 rounded-[2rem] inline-flex mb-8 relative z-10">
                        <ShieldCheck className="text-rose-500" size={48} />
                   </div>
                   <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight relative z-10">Access Restricted</h2>
                   <p className="text-slate-500 font-medium text-lg leading-relaxed relative z-10">
                        Lesson planning tools are only available to teachers. 
                        Please contact the admin for access.
                   </p>
                </motion.div>
            </div>
        );
    }
    
    // Check if we are reusing (duplicating) or editing a lesson
    const passedLesson = location.state?.lesson;
    const mode = location.state?.mode || 'create'; // 'create', 'edit', 'duplicate'
    const isEditing = mode === 'edit';

    const [currentStep, setCurrentStep] = useState(1);
    const [resultTab, setResultTab] = useState('plan'); // 'plan', 'notes', 'slides'

    const [formData, setFormData] = useState({
        subject: '',
        classLevel: '',
        term: 'First',
        week: '1',
        topic: '',
        generateNotes: true
    });

    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [lessonNotes, setLessonNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (passedLesson) {
             setFormData({
                subject: passedLesson.subjectId?._id || passedLesson.subjectId,
                classLevel: passedLesson.classLevelId?._id || passedLesson.classLevelId,
                term: passedLesson.term,
                week: passedLesson.week,
                topic: passedLesson.topic,
                generateNotes: !!passedLesson.lessonNotes
            });
            setGeneratedPlan(passedLesson.content);
            setLessonNotes(passedLesson.lessonNotes || '');
            
            if (passedLesson.content) setCurrentStep(3); 
        }

        const fetchMeta = async () => {
            try {
                // Phase 1: Meta Discovery (Settled Protocol)
                const [subjectsRes, classesRes, teacherRes] = await Promise.allSettled([
                    api.get('/academic/subjects'),
                    api.get('/academic/classes'),
                    user?.role === 'teacher' ? api.get('/teachers/me') : Promise.resolve({ data: null })
                ]);

                let allSubjects = subjectsRes.status === 'fulfilled' ? subjectsRes.value.data : [];
                let allClasses = classesRes.status === 'fulfilled' ? classesRes.value.data : [];
                const teacherProfile = teacherRes.status === 'fulfilled' ? teacherRes.value?.data : null;

                // Phase 2: Intelligence-Driven Filtration
                if (user?.role === 'teacher' && teacherProfile) {
                    const myClassIds = new Set();
                    const mySubjectIds = new Set();

                    // Synthetic assignment extraction
                    if (Array.isArray(teacherProfile.teachingAssignments)) {
                        teacherProfile.teachingAssignments.forEach(a => {
                            if (!a) return;
                            const cid = a.classId?._id || a.classId;
                            const sid = a.subjectId?._id || a.subjectId;
                            if (cid) myClassIds.add(cid.toString());
                            if (sid) mySubjectIds.add(sid.toString());
                        });
                    }

                    // Legacy/Direct array extraction
                    if (Array.isArray(teacherProfile.classes)) {
                        teacherProfile.classes.forEach(c => {
                            const id = c?._id || c;
                            if (id) myClassIds.add(id.toString());
                        });
                    }
                    if (Array.isArray(teacherProfile.subjects)) {
                        teacherProfile.subjects.forEach(s => {
                            const id = s?._id || s;
                            if (id) mySubjectIds.add(id.toString());
                        });
                    }

                    // Execute filtration protocol only if data points exist
                    if (myClassIds.size > 0) {
                        const filteredClasses = allClasses.filter(cls => myClassIds.has(cls._id.toString()));
                        if (filteredClasses.length > 0) allClasses = filteredClasses;
                    }
                    if (mySubjectIds.size > 0) {
                        const filteredSubjects = allSubjects.filter(sub => mySubjectIds.has(sub._id.toString()));
                        if (filteredSubjects.length > 0) allSubjects = filteredSubjects;
                    }
                }
                
                // Phase 3: Synchronize Local State Nodes
                setSubjects(Array.isArray(allSubjects) ? allSubjects : []);
                setClasses(Array.isArray(allClasses) ? allClasses : []);
            } catch (e) { 
                console.error('Failed to load lesson data:', e); 
            }
        };
        fetchMeta();
    }, [user, passedLesson]);

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await api.post('/lessons/generate', formData);
            setGeneratedPlan(res.data);
            setLessonNotes(res.data.lessonNotes || '');
            setCurrentStep(3);
        } catch (error) {
            alert(error.response?.data?.message || 'Error generating plan');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                classLevelId: formData.classLevel,
                subjectId: formData.subject,
                term: formData.term,
                week: formData.week,
                topic: formData.topic,
                content: generatedPlan,
                lessonNotes: formData.generateNotes ? lessonNotes : '',
                status: 'Draft' 
            };

            if (isEditing && passedLesson?._id) {
                await api.put(`/lessons/${passedLesson._id}`, payload);
                alert('Lesson Registry Updated Successfully!');
            } else {
                await api.post('/lessons', payload);
                alert('New Lesson Plan Created!');
            }
        } catch (error) {
           alert('Failed to save lesson plan.');
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="max-w-7xl mx-auto px-4 pb-32">
            
            {/* Neural Curriculum Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Sparkles size={14} className="animate-pulse" /> AI Lesson Planner
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Create New <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400 italic">Lesson Plan</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Generate detailed lesson plans, comprehensive notes, and presentation outlines using AI.
                        </p>
                    </div>

                    {!generatedPlan && (
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[3rem] border border-white/10 flex items-center gap-6">
                            <div className="flex -space-x-4">
                                {[1, 2].map(s => (
                                    <div key={s} className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg transition-all border-4 border-slate-950 ${currentStep >= s ? 'bg-primary text-white shadow-lg' : 'bg-slate-800 text-slate-500'}`}>
                                        {s}
                                    </div>
                                ))}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-lg font-black text-white leading-none">
                                    {currentStep === 1 ? 'Select Class' : 'Lesson Details'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Left Panel: High-Fidelity Wizard */}
                {!generatedPlan && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-8 lg:col-start-3"
                    >
                         <div className="bg-white rounded-[4rem] shadow-4xl border border-slate-100 overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            {/* Step 1: Basics */}
                            {currentStep === 1 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-16"
                                >
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center shadow-inner border border-slate-100">
                                            <GraduationCap size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lesson Setup</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Select class and subject node</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Target Class</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none"
                                                value={formData.classLevel}
                                                onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                                            >
                                                <option value="">Select Target Class</option>
                                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Subject</label>
                                            <select 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none"
                                                value={formData.subject}
                                                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                            >
                                                <option value="">Select Subject</option>
                                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-end pt-12 border-t border-slate-50 mt-12">
                                        <button 
                                            onClick={nextStep}
                                            disabled={!formData.classLevel || !formData.subject}
                                            className="bg-slate-950 hover:bg-black text-white px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] flex items-center gap-4 disabled:opacity-30 transition-all shadow-4xl shadow-slate-900/40"
                                        >
                                            Next Step <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 2: Content Details */}
                            {currentStep === 2 && (
                                <motion.div 
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-16"
                                >
                                    <div className="flex items-center gap-6 mb-12">
                                        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-[1.5rem] flex items-center justify-center shadow-inner border border-slate-100">
                                            <Binary size={28} />
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Lesson Details</h2>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Configure lesson information</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                             <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Term</label>
                                                <select 
                                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none"
                                                    value={formData.term}
                                                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                                                >
                                                    <option>First</option>
                                                    <option>Second</option>
                                                    <option>Third</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Week</label>
                                                 <input 
                                                    type="number"
                                                    className="w-full px-8 py-5 bg-slate-50 border-none rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                                                    value={formData.week}
                                                    onChange={(e) => setFormData({...formData, week: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Lesson Topic</label>
                                            <input 
                                                className="w-full px-8 py-6 bg-slate-50 border-none rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm text-lg"
                                                placeholder="e.g. Introduction to Photosynthesis"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                            />
                                        </div>

                                        <div className="bg-slate-950 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[50px] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />
                                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-8">What should we generate?</h3>
                                            <div className="flex flex-col md:flex-row gap-8">
                                                <label className="flex-1 flex items-center gap-4 cursor-pointer p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-all">
                                                    <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${formData.generateNotes ? 'bg-primary border-primary shadow-lg shadow-primary/40' : 'bg-transparent border-white/20'}`}>
                                                        {formData.generateNotes && <CheckCircle size={18} className="text-white" />}
                                                    </div>
                                                    <input type="checkbox" className="hidden" checked={formData.generateNotes} onChange={e => setFormData({...formData, generateNotes: e.target.checked})} />
                                                    <div>
                                                        <span className="text-xs font-black uppercase tracking-widest block">Lesson Notes</span>
                                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Detailed Content</span>
                                                    </div>
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex justify-between pt-12 border-t border-slate-50 mt-12">
                                            <button 
                                                onClick={prevStep}
                                                className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-3"
                                            >
                                                <ChevronLeft size={18} /> Back
                                            </button>
                                            <button 
                                                onClick={handleGenerate}
                                                disabled={!formData.topic || loading}
                                                className="bg-primary hover:bg-primary/90 text-white px-12 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 disabled:opacity-30 transition-all shadow-4xl shadow-primary/40"
                                            >
                                                {loading ? <Loader className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
                                                {loading ? 'Generating...' : 'Generate with AI'}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                         </div>
                    </motion.div>
                )}
                
                {/* High-Fidelity Intelligence Matrix View */}
                {generatedPlan && (
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-12 space-y-10"
                    >
                         {/* Precision Toolbar */}
                        <div className="bg-white p-6 rounded-[3rem] shadow-4xl border border-slate-100 flex flex-wrap gap-6 items-center justify-between sticky top-4 z-50 backdrop-blur-3xl bg-white/90">
                            <div className="flex items-center gap-8 px-4">
                                <button 
                                    onClick={() => setGeneratedPlan(null)}
                                    className="w-12 h-12 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl flex items-center justify-center transition-all border border-slate-100"
                                >
                                    <ChevronLeft size={24} />
                                </button>
                                <div className="h-10 w-px bg-slate-100"></div>
                                <div>
                                    <h3 className="font-black text-slate-900 tracking-tight text-xl leading-none mb-1">{formData.topic}</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Concept Visualization</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4 px-4">
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-slate-950 hover:bg-black text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center gap-4 shadow-4xl shadow-slate-900/40 transition-all disabled:opacity-50"
                                >
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} className="text-primary" />}
                                    {isEditing ? 'Save Changes' : 'Save Lesson'}
                                </button>
                            </div>
                        </div>

                        {/* Neural Matrix Tabs */}
                        <div className="flex gap-4 px-8">
                            {[
                                { id: 'plan', label: 'Lesson Plan', icon: List },
                                { id: 'notes', label: 'Lesson Notes', icon: FileText, hidden: !formData.generateNotes }
                            ].map((tab) => !tab.hidden && (
                                <button 
                                    key={tab.id}
                                    onClick={() => setResultTab(tab.id)}
                                    className={`px-10 py-5 font-black text-[10px] uppercase tracking-widest rounded-t-[2.5rem] transition-all relative flex items-center gap-3 overflow-hidden ${resultTab === tab.id ? 'bg-white text-primary shadow-[0_-20px_40px_-15px_rgba(0,0,0,0.05)] border-t border-x border-slate-100' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                                >
                                    {resultTab === tab.id && <div className="absolute top-0 left-0 w-full h-1.5 bg-primary" />}
                                    <tab.icon size={16} strokeWidth={3} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* High-Fidelity Content Matrix */}
                        <div className="bg-white rounded-[4rem] rounded-tl-none shadow-4xl border border-slate-100 min-h-[700px] overflow-hidden">
                            <AnimatePresence mode="wait">
                                {resultTab === 'plan' && (
                                    <motion.div 
                                        key="plan"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-16 space-y-16 max-w-5xl mx-auto"
                                    >
                                        <div className="border-b border-slate-50 pb-12 relative">
                                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                                <Database size={160} />
                                            </div>
                                            <div className="inline-flex items-center gap-2 bg-primary/5 text-primary px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-primary/10 mb-6">
                                                <Target size={12} fill="currentColor" /> Lesson Topic
                                            </div>
                                            <h2 className="text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">{formData.topic}</h2>
                                            <div className="flex items-center gap-6">
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                                    <GraduationCap size={14} className="text-primary" /> {classes.find(c => c._id === formData.classLevel)?.name}
                                                </p>
                                                <div className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                                                <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px] flex items-center gap-2">
                                                    <Clock size={14} className="text-primary" /> Week {formData.week} • {formData.term} Term
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-12">
                                            {/* Basic Info Row */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                <ProtocolSection title="Duration" text={generatedPlan.duration} icon={<Clock className="text-blue-500" size={24}/>} />
                                                <ProtocolSection title="Period" text={generatedPlan.period} icon={<Calendar className="text-indigo-500" size={24}/>} />
                                                <ProtocolSection title="Teacher's Name" text={generatedPlan.teachersName} icon={<Users className="text-primary" size={24}/>} />
                                            </div>
                                        
                                            <ProtocolSection title="Behavioural Objectives" items={generatedPlan.behaviouralObjectives} icon={<Target className="text-rose-500" size={24}/>} />
                                            <ProtocolSection title="Instructional Materials" items={generatedPlan.instructionalMaterials} icon={<BookOpen className="text-amber-500" size={24}/>} />
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <ProtocolSection title="Previous Knowledge" text={generatedPlan.previousKnowledge} icon={<Brain className="text-emerald-500" size={24}/>} />
                                                <ProtocolSection title="Entry Behaviour" text={generatedPlan.entryBehaviour} icon={<Sparkles className="text-purple-500" size={24}/>} />
                                            </div>
                                        
                                            <ProtocolSection title="Content" text={generatedPlan.content} icon={<FileText className="text-slate-500" size={24}/>} />
                                            <ProtocolSection title="Presentation" items={generatedPlan.presentation} icon={<Presentation className="text-primary" size={24}/>} />
                                            <ProtocolSection title="Student Activity" items={generatedPlan.studentActivity} icon={<Cpu className="text-indigo-500" size={24}/>} />
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                <ProtocolSection title="Recommended Text" items={generatedPlan.recommendedText} icon={<BookOpen className="text-amber-600" size={24}/>} />
                                                <ProtocolSection title="Reference Text" items={generatedPlan.referenceText} icon={<BookOpen className="text-amber-700" size={24}/>} />
                                            </div>
                                        
                                            <ProtocolSection title="Summary / Conclusion" text={generatedPlan.summaryConclusion} icon={<AlignLeft className="text-blue-400" size={24}/>} />
                                            <ProtocolSection title="Evaluation" items={generatedPlan.evaluation} icon={<CheckCircle size={24} className="text-emerald-500" strokeWidth={3}/>} />
                                            <ProtocolSection title="Assignment" text={generatedPlan.assignment} icon={<Edit2 className="text-rose-400" size={24}/>} />
                                            <ProtocolSection title="Remark" text={generatedPlan.remark} icon={<MessageSquare className="text-slate-400" size={24}/>} />
                                        </div>
                                    </motion.div>
                                )}

                                {resultTab === 'notes' && (
                                    <motion.div 
                                        key="notes"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="p-16 max-w-5xl mx-auto"
                                    >
                                        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6 border-b border-slate-50 pb-8">
                                             <div>
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Lesson Notes</h3>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Detailed notes for the class</p>
                                             </div>
                                             <button className="px-8 py-4 bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-100 flex items-center gap-3 transition-all">
                                                 <Copy size={16} /> Copy to Clipboard
                                             </button>
                                        </div>
                                        <div className="relative group">
                                            <div className="absolute top-8 left-8 text-primary opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity">
                                                <Terminal size={48} />
                                            </div>
                                            <textarea 
                                                className="w-full h-[700px] p-12 bg-slate-50 border border-slate-100 rounded-[3.5rem] focus:outline-none focus:ring-4 focus:ring-primary/5 leading-[2] text-slate-700 font-medium text-lg resize-none shadow-inner"
                                                value={lessonNotes}
                                                onChange={e => setLessonNotes(e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

const ProtocolSection = ({ title, items, text, icon }) => (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-50">
                {icon}
            </div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">
                {title}
            </h3>
            <div className="flex-1 h-px bg-slate-50"></div>
        </div>
        
        {text && (
            <div className="p-10 bg-slate-50/50 rounded-[3rem] border border-slate-100/50 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-16 -mt-16" />
                <p className="text-slate-600 font-medium text-lg leading-relaxed relative z-10 italic">
                    {text}
                </p>
            </div>
        )}
        
        {items && (
            <div className="grid grid-cols-1 gap-4">
                {items.map((item, i) => (
                    <motion.div 
                        whileHover={{ x: 10 }}
                        key={i} 
                        className="flex items-start gap-6 p-6 rounded-[2rem] bg-white border border-slate-50 hover:bg-slate-50 transition-all group"
                    >
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2.5 flex-shrink-0 shadow-lg shadow-primary/40 group-hover:scale-125 transition-transform" />
                        <p className="text-slate-700 font-medium text-base leading-relaxed">{item}</p>
                    </motion.div>
                ))}
            </div>
        )}
    </div>
);

export default LessonGenerator;
