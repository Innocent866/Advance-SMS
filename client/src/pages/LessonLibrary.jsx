import { useState, useEffect } from 'react';
import api from '../utils/api';
import { BookOpen, Calendar, ArrowRight, Plus, Copy, Trash2, Edit2, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const LessonLibrary = () => {
    const navigate = useNavigate();
    const [lessons, setLessons] = useState([]);
    const [filteredLessons, setFilteredLessons] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({
        classLevel: '',
        subject: '',
        term: ''
    });

    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        fetchLessons();
        fetchMeta();
    }, []);

    useEffect(() => {
        // Apply Filters
        let result = lessons;
        if (filters.classLevel) {
            result = result.filter(l => l.classLevelId?._id === filters.classLevel || l.classLevelId === filters.classLevel);
        }
        if (filters.subject) {
            result = result.filter(l => l.subjectId?._id === filters.subject || l.subjectId === filters.subject);
        }
        if (filters.term) {
            result = result.filter(l => l.term === filters.term);
        }
        setFilteredLessons(result);
    }, [filters, lessons]);

    const fetchMeta = async () => {
        try {
            const [s, c] = await Promise.all([
                api.get('/academic/subjects'),
                api.get('/academic/classes')
            ]);
            setSubjects(s.data);
            setClasses(c.data);
        } catch(e) { console.error(e); }
    };

    const fetchLessons = async () => {
        try {
            const res = await api.get('/lessons');
            setLessons(res.data);
            setFilteredLessons(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;
        try {
            await api.delete(`/lessons/${id}`);
            setLessons(lessons.filter(l => l._id !== id));
        } catch (error) {
            alert('Failed to delete lesson');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                 <h1 className="text-2xl font-bold text-gray-800">Lesson Library</h1>
                 <Link 
                    to="/lessons/create"
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                    <Plus size={20} />
                    Create New
                </Link>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2 text-gray-500 font-medium">
                    <Filter size={18} /> Filters:
                </div>
                <select 
                    className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={filters.classLevel}
                    onChange={e => setFilters({...filters, classLevel: e.target.value})}
                >
                    <option value="">All Classes</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>

                <select 
                    className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={filters.subject}
                    onChange={e => setFilters({...filters, subject: e.target.value})}
                >
                    <option value="">All Subjects</option>
                    {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>

                <select 
                    className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
                    value={filters.term}
                    onChange={e => setFilters({...filters, term: e.target.value})}
                >
                    <option value="">All Terms</option>
                    <option>First</option>
                    <option>Second</option>
                    <option>Third</option>
                </select>

                <button 
                    onClick={() => setFilters({ classLevel: '', subject: '', term: '' })}
                    className="text-sm text-red-500 hover:text-red-700 ml-auto"
                >
                    Clear Filters
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredLessons.map((lesson) => (
                    <div key={lesson._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                        <div className="flex justify-between items-start mb-4">
                             <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">
                                {lesson.classLevelId?.name}
                             </span>
                             <span className="text-gray-400 text-sm">{lesson.subjectId?.name}</span>
                        </div>
                        
                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{lesson.topic}</h3>
                        
                        <div className="flex items-center text-gray-500 text-sm mb-4">
                             <Calendar size={14} className="mr-1" />
                             <span>Term {lesson.term}, Week {lesson.week}</span>
                        </div>

                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                            <span className="text-xs text-gray-400">By {lesson.teacherId?.name}</span>
                            
                            <div className="flex items-center gap-2">
                                {/* Edit */}
                                <button 
                                    onClick={() => navigate('/lessons/create', { state: { lesson, mode: 'edit' } })}
                                    className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                    title="Edit"
                                >
                                    <Edit2 size={16} />
                                </button>
                                
                                {/* Duplicate */}
                                <button 
                                    onClick={() => navigate('/lessons/create', { state: { lesson, mode: 'duplicate' } })}
                                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded"
                                    title="Duplicate"
                                >
                                    <Copy size={16} />
                                </button>

                                {/* Delete */}
                                <button 
                                    onClick={() => handleDelete(lesson._id)}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Delete"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredLessons.length === 0 && (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No lesson plans found matching filters.</p>
                </div>
            )}
        </div>
    );
};

export default LessonLibrary;
