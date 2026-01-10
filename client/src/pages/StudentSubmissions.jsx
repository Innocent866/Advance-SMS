import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

const StudentSubmissions = () => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const res = await api.get('/learning/submissions');
            setSubmissions(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-8">My Tasks & Assessments</h1>

            {submissions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-20" />
                    <p>You haven't taken any quizzes yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {submissions.map((sub) => (
                        <div key={sub._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-gray-900 text-lg mb-1">
                                    {sub.quizId?.title || 'Untitled Quiz'}
                                </h3>
                                <p className="text-gray-500 text-sm mb-2">{sub.quizId?.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <Clock size={14} />
                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                    </span>
                                    <span>
                                        Score: <span className="font-semibold text-gray-900">{Math.round(sub.score)}%</span>
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                                    sub.passed 
                                    ? 'bg-green-100 text-green-700' 
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                    {sub.passed ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                    {sub.passed ? 'Passed' : 'Review Needed'}
                                </div>
                            </div>

                            {/* Feedback Section (if any) */}
                            {sub.feedback && (
                                <div className="w-full md:w-auto mt-4 md:mt-0 bg-blue-50 border border-blue-100 p-4 rounded-lg max-w-md">
                                    <p className="text-xs font-bold text-blue-800 mb-1">Teacher Feedback:</p>
                                    <p className="text-sm text-blue-900">{sub.feedback}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentSubmissions;
