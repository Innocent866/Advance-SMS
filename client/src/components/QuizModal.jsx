import { useState, useEffect } from 'react';
import api from '../utils/api';

const QuizModal = ({ videoId, onClose }) => {
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); // { questionIndex: selectedOptionIndex }
    const [result, setResult] = useState(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await api.get(`/learning/quizzes/${videoId}`);
                setQuiz(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [videoId]);

    const handleOptionSelect = (qIndex, optIndex) => {
        setAnswers({ ...answers, [qIndex]: optIndex });
    };

    const handleSubmit = async () => {
        // Transform answers to array
        const answersArray = Object.keys(answers).map(qIndex => {
            const val = answers[qIndex];
            // Check if it's an index (number) or text
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
            console.error(error);
            alert('Error submitting quiz');
        }
    };

    if (loading) return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white p-6 rounded-xl">Loading Quiz...</div>
        </div>
    );

    if (!quiz) return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
             <div className="bg-white p-6 rounded-xl text-center">
                <p className="mb-4">No quiz available for this video.</p>
                <button onClick={onClose} className="text-primary hover:underline">Close</button>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Knowledge Check</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">&times;</button>
                </div>

                {!result ? (
                    <>
                        <div className="space-y-6 mb-8">
                            {quiz.questions.map((q, qIndex) => (
                                <div key={qIndex} className="bg-gray-50 p-4 rounded-lg">
                                    <p className="font-medium text-gray-800 mb-3">
                                        {qIndex + 1}. {q.text}
                                        {q.type === 'text' && <span className="text-xs text-gray-400 ml-2">(Short Answer)</span>}
                                    </p>
                                    
                                    {q.type === 'text' ? (
                                        <textarea
                                            className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            rows="3"
                                            placeholder="Type your answer here..."
                                            value={answers[qIndex] || ''}
                                            onChange={(e) => setAnswers({ ...answers, [qIndex]: e.target.value })}
                                        ></textarea>
                                    ) : (
                                        <div className="space-y-2">
                                            {q.options.map((opt, optIndex) => (
                                                <label key={optIndex} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-100 rounded">
                                                    <input 
                                                        type="radio" 
                                                        name={`q-${qIndex}`}
                                                        checked={answers[qIndex] === optIndex}
                                                        onChange={() => setAnswers({ ...answers, [qIndex]: optIndex })}
                                                        className="text-primary focus:ring-primary"
                                                    />
                                                    <span className="text-gray-700">{opt}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button 
                                onClick={handleSubmit}
                                className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
                            >
                                Submit Answers
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-8">
                        <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 ${result.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                            <span className="text-3xl font-bold">{Math.round(result.score)}%</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">
                            {result.passed ? 'Excellent Job!' : 'Keep Practicing'}
                        </h3>
                        <p className="text-gray-500 mb-8">
                            {result.passed ? 'You have mastered this topic.' : 'Review the video and try again.'}
                        </p>
                        <button 
                            onClick={onClose}
                            className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700"
                        >
                            Back to Video
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizModal;
