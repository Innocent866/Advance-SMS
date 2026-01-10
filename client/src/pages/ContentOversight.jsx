import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, FileText, Video, Filter } from 'lucide-react';

const ContentOversight = () => {
    const [contentType, setContentType] = useState('lesson-plan');
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Filters
    const [filters, setFilters] = useState({
        classId: '',
        subjectId: '',
        term: '',
        week: '',
        status: ''
    });

    // Metadata
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        const fetchMeta = async () => {
            const [c, s] = await Promise.all([
                api.get('/academic/classes'),
                api.get('/academic/subjects')
            ]);
            setClasses(c.data);
            setSubjects(s.data);
        };
        fetchMeta();
    }, []);

    useEffect(() => {
        fetchContent();
    }, [contentType, filters]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const params = { type: contentType, ...filters };
            // Remove empty filters
            Object.keys(params).forEach(key => !params[key] && delete params[key]);
            
            const res = await api.get('/admin/content', { params });
            setContent(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.post('/admin/content/status', {
                id,
                type: contentType === 'lesson-plan' ? 'Lesson Plan' : 'Video Lesson',
                status: newStatus
            });
            fetchContent(); // Refresh
        } catch (error) {
            alert('Error updating status');
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Oversight</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    
                    {/* Content Type Toggle */}
                     <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setContentType('lesson-plan')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${contentType === 'lesson-plan' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <FileText size={16} className="inline mr-2" />
                            Lesson Plans
                        </button>
                        <button 
                            onClick={() => setContentType('video')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${contentType === 'video' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <Video size={16} className="inline mr-2" />
                            Video Lessons
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2"></div>

                    {/* Dropdowns */}
                    <select 
                        className="p-2 border rounded-lg text-sm"
                        value={filters.classId} onChange={e => setFilters({...filters, classId: e.target.value})}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    <select 
                        className="p-2 border rounded-lg text-sm"
                        value={filters.subjectId} onChange={e => setFilters({...filters, subjectId: e.target.value})}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>

                     <select 
                        className="p-2 border rounded-lg text-sm"
                        value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Draft">Draft</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? <div className="text-center py-8">Loading content...</div> : content.map((item) => (
                    <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    item.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                    item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    item.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {item.status}
                                </span>
                                <span className="text-sm text-gray-400">• {item.classLevelId?.name} • {item.subjectId?.name}</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{item.topic || item.title}</h3>
                            <p className="text-sm text-gray-500">By {item.teacherId?.name} ({item.teacherId?.email})</p>
                            {contentType === 'lesson-plan' && (
                                <p className="text-xs text-gray-400 mt-1">Week {item.week}, {item.term} Term</p>
                            )}
                        </div>

                        <div className="flex gap-2">
                            {item.status !== 'Approved' && (
                                <button 
                                    onClick={() => handleStatusUpdate(item._id, 'Approved')}
                                    className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-2 rounded-lg hover:bg-green-100 text-sm font-medium"
                                >
                                    <CheckCircle size={16} /> Approve
                                </button>
                            )}
                            
                            {item.status !== 'Rejected' && (
                                <button 
                                    onClick={() => handleStatusUpdate(item._id, 'Rejected')}
                                    className="flex items-center gap-1 bg-red-50 text-red-700 px-3 py-2 rounded-lg hover:bg-red-100 text-sm font-medium"
                                >
                                    <XCircle size={16} /> Reject
                                </button>
                            )}

                             {item.status === 'Approved' && (
                                <button 
                                   onClick={() => handleStatusUpdate(item._id, 'Pending')}
                                   className="text-gray-400 hover:text-gray-600 text-xs underline px-2"
                                >
                                    Unpublish
                                </button>
                             )}
                        </div>
                    </div>
                ))}

                {!loading && content.length === 0 && (
                     <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                        <Filter size={48} className="mx-auto text-gray-300 mb-4" />
                        <p>No content found matching your filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContentOversight;
