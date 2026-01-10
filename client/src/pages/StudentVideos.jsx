import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Play, CheckCircle, Video, BookOpen, GraduationCap, Clock, Check } from 'lucide-react';
import QuizModal from '../components/QuizModal';

const StudentVideos = () => {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [showQuiz, setShowQuiz] = useState(false);
    const [activeSubject, setActiveSubject] = useState('All');
    const [completedVideoIds, setCompletedVideoIds] = useState(new Set());
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [videosRes, subjectsRes, historyRes] = await Promise.all([
                api.get('/learning/videos'),
                api.get('/learning/subjects'),
                api.get('/learning/history')
            ]);
            setVideos(videosRes.data);
            setSubjects(subjectsRes.data);
            
            // Extract completed video IDs
            const completedIds = new Set(historyRes.data.completedVideos.map(item => item.videoId._id));
            setCompletedVideoIds(completedIds);

            setLoading(false);
        } catch (error) {
            console.error(error);
            setError(error.response?.data?.message || 'Failed to load videos. Please ensuring you are assigned to a class.');
            setLoading(false);
        }
    };

    const markAsComplete = async (videoId) => {
        try {
            await api.post(`/learning/progress/${videoId}`);
            const newSet = new Set(completedVideoIds);
            newSet.add(videoId);
            setCompletedVideoIds(newSet);
        } catch (error) {
            console.error('Error marking video complete', error);
        }
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        if (url.startsWith('/uploads')) return `http://localhost:5001${url}`;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        if (match && match[2].length === 11) return `https://www.youtube.com/embed/${match[2]}`;
        return url;
    };

    const filteredVideos = activeSubject === 'All' 
        ? videos 
        : videos.filter(v => v.subjectId?._id === activeSubject);

    if (loading) return <div>Loading...</div>;

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8 text-center">
                 <div className="bg-red-50 text-red-600 p-6 rounded-xl inline-block">
                    <h3 className="font-bold text-lg mb-2">Access Issue</h3>
                    <p>{error}</p>
                 </div>
            </div>
        );
    }

    if (selectedVideo) {
        const isLocalVideo = selectedVideo.videoUrl?.startsWith('/uploads');
        const videoSrc = getEmbedUrl(selectedVideo.videoUrl);
        const isCompleted = completedVideoIds.has(selectedVideo._id);

        return (
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button 
                    onClick={() => { setSelectedVideo(null); setShowQuiz(false); }}
                    className="mb-6 text-gray-500 hover:text-primary flex items-center gap-2 font-medium transition-colors"
                >
                    &larr; Back to Library
                </button>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="bg-black rounded-2xl overflow-hidden aspect-video shadow-lg mb-6 sticky top-4">
                            {isLocalVideo ? (
                                <video 
                                    src={videoSrc} 
                                    controls 
                                    className="w-full h-full object-contain"
                                    controlsList="nodownload" 
                                    onEnded={() => markAsComplete(selectedVideo._id)}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <iframe 
                                    src={videoSrc}
                                    title={selectedVideo.title}
                                    className="w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                    allowFullScreen
                                ></iframe>
                            )}
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h1>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                            <BookOpen size={14} />
                                            {selectedVideo.subjectId?.name}
                                        </span>
                                        {isCompleted ? (
                                             <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded font-medium">
                                                <CheckCircle size={14} />
                                                Completed
                                            </span>
                                        ) : (
                                             <button 
                                                onClick={() => markAsComplete(selectedVideo._id)}
                                                className="text-primary hover:underline text-sm font-medium"
                                             >
                                                Mark as Complete
                                             </button>
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowQuiz(true)}
                                    className="bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 flex items-center gap-2 transition-colors shadow-lg shadow-green-200"
                                >
                                    <CheckCircle size={20} />
                                    Take Quiz
                                </button>
                            </div>

                            <div className="prose max-w-none text-gray-600">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                                <p>{selectedVideo.description}</p>
                                {selectedVideo.lessonNotes && (
                                    <div className="mt-8 pt-6 border-t border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <BookOpen size={20} className="text-primary"/> 
                                            Lesson Notes
                                        </h3>
                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 whitespace-pre-wrap">
                                            {selectedVideo.lessonNotes}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                       <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Up Next</h3>
                            <div className="space-y-4">
                                {videos.filter(v => v._id !== selectedVideo._id).slice(0, 3).map(v => (
                                    <div 
                                        key={v._id} 
                                        onClick={() => setSelectedVideo(v)}
                                        className="flex gap-3 cursor-pointer group"
                                    >
                                        <div className="w-24 h-16 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary/10 transition-colors relative">
                                            <Video size={20} className="text-gray-400 group-hover:text-primary"/>
                                            {completedVideoIds.has(v._id) && (
                                                <div className="absolute top-1 right-1 bg-green-500 rounded-full p-0.5 border border-white">
                                                    <Check size={8} className="text-white" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{v.title}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{v.subjectId?.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                       </div>
                    </div>
                </div>

                {showQuiz && (
                    <QuizModal videoId={selectedVideo._id} onClose={() => setShowQuiz(false)} />
                )}
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Learning Library
                {user?.classId?.name && (
                    <span className="text-primary ml-2 font-normal text-2xl">
                        &mdash; {user.classId.name}
                    </span>
                 )}
            </h1>

            {/* Subjects Filter */}
            <div className="mb-8 overflow-x-auto pb-2">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveSubject('All')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubject === 'All' ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        All Subjects
                    </button>
                    {subjects.map(sub => (
                        <button
                            key={sub._id}
                            onClick={() => setActiveSubject(sub._id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeSubject === sub._id ? 'bg-primary text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Video Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVideos.map((video) => (
                    <div 
                        key={video._id} 
                        onClick={() => setSelectedVideo(video)}
                        className="bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group overflow-hidden"
                    >
                         <div className="aspect-video bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors relative">
                            <Video className="text-gray-400 group-hover:text-primary transition-colors" size={32} />
                            
                            {completedVideoIds.has(video._id) && (
                                <div className="absolute top-2 right-2 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 shadow-sm">
                                    <CheckCircle size={12} /> Watched
                                </div>
                            )}

                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-200">
                                    <Play size={20} className="text-primary ml-1" />
                                </div>
                            </div>
                         </div>
                         <div className="p-4">
                             <div className="flex justify-between items-start mb-2">
                                <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-medium">
                                    {video.subjectId?.name}
                                </span>
                             </div>
                             <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">{video.title}</h3>
                             <p className="text-sm text-gray-500 line-clamp-2 mb-3">{video.description}</p>
                             
                             <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-50 pt-3">
                                <Clock size={12} />
                                <span>{video.classLevelId?.name}</span>
                             </div>
                         </div>
                    </div>
                ))}
            </div>

            {filteredVideos.length === 0 && (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <Video size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">No Videos Found</h3>
                    <p className="text-gray-500">There are no video lessons available for {activeSubject === 'All' ? 'your class' : 'this subject'} yet.</p>
                </div>
            )}
        </div>
    );
};

export default StudentVideos;
