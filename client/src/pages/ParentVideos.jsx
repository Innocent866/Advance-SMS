import { useState, useEffect } from 'react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { PlayCircle, BookOpen, Clock } from 'lucide-react';

const ParentVideos = () => {
    usePageTitle('Video Lessons');
    const [videos, setVideos] = useState([]);
    const [completedVideoIds, setCompletedVideoIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [videosRes, historyRes] = await Promise.all([
                    api.get('/parents/child-videos'),
                    api.get('/parents/child-history')
                ]);
                
                setVideos(videosRes.data);
                
                // Extract completed IDs from history
                const completedIds = new Set(historyRes.data.completedVideos.map(item => item.videoId._id || item.videoId));
                setCompletedVideoIds(completedIds);

                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const subjects = ['All', ...new Set(videos.map(v => v.subjectId?.name).filter(Boolean))];

    const filteredVideos = videos.filter(v => {
        const matchesSearch = v.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.topic.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSubject = selectedSubject === 'All' || v.subjectId?.name === selectedSubject;
        return matchesSearch && matchesSubject;
    });

    return (
        <div className="max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
            <header className="mb-6 flex justify-between items-center">
                <div>
                     <h1 className="text-2xl font-bold text-gray-800">Video Lessons</h1>
                     <p className="text-gray-500 text-sm">View lessons assigned to your child and check their progress.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
                {/* Video List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 space-y-3">
                        <input 
                            type="text" 
                            placeholder="Search lessons..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none"
                        >
                            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <p className="text-center py-8 text-gray-400 text-sm">Loading videos...</p>
                        ) : filteredVideos.length === 0 ? (
                            <p className="text-center py-8 text-gray-400 text-sm">No videos found.</p>
                        ) : (
                            filteredVideos.map(video => {
                                const isWatched = completedVideoIds.has(video._id);
                                return (
                                    <div 
                                        key={video._id}
                                        onClick={() => setSelectedVideo(video)}
                                        className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${selectedVideo?._id === video._id ? 'bg-primary/5 border border-primary/20' : 'border border-transparent'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{video.subjectId?.name}</span>
                                            {isWatched ? (
                                                <span className="text-[10px] text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">Watched</span>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Unwatched</span>
                                            )}
                                        </div>
                                        <h3 className={`font-semibold text-sm mb-1 ${selectedVideo?._id === video._id ? 'text-primary' : 'text-gray-800'}`}>{video.title}</h3>
                                        <p className="text-xs text-gray-500 line-clamp-2">{video.description}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Details Area */}
                <div className="lg:col-span-2 flex flex-col h-full overflow-y-auto">
                    {selectedVideo ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Restricted Access Banner */}
                            <div className="bg-gray-100 p-8 flex flex-col items-center justify-center text-center border-b border-gray-200">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                    <PlayCircle size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Video Playback Restricted</h3>
                                <p className="text-gray-500 max-w-md text-sm">
                                    Video content is available only to student accounts. As a parent, you can view the lesson details and track your child's completion status.
                                </p>
                            </div>

                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedVideo.title}</h2>
                                    {completedVideoIds.has(selectedVideo._id) ? (
                                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                            <Clock size={14} /> Completed
                                        </span>
                                    ) : (
                                        <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-2">
                                            <Clock size={14} /> Not Started
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                    <span className="flex items-center gap-1"><BookOpen size={16} /> {selectedVideo.subjectId?.name}</span>
                                    <span className="flex items-center gap-1"><PlayCircle size={16} /> {selectedVideo.topic}</span>
                                    <span>By {selectedVideo.teacherId?.name}</span>
                                </div>

                                <div className="prose prose-sm max-w-none text-gray-600">
                                    <h3 className="text-gray-900 font-bold mb-2">Description</h3>
                                    <p>{selectedVideo.description}</p>
                                    
                                    {selectedVideo.lessonNotes && (
                                        <>
                                            <h3 className="text-gray-900 font-bold mt-6 mb-2">Lesson Notes</h3>
                                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 whitespace-pre-wrap">
                                                {selectedVideo.lessonNotes}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-gray-400 p-8">
                            <BookOpen size={64} className="mb-4 opacity-20" />
                            <p className="text-lg font-medium">Select a lesson to view details</p>
                            <p className="text-sm">Choose from the list on the left</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ParentVideos;
