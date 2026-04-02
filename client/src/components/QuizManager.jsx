import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';
import { 
    Plus, 
    Trash2, 
    CheckCircle, 
    FileText, 
    X, 
    ChevronDown, 
    ChevronUp, 
    Settings, 
    Search, 
    Users, 
    Layout, 
    Zap, 
    Cpu, 
    ArrowRight,
    Clock,
    Target,
    Terminal,
    Award
} from 'lucide-react';

const QuizManager = ({ video, onClose }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [view, setView] = useState('list'); // 'list', 'create', 'submissions'
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        if (video) fetchQuizzes();
    }, [video]);

    const fetchQuizzes = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/quizzes?videoId=${video._id}`);
            setQuizzes(res.data);
        } catch (error) {
            console.error('Quiz registry failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchSubmissions = async (quizId) => {
        setLoading(true);
        try {
            const res = await api.get(`/quizzes/${quizId}/submissions`);
            setSubmissions(res.data);
            setSelectedQuiz(quizzes.find(q => q._id === quizId));
            setView('submissions');
        } catch (error) {
            console.error('Submission retrieval failure:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuestion = () => {
        setQuestions([...questions, { text: '', options: ['', '', '', ''], correctAnswer: '' }]);
    };

    const handleQuestionChange = (index, field, value) => {
        const newQuestions = [...questions];
        newQuestions[index][field] = value;
        setQuestions(newQuestions);
    };

    const handleOptionChange = (qIndex, oIndex, value) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        setQuestions(newQuestions);
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/quizzes', {
                videoId: video._id,
                title,
                description,
                questions,
                duration,
                isPublished: true
            });
            setView('list');
            fetchQuizzes();
            // Reset form
            setTitle('');
            setDescription('');
            setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
        } catch (error) {
            console.error('Quiz creation failure:', error);
            alert('Error creating quiz artifact');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (!confirm('Execute deletion protocol for this artifact?')) return;
        try {
            await api.delete(`/quizzes/${id}`);
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (error) {
            console.error('Artifact deletion failure:', error);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.95, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xl">
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="bg-white rounded-[4rem] w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col relative"
            >
                {/* Tactical Header */}
                <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-white relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-slate-50 text-primary rounded-[2rem] flex items-center justify-center shadow-inner border border-slate-100">
                            <Settings size={28} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Command</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1 flex items-center gap-2">
                                <FileText size={12} className="text-primary" /> Tracking Artifact: {video?.title}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-12 relative custom-scrollbar">
                     <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                     
                     <AnimatePresence mode="wait">
                        {view === 'list' && (
                            <motion.div 
                                key="list"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 mb-12">
                                    <div className="flex items-center gap-4 px-4">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Active Assessment Nodes: {quizzes.length}</p>
                                    </div>
                                    <button 
                                        onClick={() => setView('create')} 
                                        className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-4xl shadow-primary/40 transition-all active:scale-95"
                                    >
                                        <Plus size={18} strokeWidth={3} /> Initialize New Quiz
                                    </button>
                                </div>

                                {quizzes.length === 0 ? (
                                    <div className="py-32 text-center border-2 border-dashed border-slate-100 rounded-[3.5rem] bg-slate-50/30">
                                        <Layout size={64} className="mx-auto text-slate-100 mb-6" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">No Assessment Infrastructure Detected</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {quizzes.map(quiz => (
                                            <div key={quiz._id} className="p-10 bg-white border border-slate-100 rounded-[3.5rem] shadow-sm hover:shadow-4xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden">
                                                <div className="absolute top-0 h-1.5 w-full left-0 bg-slate-50 group-hover:bg-primary transition-colors" />
                                                <div className="flex justify-between items-start mb-8">
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-primary transition-colors">{quiz.title}</h4>
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                <Clock size={10} /> {quiz.duration} MINS
                                                            </span>
                                                            <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                <Layout size={10} /> {quiz.questions.length} STEPS
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => handleDeleteQuiz(quiz._id)}
                                                            className="w-10 h-10 bg-rose-50 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    onClick={() => fetchSubmissions(quiz._id)}
                                                    className="w-full py-5 bg-slate-50 text-slate-500 rounded-2xl font-black text-[9px] uppercase tracking-widest group-hover:bg-slate-950 group-hover:text-white transition-all flex items-center justify-center gap-3"
                                                >
                                                    View Submission Pulse <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {view === 'create' && (
                            <motion.form 
                                key="create"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={handleCreateQuiz} 
                                className="space-y-12"
                            >
                                <div className="space-y-10 bg-slate-50 p-12 rounded-[3.5rem] border border-slate-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] -mr-32 -mt-32" />
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-10 relative z-10">
                                        <div className="md:col-span-3 space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Assessment Designation</label>
                                            <input 
                                                className="w-full px-8 py-5 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                                                placeholder="e.g. Mid-Term Proficiency Check"
                                                value={title} 
                                                onChange={e => setTitle(e.target.value)} 
                                                required 
                                            />
                                        </div>
                                        <div className="space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Temporal Duration</label>
                                            <div className="relative">
                                                <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                                <input 
                                                    type="number" 
                                                    className="w-full pl-16 pr-8 py-5 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm"
                                                    value={duration} 
                                                    onChange={e => setDuration(e.target.value)} 
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-4 space-y-4">
                                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-4">Metadata Brief</label>
                                            <textarea 
                                                className="w-full px-8 py-5 bg-white border border-slate-100 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm min-h-[100px] resize-none"
                                                placeholder="Optional protocol description..."
                                                value={description} 
                                                onChange={e => setDescription(e.target.value)} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex items-center gap-6 px-4">
                                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.4em]">Step Matrices</h3>
                                        <div className="flex-1 h-px bg-slate-100" />
                                    </div>
                                    
                                    {questions.map((q, qIndex) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            key={qIndex} 
                                            className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm relative group/step"
                                        >
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-[10px] shadow-xl">
                                                        {qIndex + 1}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Segment</span>
                                                </div>
                                                {questions.length > 1 && (
                                                    <button 
                                                        type="button" 
                                                        onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} 
                                                        className="w-8 h-8 bg-rose-50 text-rose-300 hover:text-rose-500 rounded-lg flex items-center justify-center transition-colors"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                )}
                                            </div>

                                            <input 
                                                className="w-full px-8 py-5 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-black text-slate-700 shadow-inner mb-8"
                                                placeholder="Enter pedagogical proposition..."
                                                value={q.text} 
                                                onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} 
                                                required 
                                            />
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {q.options.map((opt, oIndex) => (
                                                    <div key={oIndex} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${q.correctAnswer === opt && opt !== '' ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-100'}`}>
                                                        <input 
                                                            type="radio" 
                                                            name={`correct-${qIndex}`}
                                                            checked={q.correctAnswer === opt && opt !== ''}
                                                            onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)}
                                                            className="w-5 h-5 accent-emerald-500 cursor-pointer"
                                                            required
                                                        />
                                                        <input 
                                                            className="flex-1 bg-transparent border-none outline-none font-bold text-sm text-slate-700 placeholder:text-slate-300"
                                                            placeholder={`Option Branch ${String.fromCharCode(65 + oIndex)}`}
                                                            value={opt}
                                                            onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <button 
                                    type="button" 
                                    onClick={handleAddQuestion} 
                                    className="w-full py-6 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-slate-400 font-black text-[10px] uppercase tracking-widest hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex justify-center items-center gap-4 group"
                                >
                                    <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Add Question Node
                                </button>

                                <div className="pt-12 border-t border-slate-100 flex justify-between items-center">
                                    <button 
                                        type="button" 
                                        onClick={() => setView('list')} 
                                        className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                                    >
                                        Abort Session
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={loading}
                                        className="bg-primary hover:bg-primary/90 text-white px-16 py-5 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] shadow-4xl shadow-primary/40 flex items-center gap-4 transition-all"
                                    >
                                        {loading ? <Cpu className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                                        {loading ? 'Synchronizing...' : 'Deploy Assessment Artifact'}
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {view === 'submissions' && (
                            <motion.div 
                                key="submissions"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                <div className="flex justify-between items-center bg-slate-900 p-10 rounded-[3.5rem] text-white overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                                    <div className="relative z-10">
                                        <h3 className="text-2xl font-black tracking-tight mb-2">Ingestion Pulse</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student Response Analytics for "{selectedQuiz?.title}"</p>
                                    </div>
                                    <button 
                                        onClick={() => setView('list')} 
                                        className="px-8 py-3 bg-white/10 backdrop-blur-md rounded-2xl font-black text-[9px] uppercase tracking-widest border border-white/10 hover:bg-white/20 transition-all relative z-10"
                                    >
                                        Exit Analytics
                                    </button>
                                </div>

                                {submissions.length === 0 ? (
                                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3.5rem]">
                                        <Terminal size={48} className="mx-auto text-slate-100 mb-6" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Student Response Packets Captured</p>
                                    </div>
                                ) : (
                                    <div className="bg-white border border-slate-100 rounded-[3.5rem] overflow-hidden shadow-sm">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-100">
                                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Node (Student)</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Stamp</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Level</th>
                                                    <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {submissions.map(sub => (
                                                    <tr key={sub._id} className="hover:bg-slate-50/50 transition-colors group">
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xs uppercase group-hover:bg-primary group-hover:text-white transition-all">
                                                                    {sub.studentId?.name?.substring(0,2) || '??'}
                                                                </div>
                                                                <span className="font-black text-slate-900 tracking-tight">{sub.studentId?.name || 'Unknown Node'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8 text-sm font-bold text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                        <td className="px-10 py-8">
                                                            <div className="flex items-center gap-3">
                                                                <span className={`text-xl font-black ${sub.score >= 70 ? 'text-emerald-500' : 'text-primary'}`}>{sub.score}%</span>
                                                                {sub.score >= 80 && <Award size={16} className="text-amber-500" fill="currentColor" />}
                                                            </div>
                                                        </td>
                                                        <td className="px-10 py-8">
                                                            <span className="bg-emerald-50 text-emerald-600 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-emerald-100">
                                                                Validated
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </motion.div>
                        )}
                     </AnimatePresence>
                </div>
                
                {/* Tech Accents */}
                <div className="absolute top-0 right-0 w-1.5 h-full bg-gradient-to-b from-primary via-indigo-400 to-purple-500 opacity-20" />
            </motion.div>
        </div>
    );
};

export default QuizManager;
