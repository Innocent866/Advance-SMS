import { useState, useEffect } from 'react';
import api from '../utils/api';
import { CheckCircle, XCircle, FileText, Video, Filter, BookOpen, ClipboardList, Eye, X } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const ContentOversight = () => {
    usePageTitle('Content Oversight');
    const [contentType, setContentType] = useState('lesson-plan');
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modal State
    const [selectedItem, setSelectedItem] = useState(null);

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
            // Determine API and Params based on Content Type
            if (contentType === 'lesson-plan' || contentType === 'video') {
                const params = { type: contentType, ...filters };
                Object.keys(params).forEach(key => !params[key] && delete params[key]);
                
                const res = await api.get('/admin/content', { params });
                setContent(res.data);
            } else {
                // Learning Materials / Assignments
                // Map IDs to Names for this API
                const selectedClass = classes.find(c => c._id === filters.classId);
                const selectedSubject = subjects.find(s => s._id === filters.subjectId);

                const params = {
                    status: filters.status || undefined,
                    classLevel: selectedClass ? selectedClass.name : undefined,
                    subject: selectedSubject ? selectedSubject.name : undefined,
                    term: filters.term || undefined
                };

                if (contentType === 'assignment') {
                    params.type = 'Assignment';
                } else if (contentType === 'material') {
                    // Fetch all non-assignment types? Or just don't specify type to get all?
                    // Let's explicitly fetch others or handle in client?
                    // The request says "materials and assignment".
                    // Let's try fetching all and filtering client side if needed, OR 
                    // Assume 'material' means Notes/Worksheets. 
                    // Let's pass no type to get all, OR loop types.
                    // Better: Let's fetch all via status endpoint logic if possible, but controller filters by exact match.
                    // Let's just NOT pass type for 'material' (shows everything) OR handle 'Assignment' specifically.
                    // If user selects 'Material', maybe they want everything EXCEPT Assignment?
                    // For simplicity, let's treat 'material' as specific types if possible, or just 'Note'.
                    // Actually, let's just use the 'type' param filter.
                    // If I put 'Note', I only get Notes.
                    // Let's leave type empty for 'material' to show ALL (Assignments + Notes) implies 'Oversight'.
                    // But if I have a separate 'Assignment' tab, 'Material' should probably exclude it?
                    // Let's decide: 'material' -> undefined type (All), 'assignment' -> 'Assignment'.
                    // Or 'material' -> 'Note' etc.
                    // Let's stick to: 'assignment' -> type='Assignment'. 'material' -> type='Note' (primary material). 
                    // Actually, to be safe and comprehensive:
                    // 'assignment' tab: type = 'Assignment'
                    // 'material' tab: type = undefined (shows all types including assignments, acting as a catch-all)
                    // Wait, that's confusing.
                    // Let's fetch ALL for 'material' tab but filter out Assignment client-side?
                }
                
                const res = await api.get('/learning-materials', { params });
                
                let data = res.data;
                if (contentType === 'material') {
                    data = data.filter(item => item.type !== 'Assignment');
                } else if (contentType === 'assignment') {
                     // Params already filtered by 'Assignment' effectively if I passed it, 
                     // but wait, I didn't set params.type for assignment above properly inside the if.
                     // Let's refactor this block.
                }
                setContent(data);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // Refactored fetch for clarity in the loop above
    // But since I can't easily break out of replace_file_content to test, I will write the logic cleanly inside.

    const handleStatusUpdate = async (id, newStatus, itemType = contentType) => {
        try {
            if (itemType === 'lesson-plan' || itemType === 'video' || itemType === 'Lesson Plan' || itemType === 'Video Lesson') {
                const typeParam = (itemType === 'video' || itemType === 'Video Lesson') ? 'Video Lesson' : 'Lesson Plan';
                 await api.post('/admin/content/status', {
                    id,
                    type: typeParam,
                    status: newStatus
                });
            } else {
                // Learning Material / Assignment
                await api.put(`/learning-materials/${id}/status`, {
                    status: newStatus
                });
            }
            fetchContent(); // Refresh
            setSelectedItem(null); // Close modal
        } catch (error) {
            alert('Error updating status');
        }
    };

    const getTypeLabel = (item) => {
        if (contentType === 'lesson-plan') return 'Lesson Plan';
        if (contentType === 'video') return 'Video Lesson';
        return item.type || 'Material'; 
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Content Oversight</h1>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8">
                <div className="flex flex-wrap gap-4 items-end">
                    
                    {/* Content Type Toggle */}
                     <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto">
                        <button 
                            onClick={() => setContentType('lesson-plan')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${contentType === 'lesson-plan' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <FileText size={16} className="inline mr-2" />
                            Lesson Plans
                        </button>
                        <button 
                            onClick={() => setContentType('video')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${contentType === 'video' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <Video size={16} className="inline mr-2" />
                            Video Lessons
                        </button>
                         <button 
                            onClick={() => setContentType('material')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${contentType === 'material' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <BookOpen size={16} className="inline mr-2" />
                            Materials
                        </button>
                         <button 
                            onClick={() => setContentType('assignment')}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${contentType === 'assignment' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
                        >
                            <ClipboardList size={16} className="inline mr-2" />
                            Assignments
                        </button>
                    </div>

                    <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block"></div>

                    {/* Dropdowns */}
                    <div className="grid grid-cols-2 md:flex gap-4">
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
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? <div className="text-center py-8">Loading content...</div> : content.map((item) => (
                    <div key={item._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                                    (item.status === 'Approved' || item.status === 'Approved') ? 'bg-green-100 text-green-700' :
                                    item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                    item.status === 'Draft' ? 'bg-gray-100 text-gray-600' :
                                    'bg-yellow-100 text-yellow-700' // Pending
                                }`}>
                                    {item.status || 'Pending'}
                                </span>
                                <span className="text-sm text-gray-400">
                                    • {item.classLevelId?.name || item.classLevel} • {item.subjectId?.name || item.subject}
                                </span>
                                {(contentType === 'material' || contentType === 'assignment') && (
                                     <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 ml-2">{item.type}</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold text-gray-800">{item.topic || item.title}</h3>
                            <p className="text-sm text-gray-500">By {item.teacherId?.name} ({item.teacherId?.email})</p>
                            
                            {/* Additional Info per type */}
                            {contentType === 'lesson-plan' && (
                                <p className="text-xs text-gray-400 mt-1">Week {item.week}, {item.term} Term</p>
                            )}
                            {(contentType === 'material' || contentType === 'assignment') && (
                                <div className='mt-2'>
                                    {item.fileUrl && (
                                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-1">
                                            <FileText size={14}/> View File
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button 
                                onClick={() => setSelectedItem(item)}
                                className="flex items-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 text-sm font-medium"
                            >
                                <Eye size={16} /> View
                            </button>

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
                                   onClick={() => handleStatusUpdate(item._id, 'Pending' + (contentType === 'lesson-plan' || contentType === 'video' ? '' : ' Approval'))}
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

            {/* PREVIEW MODAL */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                        
                        {/* Header */}
                        <div className="p-4 border-b flex justify-between items-start bg-gray-50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded textxs font-bold uppercase tracking-wider text-xs">
                                        {getTypeLabel(selectedItem)}
                                    </span>
                                    <span className="text-xs text-gray-500">• {new Date(selectedItem.createdAt).toLocaleDateString()}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedItem.topic || selectedItem.title}</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedItem.teacherId?.name} • {selectedItem.classLevelId?.name || selectedItem.classLevel} • {selectedItem.subjectId?.name || selectedItem.subject}
                                </p>
                            </div>
                            <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                                <X size={24} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content Body */}
                        <div className="flex-1 overflow-y-auto p-6 bg-white">
                            
                            {/* VIDEO PLAYER */}
                            {(contentType === 'video' || selectedItem.videoUrl) && (
                                <div className="mb-6">
                                    <div className="aspect-video bg-black rounded-lg overflow-hidden shadow-lg">
                                        {selectedItem.videoUrl ? (
                                            <iframe 
                                                src={selectedItem.videoUrl} 
                                                className="w-full h-full" 
                                                frameBorder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                                allowFullScreen
                                                title="Lesson Video"
                                            ></iframe>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Video URL</div>
                                        )}
                                    </div>
                                    <p className="mt-4 text-gray-700 font-medium">Description:</p>
                                    <p className="text-gray-600 text-sm whitespace-pre-wrap">{selectedItem.description || 'No description.'}</p>
                                </div>
                            )}

                            {/* LESSON PLAN CONTENT - Matched to Teacher View */}
                            {contentType === 'lesson-plan' && selectedItem.content && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    
                                    {/* Objectives */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                                                <ClipboardList size={20} /> {/* Using ClipboardList implies Objectives/GraduationCap substitute if needed, or import GraduationCap */}
                                            </div>
                                            Learning Objectives
                                        </h4>
                                        {selectedItem.content.objectives && Array.isArray(selectedItem.content.objectives) ? (
                                            <ul className="space-y-3">
                                                {selectedItem.content.objectives.map((obj, i) => (
                                                    <li key={i} className="flex items-start gap-3 text-gray-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                                                        <span className="leading-relaxed">{obj}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No specific objectives listed.</p>
                                        )}
                                    </div>

                                    {/* Resources */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                                                <BookOpen size={20} />
                                            </div>
                                            Teaching Resources
                                        </h4>
                                        <p className="text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            {selectedItem.content.teachingMaterial || selectedItem.content.materials || 'No specific resources listed.'}
                                        </p>
                                    </div>

                                    {/* Activities Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Teacher Activities */}
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                {/* Sparkles icon usually, check imports. We have Video, FileText etc. checking top imports... */}
                                                {/* We don't have Sparkles imported in ContentOversight, using CheckCircle as placeholder or generic */}
                                                <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                                                    <CheckCircle size={20} />
                                                </div>
                                                Teacher Activities
                                            </h4>
                                            {selectedItem.content.teacherActivities && Array.isArray(selectedItem.content.teacherActivities) ? (
                                                <ul className="space-y-3">
                                                    {selectedItem.content.teacherActivities.map((act, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                                                            <span className="leading-relaxed">{act}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-gray-400">No teacher activities listed.</p>}
                                        </div>

                                        {/* Student Activities */}
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                                {/* Clock icon in Teacher view. Using CheckCircle or similar if Clock not imported */}
                                                 <div className="p-1.5 bg-green-100 rounded-lg text-green-600">
                                                    <CheckCircle size={20} />
                                                </div>
                                                Student Activities
                                            </h4>
                                            {selectedItem.content.studentActivities && Array.isArray(selectedItem.content.studentActivities) ? (
                                                <ul className="space-y-3">
                                                    {selectedItem.content.studentActivities.map((act, i) => (
                                                        <li key={i} className="flex items-start gap-3 text-gray-700">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                                                            <span className="leading-relaxed">{act}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : <p className="text-sm text-gray-400">No student activities listed.</p>}
                                        </div>
                                    </div>

                                    {/* Evaluation */}
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                            <div className="p-1.5 bg-red-100 rounded-lg text-red-600">
                                                <ClipboardList size={20} />
                                            </div>
                                            Evaluation & Assessment
                                        </h4>
                                        {selectedItem.content.evaluation && Array.isArray(selectedItem.content.evaluation) ? (
                                            <ul className="space-y-3">
                                                {selectedItem.content.evaluation.map((qs, i) => (
                                                     <li key={i} className="flex items-start gap-3 text-gray-700">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></div>
                                                        <span className="leading-relaxed">{qs}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No evaluation questions specified.</p>
                                        )}
                                    </div>

                                    {/* Generated Notes (If available) */}
                                    {selectedItem.lessonNotes && (
                                        <div className="border-t pt-6 mt-6">
                                             <button 
                                                onClick={() => {
                                                    const el = document.getElementById('notes-content');
                                                    el.classList.toggle('hidden');
                                                }}
                                                className="flex items-center gap-2 text-gray-700 font-bold hover:text-blue-600 transition-colors mb-4 w-full text-left"
                                             >
                                                <FileText size={20} /> View Full Lesson Notes (Generated)
                                             </button>
                                             <div id="notes-content" className="hidden prose max-w-none text-sm text-gray-600 bg-gray-50 p-6 rounded-xl border-l-4 border-gray-300">
                                                 <div dangerouslySetInnerHTML={{__html: selectedItem.lessonNotes}} />
                                             </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* MATERIAL / ASSIGNMENT */}
                            {(contentType === 'material' || contentType === 'assignment') && (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="bg-gray-100 p-6 rounded-full mb-4">
                                        {contentType === 'assignment' ? <ClipboardList size={48} className="text-gray-400"/> : <BookOpen size={48} className="text-gray-400"/>}
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedItem.title}</h3>
                                    <p className="text-gray-600 max-w-md mb-6">{selectedItem.description || 'No description provided.'}</p>
                                    
                                    {selectedItem.fileUrl ? (
                                        <a 
                                            href={selectedItem.fileUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 font-medium flex items-center gap-2 transition-colors shadow-md"
                                        >
                                            <FileText size={20} /> View / Download File
                                        </a>
                                    ) : (
                                        <span className="text-red-500">File not available</span>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* Footer Actions */}
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                             <button 
                                onClick={() => setSelectedItem(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Close
                            </button>
                            {selectedItem.status !== 'Rejected' && (
                                <button 
                                    onClick={() => handleStatusUpdate(selectedItem._id, 'Rejected', getTypeLabel(selectedItem))}
                                    className="px-4 py-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <XCircle size={18} /> Reject
                                </button>
                            )}
                            {selectedItem.status !== 'Approved' && (
                                <button 
                                    onClick={() => handleStatusUpdate(selectedItem._id, 'Approved', getTypeLabel(selectedItem))}
                                    className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium transition-colors shadow-sm flex items-center gap-2"
                                >
                                    <CheckCircle size={18} /> Approve
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContentOversight;
