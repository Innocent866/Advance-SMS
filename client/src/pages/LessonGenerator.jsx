import { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, Sparkles, Save, Clock, Copy, AlignLeft, List, MonitorPlay } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';

const LessonGenerator = () => {
    usePageTitle('Lesson Generator');
    const { user } = useAuth();
    const location = useLocation();

    // Redirect if not teacher
    if (user && user.role !== 'teacher') {
        return <div className="p-8 text-center text-red-600 font-bold">Access Restricted: Teachers Only</div>;
    }
    
    // Check if we are reusing (duplicating) or editing a lesson
    const passedLesson = location.state?.lesson;
    const mode = location.state?.mode || 'create'; // 'create', 'edit', 'duplicate'
    
    // ... helper state ...
    const isEditing = mode === 'edit';

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
        }

        const fetchMeta = async () => {
            try {
                // If teacher, we should filter. For now fetch all and filter client side if user.subjects exists
                const [s, c] = await Promise.all([
                    api.get('/academic/subjects'),
                    api.get('/academic/classes')
                ]);
                
                let allSubjects = s.data;
                let allClasses = c.data;

                // Filter for teachers
                if (user?.role === 'teacher' && user.subjects && user.subjects.length > 0) {
                     // user.subjects is [{ subjectId, classId, arm }]
                     // Filter classes
                     const myClassIds = user.subjects.map(sub => sub.classId);
                     allClasses = allClasses.filter(cls => myClassIds.includes(cls._id));

                     // Filter subjects (loose filter: all subjects I teach in ANY class)
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

    const handleGenerate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.post('/lessons/generate', formData);
            setGeneratedPlan(res.data);
            setLessonNotes(res.data.lessonNotes || '');
            setSlideOutline(res.data.slideOutline || []);
        } catch (error) {
            alert('Error generating plan');
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

    return (
        <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Sparkles className="text-secondary" />
                {isEditing ? 'Edit Lesson Plan' : 'AI Lesson Plan Generator'}
            </h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <form onSubmit={handleGenerate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Level</label>
                        <select 
                            className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-primary"
                            value={formData.classLevel}
                            onChange={(e) => setFormData({...formData, classLevel: e.target.value})}
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>

                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                         <select 
                            className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-primary"
                            value={formData.subject}
                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                            required
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                        <select 
                            className="w-full px-4 py-2 border rounded-lg bg-white outline-none focus:ring-1 focus:ring-primary"
                            value={formData.term}
                            onChange={(e) => setFormData({...formData, term: e.target.value})}
                        >
                            <option>First</option>
                            <option>Second</option>
                            <option>Third</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Week</label>
                         <input 
                            type="number"
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                            value={formData.week}
                            onChange={(e) => setFormData({...formData, week: e.target.value})}
                            required
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                         <input 
                            className="w-full px-4 py-2 border rounded-lg outline-none focus:ring-1 focus:ring-primary"
                            placeholder="e.g. Introduction to Algebra"
                            value={formData.topic}
                            onChange={(e) => setFormData({...formData, topic: e.target.value})}
                            required
                        />
                    </div>

                    <div className="md:col-span-2 flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 accent-primary" checked={formData.generateNotes} onChange={e => setFormData({...formData, generateNotes: e.target.checked})} />
                            <span className="text-gray-700 font-medium">Generate Lesson Notes</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" className="w-5 h-5 accent-primary" checked={formData.generateSlides} onChange={e => setFormData({...formData, generateSlides: e.target.checked})} />
                            <span className="text-gray-700 font-medium">Generate Slide Outline</span>
                        </label>
                    </div>

                    <div className="md:col-span-2">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors flex justify-center items-center gap-2"
                        >
                            {loading ? <Loader className="animate-spin" /> : <Sparkles size={20} />}
                            {generatedPlan ? 'Regenerate Content' : 'Generate Lesson Plan'}
                        </button>
                    </div>
                </form>
            </div>

            {generatedPlan && (
                <div className="space-y-8 animate-fade-in">
                    
                    {/* Main Lesson Plan */}
                    <div className="bg-white p-8 rounded-xl shadow border border-gray-100 relative">
                         <div className="absolute top-6 right-6">
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 shadow-md transition-all"
                            >
                                {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />}
                                {isEditing ? 'Update Lesson' : 'Save to Library'}
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.topic}</h2>
                        <p className="text-gray-500 mb-8">
                            {classes.find(c => c._id === formData.classLevel)?.name} • {subjects.find(s => s._id === formData.subject)?.name} • Week {formData.week}
                        </p>

                        <div className="space-y-6">
                            <Section title="Objectives" items={generatedPlan.objectives} />
                            <Section title="Teaching Material" text={generatedPlan.teachingMaterial} />
                            <Section title="Teacher Activities" items={generatedPlan.teacherActivities} />
                            <Section title="Student Activities" items={generatedPlan.studentActivities} />
                            <Section title="Evaluation" items={generatedPlan.evaluation} />
                        </div>
                    </div>

                    {/* Lesson Notes */}
                    {formData.generateNotes && (
                        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
                             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <FileText className="text-blue-500" /> Lesson Notes
                            </h3>
                            <textarea 
                                className="w-full h-64 p-4 border rounded-lg bg-gray-50 focus:bg-white transition-colors"
                                value={lessonNotes}
                                onChange={e => setLessonNotes(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Slides */}
                    {formData.generateSlides && (
                        <div className="bg-white p-8 rounded-xl shadow border border-gray-100">
                             <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Presentation className="text-orange-500" /> Slide Outline
                            </h3>
                            <div className="space-y-2">
                                {slideOutline.map((slide, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="font-bold text-gray-400">{i+1}.</span>
                                        <input 
                                            className="w-full p-2 border-b border-gray-200 focus:border-primary outline-none"
                                            value={slide}
                                            onChange={e => {
                                                const newSlides = [...slideOutline];
                                                newSlides[i] = e.target.value;
                                                setSlideOutline(newSlides);
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            )}
        </div>
    );
};

const Section = ({ title, items, text }) => (
    <div className="border-b border-gray-100 pb-4 last:border-0">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
        {text && <p className="text-gray-700 leading-relaxed">{text}</p>}
        {items && (
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
                {items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
        )}
    </div>
);

export default LessonGenerator;

