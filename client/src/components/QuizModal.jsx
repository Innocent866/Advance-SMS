import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    X, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight, 
    ChevronRight, 
    ChevronLeft, 
    Trophy, 
    Clock, 
    Target,
    Zap,
    Cpu,
    ShieldCheck
} from 'lucide-react';
import api from '../utils/api';

const QuizModal = ({ videoId, onClose }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
    const [result, setResult] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/learning/quizzes/${videoId}`);
                setQuiz(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Quiz acquisition failure:', error);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [videoId]);

    const handleOptionSelect = (optIndex) => {
        setAnswers({ ...answers, [currentQuestionIndex]: optIndex });
    };

    const handleTextAnswer = (text) => {
        setAnswers({ ...answers, [currentQuestionIndex]: text });
    };

    const nextQuestion = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        const answersArray = Object.keys(answers).map(qIndex => {
            const val = answers[qIndex];
            const isText = isNaN(val); 
            return {
                questionIndex: parseInt(qIndex),
                selectedOptionIndex: isText ? null : val,
                answerText: isText ? val : null
            };
        });

        try {
            const res = await api.post('/learning/submissions', {
                quizId: quiz._id,
                answers: answersArray
            });
            setResult(res.data);
        } catch (error) {
            console.error('Submission protocol failure:', error);
            alert('Error submitting assessment');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-4xl flex flex-col items-center gap-6">
                <Cpu className="animate-spin text-primary" size={48} />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Initializing Assessment Protocol...</p>
             </div>
        </div>
    );

    if (!quiz) return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md flex items-center justify-center z-50 p-6">
             <div className="bg-white p-12 rounded-[3.5rem] shadow-4xl text-center max-w-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16" />
                <div className="bg-slate-50 p-6 rounded-[2rem] inline-flex mb-8">
                    <AlertCircle className="text-slate-300" size={48} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">No Quiz Artifact Found</h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                    This video module does not currently have an active knowledge check protocol associated with it.
                </p>
                <button 
                    onClick={onClose} 
                    className="w-full py-4 bg-slate-950 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all shadow-xl"
                >
                    Return to Cinema
                </button>
            </div>
        </div>
    );

    const qCount = quiz.questions.length;
    const progress = ((currentQuestionIndex + 1) / qCount) * 100;
    const currentQ = quiz.questions[currentQuestionIndex];
    const isLast = currentQuestionIndex === qCount - 1;

    return (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-white rounded-[4rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col relative"
            >
                {/* Protocol Header */}
                <div className="p-10 border-b border-slate-50 flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 bg-slate-50 text-primary rounded-2xl flex items-center justify-center shadow-inner border border-slate-100">
                            <Target size={24} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Knowledge Assessment</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Institutional Ingestion Check • Artifact-4022</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-12 h-12 flex items-center justify-center text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-12 relative">
                    {!result ? (
                        <>
                            {/* Progress Pulse */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-3 px-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Protocol Progress</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Step {currentQuestionIndex + 1} of {qCount}</span>
                                </div>
                                <div className="h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)]"
                                    />
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={currentQuestionIndex}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <div className="space-y-4">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 text-[9px] font-black uppercase tracking-widest text-primary">
                                            {currentQ.type === 'text' ? 'Complex Response' : 'Option Core'}
                                        </div>
                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                                            {currentQ.text}
                                        </h3>
                                    </div>

                                    {currentQ.type === 'text' ? (
                                        <div className="relative group">
                                            <textarea
                                                className="w-full p-8 bg-slate-50 border-none rounded-[2.5rem] focus:outline-none focus:ring-4 focus:ring-primary/10 font-medium text-slate-700 text-lg shadow-inner resize-none min-h-[200px]"
                                                placeholder="Initialize neural output..."
                                                value={answers[currentQuestionIndex] || ''}
                                                onChange={(e) => handleTextAnswer(e.target.value)}
                                            ></textarea>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 gap-4">
                                            {currentQ.options.map((opt, optIndex) => (
                                                <button 
                                                    key={optIndex}
                                                    onClick={() => handleOptionSelect(optIndex)}
                                                    className={`p-6 rounded-[2rem] text-left transition-all relative group overflow-hidden border ${answers[currentQuestionIndex] === optIndex ? 'bg-slate-950 border-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-white border-slate-100 text-slate-600 hover:border-primary/20 hover:bg-slate-50 shadow-sm'}`}
                                                >
                                                    <div className="relative z-10 flex items-center gap-6">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] transition-colors ${answers[currentQuestionIndex] === optIndex ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                            {String.fromCharCode(65 + optIndex)}
                                                        </div>
                                                        <span className="font-bold text-base">{opt}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12 space-y-10"
                        >
                            <div className="relative inline-flex mb-8">
                                <div className={`w-40 h-40 rounded-[3rem] flex items-center justify-center relative z-10 shadow-4xl ${result.passed ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                    <div className="text-center">
                                        <p className="text-4xl font-black leading-none">{Math.round(result.score)}%</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest mt-2">{result.passed ? 'Mastery' : 'Variance'}</p>
                                    </div>
                                </div>
                                <div className={`absolute -inset-4 rounded-[4rem] animate-pulse opacity-20 ${result.passed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                {result.passed && <Trophy className="absolute -top-4 -right-4 text-amber-500 drop-shadow-2xl" size={48} />}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
                                    {result.passed ? 'Sychronization Success' : 'Ingestion Refinement Needed'}
                                </h3>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto text-lg leading-relaxed">
                                    {result.passed 
                                        ? 'Module assessment complete. Your neural footprint in this topic meets institutional standards.' 
                                        : 'Assessment variance detected. Protocol suggests secondary review of video artifacts.'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto pt-6">
                                <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pass Rank</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{result.passed ? 'Gold' : 'None'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-[1.5rem] border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Sync</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">04:12</p>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Strategic Control Bar */}
                <div className="p-10 border-t border-slate-50 bg-slate-50/50 flex justify-between items-center relative z-10">
                    {!result ? (
                        <>
                            <button 
                                onClick={prevQuestion}
                                disabled={currentQuestionIndex === 0}
                                className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all flex items-center gap-3 disabled:opacity-0"
                            >
                                <ChevronLeft size={18} /> Protocol Back
                            </button>

                            <div className="flex gap-4">
                                {isLast ? (
                                    <button 
                                        onClick={handleSubmit}
                                        disabled={submitting || answers[currentQuestionIndex] === undefined}
                                        className="px-12 py-5 bg-primary text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-4xl shadow-primary/40 hover:bg-primary/90 transition-all disabled:opacity-30"
                                    >
                                        {submitting ? <Cpu className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                                        {submitting ? 'Committing...' : 'Commit Ingestion'}
                                    </button>
                                ) : (
                                    <button 
                                        onClick={nextQuestion}
                                        disabled={answers[currentQuestionIndex] === undefined}
                                        className="px-12 py-5 bg-slate-950 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-4 shadow-4xl shadow-black/40 hover:bg-black transition-all disabled:opacity-30"
                                    >
                                        Next Protocol <ChevronRight size={18} />
                                    </button>
                                )}
                            </div>
                        </>
                    ) : (
                        <button 
                            onClick={onClose}
                            className="w-full py-6 bg-slate-950 text-white rounded-[2.5rem] font-black text-[11px] uppercase tracking-[0.4em] flex justify-center items-center gap-6 shadow-4xl shadow-black/40 hover:bg-black transition-all"
                        >
                            <ShieldCheck size={20} className="text-primary" /> Terminate Assessment Protocol
                        </button>
                    )}
                </div>

                {/* Tech Accents */}
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary via-indigo-500 to-purple-500 opacity-20" />
            </motion.div>
        </div>
    );
};

export default QuizModal;
