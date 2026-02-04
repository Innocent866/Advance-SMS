import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { Video, Play, Eye, CheckCircle, Trash2, Loader, Upload, Users, XCircle } from 'lucide-react';
import QuizManager from '../components/QuizManager';

const VideoManager = () => {
    usePageTitle('Video Manager');
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'upload'
    
    // Data
    const [videos, setVideos] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    
    // Form Data
    const [formData, setFormData] = useState({
        classLevel: '',
        subject: '',
        title: '',
        topic: '',
        description: '',
        videoUrl: '',
        lessonNotes: '',
        isPublished: true
    });

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [videoFile, setVideoFile] = useState(null);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [managingQuizVideo, setManagingQuizVideo] = useState(null);

    // Analytics State
    const [viewingAnalytics, setViewingAnalytics] = useState(null); // Video ID being viewed
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loadingAnalytics, setLoadingAnalytics] = useState(false);

    useEffect(() => {
        if(user) {
            fetchMeta();
            fetchVideos();
        }
    }, [user]);

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
        } catch(e) { console.error(e); }
    };

    const fetchVideos = async () => {
        try {
            // Fetch videos for this teacher
            if (!user?._id) return;
            const res = await api.get(`/videos?teacherId=${user._id}`);
            setVideos(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const fetchAnalytics = async (videoId) => {
        setViewingAnalytics(videoId);
        setLoadingAnalytics(true);
        try {
            const res = await api.get(`/videos/${videoId}/analytics`);
            setAnalyticsData(res.data);
        } catch (error) {
            console.error(error);
            alert('Failed to load analytics');
            setViewingAnalytics(null);
        } finally {
            setLoadingAnalytics(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const data = new FormData();
        data.append('classLevelId', formData.classLevel);
        data.append('subjectId', formData.subject);
        data.append('topic', formData.topic);
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('lessonNotes', formData.lessonNotes);
        data.append('isPublished', formData.isPublished);
        
        if (videoFile) {
            data.append('video', videoFile);
        } else if (formData.videoUrl) {
             data.append('videoUrl', formData.videoUrl);
        }

        try {
            await api.post('/videos', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Video Uploaded Successfully!');
            setFormData({
                classLevel: '', subject: '', title: '', topic: '', 
                description: '', videoUrl: '', lessonNotes: '', isPublished: true
            });
            setVideoFile(null);
            setActiveTab('list');
            fetchVideos();
        } catch (error) {
            console.error(error);
            alert('Error uploading video');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if(!confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${id}`);
            setVideos(videos.filter(v => v._id !== id));
        } catch (error) {
            alert('Error deleting video');
        }
    };

    const togglePublish = async (video) => {
        try {
            const updated = await api.put(`/videos/${video._id}`, { isPublished: !video.isPublished });
            setVideos(videos.map(v => v._id === video._id ? updated.data : v));
        } catch (error) {
            alert('Error updating status');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-6xl mx-auto relative px-4 py-6">
            {/* ... header ... */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Video className="text-primary" /> Video Lessons
                </h1>
                <div className="flex gap-2">
                     <button 
                        onClick={() => setActiveTab('list')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'list' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        My Videos
                    </button>
                    <button 
                        onClick={() => setActiveTab('upload')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'upload' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                    >
                        Upload New
                    </button>
                </div>
            </div>

            {/* Quiz Manager Modal */}
            {managingQuizVideo && (
                <QuizManager video={managingQuizVideo} onClose={() => setManagingQuizVideo(null)} />
            )}

            {/* Video Player Modal */}
            {selectedVideo && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedVideo(null)}>
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="bg-black aspect-video flex items-center justify-center">
                            {selectedVideo.videoUrl && selectedVideo.videoUrl.startsWith('/uploads') ? (
                                <video 
                                    src={`http://localhost:5001${selectedVideo.videoUrl}`} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full"
                                />
                            ) : selectedVideo.videoUrl && (selectedVideo.videoUrl.includes('youtube') || selectedVideo.videoUrl.includes('youtu.be')) ? (
                                <iframe 
                                    className="w-full h-full"
                                    src={selectedVideo.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video 
                                    src={selectedVideo.videoUrl} 
                                    controls 
                                    autoPlay 
                                    className="w-full h-full" 
                                />
                            )}
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{selectedVideo.title}</h2>
                                    <p className="text-gray-500">{selectedVideo.topic}</p>
                                </div>
                                <button onClick={() => setSelectedVideo(null)} className="text-gray-400 hover:text-gray-600">
                                    Close
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{selectedVideo.description}</p>
                            
                            {selectedVideo.lessonNotes && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-bold text-sm text-gray-700 mb-2">Lesson Notes</h3>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedVideo.lessonNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal */}
            {viewingAnalytics && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => { setViewingAnalytics(null); setAnalyticsData(null); }}>
                    <div className="bg-white rounded-2xl overflow-hidden w-full max-w-2xl shadow-2xl h-[600px] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <Users className="text-primary" size={24} />
                                    Video Analytics
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {loadingAnalytics ? 'Loading...' : `"${analyticsData?.videoTitle}"`}
                                </p>
                            </div>
                            <button onClick={() => { setViewingAnalytics(null); setAnalyticsData(null); }} className="text-gray-400 hover:text-gray-600">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {loadingAnalytics ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader className="animate-spin text-primary" size={32} />
                            </div>
                        ) : analyticsData ? (
                            <div className="flex-1 overflow-hidden flex flex-col p-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                                        <p className="text-xs font-bold text-green-600 uppercase">Completion Rate</p>
                                        <p className="text-3xl font-bold text-green-700">{analyticsData.completionRate}%</p>
                                        <p className="text-xs text-green-800 mt-1">{analyticsData.viewed.length} viewed / {analyticsData.totalStudents} assigned</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                                        <p className="text-xs font-bold text-blue-600 uppercase">Total Students</p>
                                        <p className="text-3xl font-bold text-blue-700">{analyticsData.totalStudents}</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto custom-scrollbar">
                                    {/* Viewed List */}
                                    <div className="mb-6">
                                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 sticky top-0 bg-white py-2">
                                            <CheckCircle size={16} className="text-green-500" />
                                            Watched ({analyticsData.viewed.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {analyticsData.viewed.map(student => (
                                                <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                                                    {student.profilePicture ? (
                                                        <img src={student.profilePicture} className="w-8 h-8 rounded-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.studentId} • {new Date(student.watchedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {analyticsData.viewed.length === 0 && <p className="text-sm text-gray-400 italic">No views yet.</p>}
                                        </div>
                                    </div>

                                    {/* Not Viewed List */}
                                    <div>
                                        <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2 sticky top-0 bg-white py-2">
                                            <Eye size={16} className="text-gray-400" />
                                            Not Watched ({analyticsData.notViewed.length})
                                        </h3>
                                        <div className="space-y-2">
                                            {analyticsData.notViewed.map(student => (
                                                <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 opacity-60">
                                                    {student.profilePicture ? (
                                                        <img src={student.profilePicture} className="w-8 h-8 rounded-full object-cover grayscale" alt="" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-gray-800">{student.name}</p>
                                                        <p className="text-xs text-gray-500">{student.studentId}</p>
                                                    </div>
                                                </div>
                                            ))}
                                            {analyticsData.notViewed.length === 0 && <p className="text-sm text-green-500 italic">Everyone has watched! 🎉</p>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {activeTab === 'upload' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 animate-fade-in">
                    <h2 className="text-xl font-bold mb-6">Upload Video Lesson</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div>
                            <label className="label">Class Level</label>
                            <select 
                                className="input-field"
                                value={formData.classLevel}
                                onChange={e => setFormData({...formData, classLevel: e.target.value})}
                                required
                            >
                                <option value="">Select Class</option>
                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="label">Subject</label>
                            <select 
                                className="input-field"
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                required
                            >
                                <option value="">Select Subject</option>
                                {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Topic</label>
                            <input 
                                className="input-field"
                                value={formData.topic}
                                onChange={e => setFormData({...formData, topic: e.target.value})}
                                placeholder="e.g. Newton's Laws of Motion"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Video Title</label>
                            <input 
                                className="input-field"
                                value={formData.title}
                                onChange={e => setFormData({...formData, title: e.target.value})}
                                placeholder="Lesson Title"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Video File (MP4, MOV)</label>
                            <input 
                                type="file"
                                accept="video/*"
                                className="input-field p-2"
                                onChange={e => setVideoFile(e.target.files[0])}
                            />
                            <p className="text-xs text-gray-500 mt-1">Or provide an external URL below</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Video URL (Optional if uploading file)</label>
                            <input 
                                className="input-field"
                                value={formData.videoUrl}
                                onChange={e => setFormData({...formData, videoUrl: e.target.value})}
                                placeholder="https://..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Description</label>
                            <textarea 
                                className="input-field h-24"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                placeholder="Brief description of the lesson..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="label">Lesson Notes</label>
                            <textarea 
                                className="input-field h-32"
                                value={formData.lessonNotes}
                                onChange={e => setFormData({...formData, lessonNotes: e.target.value})}
                                placeholder="Detailed notes for students..."
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-5 h-5 accent-primary"
                                    checked={formData.isPublished}
                                    onChange={e => setFormData({...formData, isPublished: e.target.checked})}
                                />
                                <span className="text-gray-700 font-medium">Publish Immediately</span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <button 
                                type="submit" 
                                disabled={submitting}
                                className="w-full btn-primary py-3 flex justify-center items-center gap-2"
                            >
                                {submitting ? <Loader className="animate-spin" /> : <Upload size={20} />}
                                Upload Video
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {activeTab === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {videos.map(video => (
                        <div 
                            key={video._id} 
                            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => setSelectedVideo(video)}
                        >
                            <div className="h-40 bg-gray-900 flex items-center justify-center relative group-hover:opacity-90 transition-opacity">
                                <Play size={48} className="text-white opacity-80" />
                                <div className="absolute top-2 right-2">
                                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${video.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {video.isPublished ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                        {video.classLevelId?.name}
                                    </span>
                                    <span className="text-xs text-gray-500">{video.subjectId?.name}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{video.title}</h3>
                                <p className="text-sm text-gray-500 mb-4">{video.topic}</p>
                                
                                <div className="flex justify-between items-center border-t border-gray-100 pt-4" onClick={e => e.stopPropagation()}>
                                    <div className="flex gap-4 text-sm text-gray-500">
                                        <button 
                                            className="flex items-center gap-1 hover:text-primary transition-colors" 
                                            title="View Analytics"
                                            onClick={(e) => { e.stopPropagation(); fetchAnalytics(video._id); }}
                                        >
                                            <Eye size={16} /> {video.views}
                                        </button>
                                    </div>
                                    
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setManagingQuizVideo(video); }}
                                            className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                                            title="Manage Quiz"
                                        >
                                            Quiz
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); togglePublish(video); }}
                                            className={`p-1.5 rounded hover:bg-gray-100 ${video.isPublished ? 'text-green-600' : 'text-gray-400'}`}
                                            title={video.isPublished ? 'Unpublish' : 'Publish'}
                                        >
                                            <CheckCircle size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleDelete(video._id); }}
                                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {videos.length === 0 && (
                        <div className="col-span-full text-center py-12 text-gray-400">
                            <Video size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No videos uploaded yet.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default VideoManager;
