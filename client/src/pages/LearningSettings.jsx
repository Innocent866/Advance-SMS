import { useState, useEffect } from 'react';
import api from '../utils/api';
import { ToggleLeft, ToggleRight, Save } from 'lucide-react';

const LearningSettings = () => {
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, s] = await Promise.all([
                    api.get('/academic/classes'),
                    api.get('/academic/subjects')
                ]);
                setClasses(c.data);
                setSubjects(s.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleClassLearning = async (classId, currentValue) => {
        try {
            await api.post('/academic/classes/settings', {
                classId,
                hasAfterSchoolLearning: !currentValue
            });
            updateLocalClass(classId, { hasAfterSchoolLearning: !currentValue });
        } catch (error) {
            alert('Error updating setting');
        }
    };

    const toggleSubjectVideo = async (classId, subjectId, currentList) => {
        const isEnabled = currentList.includes(subjectId);
        let newList;
        if (isEnabled) {
            newList = currentList.filter(id => id !== subjectId);
        } else {
            newList = [...currentList, subjectId];
        }

        try {
            await api.post('/academic/classes/settings', {
                classId,
                videoSubjects: newList
            });
            updateLocalClass(classId, { videoSubjects: newList });
        } catch (error) {
            alert('Error updating subject');
        }
    };

    const updateLocalClass = (id, updates) => {
        setClasses(prev => prev.map(c => c._id === id ? { ...c, ...updates } : c));
    };

    if(loading) return <div>Loading Settings...</div>;

    return (
        <div className="max-w-5xl mx-auto">
             <h1 className="text-2xl font-bold text-gray-800 mb-6">Learning Settings</h1>
             <p className="text-gray-500 mb-8">Control which classes have access to After-School Learning and enable/disable video lessons per subject.</p>

             <div className="space-y-6">
                {classes.map(c => (
                    <div key={c._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h3 className="font-bold text-lg">{c.name}</h3>
                                <p className="text-xs text-gray-500">{c.category} Level</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-600">After-School Learning</span>
                                <button 
                                    onClick={() => toggleClassLearning(c._id, c.hasAfterSchoolLearning)}
                                    className={`${c.hasAfterSchoolLearning ? 'text-green-600' : 'text-gray-400'}`}
                                >
                                    {c.hasAfterSchoolLearning ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                        </div>

                        {c.hasAfterSchoolLearning && (
                            <div className="p-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-4">Enabled Video Subjects</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {c.subjects?.map(subId => {
                                        // Find subject details (since c.subjects might just be IDs or populated, handle both)
                                        const subject = subjects.find(s => s._id === (subId._id || subId));
                                        if(!subject) return null;

                                        const isVideoEnabled = c.videoSubjects?.includes(subject._id);

                                        return (
                                            <button 
                                                key={subject._id}
                                                onClick={() => toggleSubjectVideo(c._id, subject._id, c.videoSubjects || [])}
                                                className={`p-3 rounded border text-sm text-left transition-colors flex justify-between items-center ${
                                                    isVideoEnabled 
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700' 
                                                    : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                <span>{subject.name}</span>
                                                <div className={`w-3 h-3 rounded-full ${isVideoEnabled ? 'bg-blue-500' : 'bg-gray-300'}`} />
                                            </button>
                                        );
                                    })}
                                    {(!c.subjects || c.subjects.length === 0) && <p className="text-sm text-gray-400 italic col-span-4">No subjects assigned to this class yet.</p>}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
             </div>
        </div>
    );
};

export default LearningSettings;
