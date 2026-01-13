import { useState, useEffect } from 'react';
import api from '../utils/api';
import { Clock, CheckCircle, Video, FileText, BarChart } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const StudentHistory = () => {
    usePageTitle('Learning History');
    const [history, setHistory] = useState({ completedVideos: [], submissions: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all'); // all, lessons, quizzes

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await api.get('/learning/history');
                setHistory(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    if (loading) return <div>Loading...</div>;

    const { completedVideos, submissions } = history;

    // Calculate Basic Progress
    // Note: Total videos logic would require fetching all videos count, for MVP we show "completed count"
    const totalCompleted = completedVideos.length + submissions.length;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learning History</h1>
            <p className="text-gray-500 mb-8">Track your progress and completed activities covering {totalCompleted} items.</p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                        <Video size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Lessons Watched</p>
                        <h3 className="text-2xl font-bold text-gray-900">{completedVideos.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Quizzes Taken</p>
                        <h3 className="text-2xl font-bold text-gray-900">{submissions.length}</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                        <BarChart size={24} />
                    </div>
                    <div>
                         {/* Average Score */}
                        <p className="text-sm text-gray-500">Average Score</p>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {submissions.length > 0 
                                ? Math.round(submissions.reduce((acc, curr) => acc + curr.score, 0) / submissions.length) + '%' 
                                : 'N/A'
                            }
                        </h3>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-6">
                <button 
                    onClick={() => setActiveTab('all')}
                    className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'all' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    All Activity
                    {activeTab === 'all' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('lessons')}
                    className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'lessons' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Completed Lessons
                    {activeTab === 'lessons' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('quizzes')}
                    className={`pb-3 font-medium text-sm transition-colors relative ${activeTab === 'quizzes' ? 'text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Completed Tasks
                    {activeTab === 'quizzes' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary"></div>}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4">
                {/* Lessons List */}
                {(activeTab === 'all' || activeTab === 'lessons') && completedVideos.map((item) => (
                    <div key={`vid-${item._id}`} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:border-blue-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                <Video size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{item.videoId?.title || 'Unknown Video'}</h4>
                                <p className="text-xs text-gray-500">
                                    {item.videoId?.subjectId?.name} • Watched on {new Date(item.watchedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-green-600">
                            <CheckCircle size={18} />
                        </div>
                    </div>
                ))}

                {/* Quizzes List */}
                {(activeTab === 'all' || activeTab === 'quizzes') && submissions.map((sub) => (
                    <div key={`sub-${sub._id}`} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:border-purple-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-800">{sub.quizId?.title || 'Untitled Quiz'}</h4>
                                <p className="text-xs text-gray-500">
                                    Submitted on {new Date(sub.submittedAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`block font-bold ${sub.passed ? 'text-green-600' : 'text-red-600'}`}>
                                {Math.round(sub.score)}%
                            </span>
                            <span className="text-xs text-gray-400">Score</span>
                        </div>
                    </div>
                ))}

                {completedVideos.length === 0 && submissions.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No activity recorded yet.
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentHistory;
