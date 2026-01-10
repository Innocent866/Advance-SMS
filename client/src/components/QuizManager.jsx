import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Plus, Trash2, CheckCircle, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

const QuizManager = ({ video, onClose }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [view, setView] = useState('list'); // 'list', 'create', 'submissions'
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [submissions, setSubmissions] = useState([]);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [questions, setQuestions] = useState([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
    const [duration, setDuration] = useState(10);

    useEffect(() => {
        if (video) fetchQuizzes();
    }, [video]);

    const fetchQuizzes = async () => {
        try {
            const res = await api.get(`/quizzes?videoId=${video._id}`);
            setQuizzes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchSubmissions = async (quizId) => {
        try {
            const res = await api.get(`/quizzes/${quizId}/submissions`);
            setSubmissions(res.data);
            setView('submissions');
        } catch (error) {
            console.error(error);
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
        try {
            await api.post('/quizzes', {
                videoId: video._id,
                title,
                description,
                questions,
                duration,
                isPublished: true
            });
            alert('Quiz Created!');
            setView('list');
            fetchQuizzes();
            // Reset form
            setTitle('');
            setDescription('');
            setQuestions([{ text: '', options: ['', '', '', ''], correctAnswer: '' }]);
        } catch (error) {
            console.error(error);
            alert('Error creating quiz');
        }
    };

    const handleDeleteQuiz = async (id) => {
        if (!confirm('Delete this quiz?')) return;
        try {
            await api.delete(`/quizzes/${id}`);
            setQuizzes(quizzes.filter(q => q._id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Manage Quizzes</h2>
                        <p className="text-sm text-gray-500">For video: {video.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
                </div>

                <div className="p-6 flex-1">
                    {view === 'list' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-gray-700">Existing Quizzes</h3>
                                <button onClick={() => setView('create')} className="btn-primary py-2 px-4 flex items-center gap-2 text-sm">
                                    <Plus size={16} /> Create Quiz
                                </button>
                            </div>

                            {quizzes.length === 0 ? (
                                <p className="text-center text-gray-400 py-8">No quizzes yet. Create one!</p>
                            ) : (
                                <div className="grid gap-4">
                                    {quizzes.map(quiz => (
                                        <div key={quiz._id} className="border p-4 rounded-lg flex justify-between items-center hover:bg-gray-50">
                                            <div>
                                                <h4 className="font-bold">{quiz.title}</h4>
                                                <p className="text-sm text-gray-500">{quiz.questions.length} Questions • {quiz.duration} mins</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => fetchSubmissions(quiz._id)}
                                                    className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium"
                                                >
                                                    Submissions
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteQuiz(quiz._id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {view === 'create' && (
                        <form onSubmit={handleCreateQuiz} className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">Create New Quiz</h3>
                                <button type="button" onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="label">Quiz Title</label>
                                    <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="label">Description (Optional)</label>
                                    <textarea className="input-field h-20" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <div>
                                    <label className="label">Duration (Minutes)</label>
                                    <input type="number" className="input-field" value={duration} onChange={e => setDuration(e.target.value)} />
                                </div>
                            </div>

                            <div className="space-y-6 border-t pt-6">
                                {questions.map((q, qIndex) => (
                                    <div key={qIndex} className="bg-gray-50 p-4 rounded-lg relative group">
                                        <div className="flex justify-between mb-2">
                                            <label className="text-sm font-bold text-gray-700">Question {qIndex + 1}</label>
                                            {questions.length > 1 && (
                                                <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qIndex))} className="text-red-400 hover:text-red-600">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                        <input 
                                            className="input-field mb-3" 
                                            placeholder="Enter question text..."
                                            value={q.text} 
                                            onChange={e => handleQuestionChange(qIndex, 'text', e.target.value)} 
                                            required 
                                        />
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-primary/20">
                                            {q.options.map((opt, oIndex) => (
                                                <div key={oIndex} className="flex items-center gap-2">
                                                    <input 
                                                        type="radio" 
                                                        name={`correct-${qIndex}`}
                                                        checked={q.correctAnswer === opt && opt !== ''}
                                                        onChange={() => handleQuestionChange(qIndex, 'correctAnswer', opt)}
                                                        className="accent-primary cursor-pointer w-4 h-4"
                                                        required
                                                        title="Mark as correct answer"
                                                    />
                                                    <input 
                                                        className="input-field text-sm py-1.5"
                                                        placeholder={`Option ${oIndex + 1}`}
                                                        value={opt}
                                                        onChange={e => handleOptionChange(qIndex, oIndex, e.target.value)}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        {(!q.correctAnswer && q.options.some(o => o)) && <p className="text-xs text-red-500 mt-2">* Please select the correct answer by clicking the radio button.</p>}
                                    </div>
                                ))}
                            </div>

                            <button type="button" onClick={handleAddQuestion} className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-primary hover:text-primary transition-colors flex justify-center items-center gap-2">
                                <Plus size={20} /> Add Question
                            </button>

                            <div className="pt-4 border-t flex justify-end gap-3">
                                <button type="button" onClick={() => setView('list')} className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
                                <button type="submit" className="btn-primary px-8">Save Quiz</button>
                            </div>
                        </form>
                    )}

                    {view === 'submissions' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg">Submissions</h3>
                                <button onClick={() => setView('list')} className="text-sm text-gray-500 hover:text-gray-700">Back to Quizzes</button>
                            </div>

                            {submissions.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">No students have taken this quiz yet.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3">Student</th>
                                                <th className="px-6 py-3">Date</th>
                                                <th className="px-6 py-3">Score</th>
                                                <th className="px-6 py-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map(sub => (
                                                <tr key={sub._id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900">{sub.studentId?.name || 'Unknown'}</td>
                                                    <td className="px-6 py-4">{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 font-bold text-primary">{sub.score} pts</td>
                                                    <td className="px-6 py-4">
                                                        <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Graded</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QuizManager;
