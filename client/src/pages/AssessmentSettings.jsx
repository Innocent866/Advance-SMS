import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';
import { Save, Plus, Trash2, AlertCircle } from 'lucide-react';

const AssessmentSettings = () => {
    usePageTitle('Assessment Configuration');
    const { showNotification } = useNotification();
    
    // State
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState('2025/2026'); // dynamic later?
    const [term, setTerm] = useState('First Term');
    const [components, setComponents] = useState([
        { name: 'CA1', maxScore: 20 },
        { name: 'Exam', maxScore: 80 }
    ]);
    const [gradingScale, setGradingScale] = useState([]);

    // Fetch existing config on mount or change
    useEffect(() => {
        fetchConfig();
    }, [session, term]);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/assessment-config?session=${session}&term=${term}`);
            if (res.data && res.data.components) {
                setComponents(res.data.components);
                // Load existing or default if empty (but backend sends default array if we save correctly? 
                // Careful: backend sends what is saved. If older config, might be undefined.
                if (res.data.gradingScale && res.data.gradingScale.length > 0) {
                     setGradingScale(res.data.gradingScale);
                } else {
                     // Default Frontend Fallback
                     setGradingScale([
                        { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
                        { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
                        { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
                        { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
                        { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
                        { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
                    ]);
                }
            } else {
                // Default if not found
                setComponents([
                    { name: 'CA1', maxScore: 20 },
                    { name: 'Exam', maxScore: 80 }
                ]);
                setGradingScale([
                    { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
                    { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
                    { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
                    { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
                    { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
                    { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
                ]);
            }
        } catch (error) {
            // 404 is expected if not set yet
            if (error.response?.status !== 404) {
                 console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddComponent = () => {
        setComponents([...components, { name: '', maxScore: 0 }]);
    };

    const handleRemoveComponent = (index) => {
        const newComponents = [...components];
        newComponents.splice(index, 1);
        setComponents(newComponents);
    };

    const handleChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = value;
        setComponents(newComponents);
    };

    // Grading Handlers
    const handleAddGrade = () => {
        setGradingScale([...gradingScale, { grade: '', minScore: 0, maxScore: 0, remark: '' }]);
    };
    
    const handleRemoveGrade = (index) => {
        const newScale = [...gradingScale];
        newScale.splice(index, 1);
        setGradingScale(newScale);
    };

    const handleGradeChange = (index, field, value) => {
        const newScale = [...gradingScale];
        newScale[index][field] = value;
        setGradingScale(newScale);
    };

    const totalScore = components.reduce((sum, c) => sum + Number(c.maxScore), 0);

    const handleSave = async () => {
        // Validate Total Score
        if (totalScore !== 100) {
             showNotification(`Total Max Score must be 100%. Current: ${totalScore}%`, 'error');
             return;
        }

        // Validate Unique Names
        const names = components.map(c => c.name.trim().toLowerCase());
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
            showNotification('Component names must be unique (e.g., cannot have two "Test")', 'error');
            return;
        }

        // Validate Grades (Optional strictness)
        // e.g., ensure ranges don't overlap or gaps? (Too complex for now, user trust)


        try {
            setLoading(true);
            await api.post('/assessment-config', {
                session,
                term,
                components,
                gradingScale
            });
            showNotification('Configuration saved successfully', 'success');
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Error saving config', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800">Assessment Settings</h1>
                    <p className="text-gray-500 text-sm">Configure CA and Exam weights for the term.</p>
                </div>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                        <select 
                            value={session} 
                            onChange={(e) => setSession(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option>2024/2025</option>
                            <option>2025/2026</option>
                            <option>2026/2027</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                         <select 
                            value={term} 
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                        >
                            <option>First Term</option>
                            <option>Second Term</option>
                            <option>Third Term</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-2">
                        <h3 className="font-bold text-gray-700">Components</h3>
                        <div className={`text-sm font-bold ${totalScore === 100 ? 'text-green-600' : 'text-red-500'}`}>
                            Total: {totalScore}%
                        </div>
                    </div>

                    {components.map((comp, index) => (
                        <div key={index} className="flex gap-4 items-center animate-fade-in">
                            <div className="flex-1">
                                <input
                                    placeholder="Component Name (e.g., Test)"
                                    value={comp.name}
                                    onChange={(e) => handleChange(index, 'name', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div className="w-32">
                                <input
                                    type="number"
                                    placeholder="Max Score"
                                    value={comp.maxScore}
                                    onChange={(e) => handleChange(index, 'maxScore', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <button 
                                onClick={() => handleRemoveComponent(index)}
                                className="text-red-400 hover:text-red-600 p-2"
                            >
                                <Trash2 size={20} />
                            </button>
                        </div>
                    ))}

                    <button 
                        onClick={handleAddComponent}
                        className="flex items-center space-x-2 text-primary hover:text-green-700 font-medium mt-2"
                    >
                        <Plus size={20} />
                        <span>Add Component</span>
                    </button>
                    
                    {totalScore !== 100 && (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-lg text-sm mt-4">
                            <AlertCircle size={16} />
                            <span>Total score must equal 100% to save.</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Grading Scale Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex justify-between items-center border-b pb-2 mb-4">
                    <h3 className="font-bold text-gray-700">Grading Scale</h3>
                </div>

                <div className="space-y-4">
                     <div className="grid grid-cols-12 gap-2 text-sm font-semibold text-gray-500 mb-2">
                        <div className="col-span-2">Grade</div>
                        <div className="col-span-3">Min Score</div>
                        <div className="col-span-3">Max Score</div>
                        <div className="col-span-3">Remark</div>
                        <div className="col-span-1"></div>
                    </div>

                    {gradingScale.map((g, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center animate-fade-in">
                            <div className="col-span-2">
                                <input
                                    placeholder="A"
                                    value={g.grade}
                                    onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                />
                            </div>
                            <div className="col-span-3">
                                <input
                                    type="number"
                                    placeholder="70"
                                    value={g.minScore}
                                    onChange={(e) => handleGradeChange(index, 'minScore', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                />
                            </div>
                             <div className="col-span-3">
                                <input
                                    type="number"
                                    placeholder="100"
                                    value={g.maxScore}
                                    onChange={(e) => handleGradeChange(index, 'maxScore', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                />
                            </div>
                            <div className="col-span-3">
                                <input
                                    placeholder="Excellent"
                                    value={g.remark}
                                    onChange={(e) => handleGradeChange(index, 'remark', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg outline-none"
                                />
                            </div>
                            <div className="col-span-1 text-right">
                                <button 
                                    onClick={() => handleRemoveGrade(index)}
                                    className="text-red-400 hover:text-red-600 p-2"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}

                    <button 
                        onClick={handleAddGrade}
                        className="flex items-center space-x-2 text-primary hover:text-green-700 font-medium mt-2"
                    >
                        <Plus size={20} />
                        <span>Add Grade</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentSettings;
