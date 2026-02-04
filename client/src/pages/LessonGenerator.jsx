import { useState, useEffect } from 'react';
import api from '../utils/api';
import { 
    BookOpen, Sparkles, Save, Clock, Copy, AlignLeft, List, MonitorPlay, 
    Loader2 as Loader, FileText, Presentation, ChevronRight, ChevronLeft, CheckCircle, GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const LessonGenerator = () => {
    usePageTitle('Lesson Generator');
    const { user } = useAuth();
    const location = useLocation();

    // Redirect if not teacher
    if (user && user.role !== 'teacher') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-100 max-w-md">
                   <div className="bg-red-100 p-4 rounded-full inline-flex mb-4">
                        <AlertCircle className="text-red-500" size={32} />
                   </div>
                   <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
                   <p className="text-gray-500">Only authorized teachers can access the AI Lesson Generator.</p>
                </div>
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
        generateNotes: true,
        generateSlides: true
    });

    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    
    const [generatedPlan, setGeneratedPlan] = useState(null);
    const [lessonNotes, setLessonNotes] = useState('');
    const [slideOutline, setSlideOutline] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // If reusing/editing, populate form
        if (passedLesson) {
             setFormData({
                subject: passedLesson.subjectId?._id || passedLesson.subjectId,
                classLevel: passedLesson.classLevelId?._id || passedLesson.classLevelId,
                term: passedLesson.term,
                week: passedLesson.week,
                topic: passedLesson.topic,
                generateNotes: !!passedLesson.lessonNotes,
                generateSlides: !!passedLesson.slideOutline?.length
            });
            setGeneratedPlan(passedLesson.content);
            setLessonNotes(passedLesson.lessonNotes || '');
            setSlideOutline(passedLesson.slideOutline || []);
            // If viewing/editing existing, jump to results
            if (passedLesson.content) setCurrentStep(3); 
        }

        const fetchMeta = async () => {
            try {
                const [s, c] = await Promise.all([
                    api.get('/academic/subjects'),
                    api.get('/academic/classes')
                ]);
                
                let allSubjects = s.data;
                let allClasses = c.data;

                // Filter for teachers
                if (user?.role === 'teacher' && user.subjects && user.subjects.length > 0) {
                     const myClassIds = user.subjects.map(sub => sub.classId);
                     allClasses = allClasses.filter(cls => myClassIds.includes(cls._id));

                     const mySubjectIds = user.subjects.map(sub => sub.subjectId);
                     allSubjects = allSubjects.filter(sub => mySubjectIds.includes(sub._id));
                }

                setSubjects(allSubjects);
                setClasses(allClasses);
            } catch (e) {
                console.error(e);
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
            setSlideOutline(res.data.slideOutline || []);
            setCurrentStep(3); // Move to results step
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
                slideOutline: formData.generateSlides ? slideOutline : [],
                status: 'Draft' 
            };

            if (isEditing && passedLesson?._id) {
                await api.put(`/lessons/${passedLesson._id}`, payload);
                alert('Lesson Updated Successfully!');
            } else {
                await api.post('/lessons', payload);
                alert('Lesson Created Successfully!');
            }
        } catch (error) {
           alert('Error saving plan');
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

    return (
        <div className="max-w-6xl mx-auto p-4">
            
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                            <Sparkles className="text-primary" size={24} />
                        </div>
                        {isEditing ? 'Edit Lesson Plan' : 'Lesson Generator'}
                    </h1>
                    <p className="text-gray-500 mt-2 ml-14">
                        AI-powered lesson planning for WAEC/NECO curriculum.
                    </p>
                </div>
                
                {/* Step Indicator */}
                {!generatedPlan && (
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>1</span>
                        <div className="w-8 h-0.5 bg-gray-200"></div>
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'}`}>2</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* Left Panel: Wizard Form */}
                {!generatedPlan && (
                    <div className="lg:col-span-8 lg:col-start-3">
                         <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Step 1: Basics */}
                            {currentStep === 1 && (
                                <div className="p-8 animate-fade-in">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <GraduationCap className="text-gray-400" />
                                        Class & Subject Details
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Class Level</label>
                                                <select 
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition-all"
                                                    value={formData.classLevel}
                                                    onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                                                >
                                                    <option value="">Select Class</option>
                                                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                                <select 
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition-all"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                >
                                                    <option value="">Select Subject</option>
                                                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-end pt-4">
                                            <button 
                                                onClick={nextStep}
                                                disabled={!formData.classLevel || !formData.subject}
                                                className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                Next Step <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Content Details */}
                            {currentStep === 2 && (
                                <div className="p-8 animate-fade-in">
                                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                        <BookOpen className="text-gray-400" />
                                        Lesson Details
                                    </h2>
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                             <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
                                                <select 
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition-all"
                                                    value={formData.term}
                                                    onChange={(e) => setFormData({...formData, term: e.target.value})}
                                                >
                                                    <option>First</option>
                                                    <option>Second</option>
                                                    <option>Third</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Week</label>
                                                 <input 
                                                    type="number"
                                                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition-all"
                                                    value={formData.week}
                                                    onChange={(e) => setFormData({...formData, week: e.target.value})}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Topic</label>
                                            <input 
                                                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none bg-gray-50 focus:bg-white transition-all"
                                                placeholder="e.g. Introduction to Quadratic Equations"
                                                value={formData.topic}
                                                onChange={(e) => setFormData({...formData, topic: e.target.value})}
                                            />
                                        </div>

                                        <div className="bg-green-50 p-4 rounded-xl border border-green-100 flex flex-col md:flex-row gap-6">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.generateNotes ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                                    {formData.generateNotes && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={formData.generateNotes} onChange={e => setFormData({...formData, generateNotes: e.target.checked})} />
                                                <span className="text-gray-700 font-medium">Generate Lesson Notes</span>
                                            </label>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.generateSlides ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                                    {formData.generateSlides && <CheckCircle size={14} className="text-white" />}
                                                </div>
                                                <input type="checkbox" className="hidden" checked={formData.generateSlides} onChange={e => setFormData({...formData, generateSlides: e.target.checked})} />
                                                <span className="text-gray-700 font-medium">Generate Slide Outline</span>
                                            </label>
                                        </div>

                                        <div className="flex justify-between pt-4">
                                            <button 
                                                onClick={prevStep}
                                                className="text-gray-500 hover:text-gray-700 font-bold px-4 py-3 flex items-center gap-2"
                                            >
                                                <ChevronLeft size={18} /> Back
                                            </button>
                                            <button 
                                                onClick={handleGenerate}
                                                disabled={!formData.topic || loading}
                                                className="bg-primary hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-200"
                                            >
                                                {loading ? <Loader className="animate-spin" /> : <Sparkles size={18} />}
                                                Generate Lesson Plan
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                         </div>
                    </div>
                )}
                
                {/* Result View */}
                {generatedPlan && (
                    <div className="lg:col-span-12 space-y-6 animate-fade-in-up">
                        
                         {/* Toolbar */}
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center justify-between sticky top-4 z-10">
                            <div className="flex items-center gap-4">
                                <button 
                                    onClick={() => setGeneratedPlan(null)} // Or go back to edit inputs
                                    className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 text-sm"
                                >
                                    <ChevronLeft size={16} /> New Search
                                </button>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <h3 className="font-bold text-gray-800 hidden md:block">{formData.topic}</h3>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="bg-secondary hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-all text-sm"
                                >
                                    {saving ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                                    {isEditing ? 'Update' : 'Save Lesson'}
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 border-b border-gray-200">
                            <button 
                                onClick={() => setResultTab('plan')}
                                className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${resultTab === 'plan' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                            >
                                <List size={16} />
                                Lesson Plan
                            </button>
                            {formData.generateNotes && (
                                <button 
                                    onClick={() => setResultTab('notes')}
                                    className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${resultTab === 'notes' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <FileText size={16} />
                                    Lesson Notes
                                </button>
                            )}
                            {formData.generateSlides && (
                                <button 
                                    onClick={() => setResultTab('slides')}
                                    className={`px-6 py-3 font-medium text-sm rounded-t-lg transition-colors flex items-center gap-2 ${resultTab === 'slides' ? 'bg-white border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                                >
                                    <Presentation size={16} />
                                    Slides
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="bg-white rounded-b-2xl rounded-tr-2xl shadow-sm border border-gray-100 min-h-[500px] p-8">
                            
                            {resultTab === 'plan' && (
                                <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
                                    <div className="border-b pb-6">
                                        <h2 className="text-2xl font-bold text-gray-800">{formData.topic}</h2>
                                        <p className="text-primary font-medium mt-1">
                                            {classes.find(c => c._id === formData.classLevel)?.name} • Week {formData.week} • {formData.term} Term
                                        </p>
                                    </div>
                                    
                                    <Section title="Learning Objectives" items={generatedPlan.objectives} icon={<GraduationCap className="text-blue-500"/>} />
                                    <Section title="Teaching Resources" text={generatedPlan.teachingMaterial} icon={<BookOpen className="text-orange-500"/>} />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Section title="Teacher Activities" items={generatedPlan.teacherActivities} icon={<Sparkles className="text-primary"/>} />
                                        <Section title="Student Activities" items={generatedPlan.studentActivities} icon={<Clock className="text-green-500"/>} />
                                    </div>
                                    
                                    <Section title="Evaluation & Assessment" items={generatedPlan.evaluation} icon={<CheckCircle className="text-red-500"/>} />
                                </div>
                            )}

                            {resultTab === 'notes' && (
                                <div className="max-w-4xl mx-auto animate-fade-in">
                                    <div className="flex justify-between items-center mb-4">
                                         <h3 className="text-lg font-bold text-gray-700">Detailed Lesson Notes</h3>
                                         <button className="text-primary text-sm font-bold flex items-center gap-1 hover:underline">
                                             <Copy size={14} /> Copy to Clipboard
                                         </button>
                                    </div>
                                    <textarea 
                                        className="w-full h-[600px] p-6 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary outline-none leading-relaxed text-gray-700 resize-none font-mono text-sm"
                                        value={lessonNotes}
                                        onChange={e => setLessonNotes(e.target.value)}
                                    />
                                </div>
                            )}

                            {resultTab === 'slides' && (
                                <div className="max-w-3xl mx-auto animate-fade-in">
                                    <h3 className="text-lg font-bold text-gray-700 mb-6">Presentation Outline</h3>
                                    <div className="space-y-4">
                                         {slideOutline.map((slide, i) => (
                                            <div key={i} className="flex gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100 group hover:border-green-200 transition-all">
                                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 text-primary flex items-center justify-center font-bold text-sm">
                                                    {i + 1}
                                                </div>
                                                <div className="flex-grow">
                                                     <input 
                                                        className="w-full bg-transparent border-none outline-none font-medium text-gray-800 placeholder-gray-400 group-hover:text-primary"
                                                        value={slide}
                                                        onChange={e => {
                                                            const newSlides = [...slideOutline];
                                                            newSlides[i] = e.target.value;
                                                            setSlideOutline(newSlides);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                         ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const Section = ({ title, items, text, icon }) => (
    <div className="mb-8 last:mb-0">
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            {icon} {title}
        </h3>
        {text && <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">{text}</p>}
        {items && (
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                        <span className="leading-relaxed">{item}</span>
                    </li>
                ))}
            </ul>
        )}
    </div>
);

export default LessonGenerator;
