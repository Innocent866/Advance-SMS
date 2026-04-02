import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Save, 
    Plus, 
    Trash2, 
    AlertCircle, 
    Settings2, 
    LayoutGrid, 
    CheckCircle2, 
    ChevronRight,
    Trophy,
    Target,
    Activity,
    Calendar,
    CloudUpload,
    Strikethrough,
    FileText,
    PercentCircle
} from 'lucide-react';
import api from '../utils/api';
import { useNotification } from '../context/NotificationContext';
import usePageTitle from '../hooks/usePageTitle';

const AssessmentSettings = () => {
    usePageTitle('Assessment Settings');
    const { showNotification } = useNotification();
    
    // State
    const [loading, setLoading] = useState(false);
    const [session, setSession] = useState('2025/2026'); 
    const [term, setTerm] = useState('First Term');
    const [components, setComponents] = useState([
        { name: 'CA1', maxScore: 20 },
        { name: 'Exam', maxScore: 80 }
    ]);
    const [gradingScale, setGradingScale] = useState([]);

    useEffect(() => {
        fetchConfig();
    }, [session, term]);

    const fetchConfig = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/assessment-config?session=${session}&term=${term}`);
            if (res.data && res.data.components) {
                setComponents(res.data.components);
                if (res.data.gradingScale && res.data.gradingScale.length > 0) {
                     setGradingScale(res.data.gradingScale);
                } else {
                     setGradingScale(getDefaultGradingScale());
                }
            } else {
                setComponents([
                    { name: 'CA1', maxScore: 20 },
                    { name: 'Exam', maxScore: 80 }
                ]);
                setGradingScale(getDefaultGradingScale());
            }
        } catch (error) {
            if (error.response?.status !== 404) {
                 console.error(error);
            }
        } finally {
            setLoading(false);
        }
    };

    const getDefaultGradingScale = () => [
        { grade: 'A', minScore: 70, maxScore: 100, remark: 'Excellent' },
        { grade: 'B', minScore: 60, maxScore: 69, remark: 'Very Good' },
        { grade: 'C', minScore: 50, maxScore: 59, remark: 'Credit' },
        { grade: 'D', minScore: 45, maxScore: 49, remark: 'Pass' },
        { grade: 'E', minScore: 40, maxScore: 44, remark: 'Fair' },
        { grade: 'F', minScore: 0, maxScore: 39, remark: 'Fail' }
    ];

    const handleAddComponent = () => {
        setComponents([...components, { name: '', maxScore: 0 }]);
    };

    const handleRemoveComponent = (index) => {
        const newComponents = [...components];
        newComponents.splice(index, 1);
        setComponents(newComponents);
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = value;
        setComponents(newComponents);
    };

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
        if (totalScore !== 100) {
             showNotification(`Total weight must be exactly 100%. Currently: ${totalScore}%`, 'error');
             return;
        }

        const names = components.map(c => c.name.trim().toLowerCase());
        const uniqueNames = new Set(names);
        if (uniqueNames.size !== names.length) {
            showNotification('Duplicate component names are not allowed.', 'error');
            return;
        }

        try {
            setLoading(true);
            await api.post('/assessment-config', {
                session,
                term,
                components,
                gradingScale
            });
            showNotification('Assessment settings updated', 'success');
        } catch (error) {
            console.error(error);
            showNotification(error.response?.data?.message || 'Failed to save settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            {/* Header / Hero */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                <div>
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 mb-3"
                    >
                        <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/20">
                            <Settings2 size={20} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Grading System</span>
                    </motion.div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Assessment Settings</h1>
                    <p className="text-gray-500 font-medium mt-1">Configure your grading scale and score distribution.</p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border-2 transition-all ${totalScore === 100 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                        {totalScore === 100 ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                        <span className="text-sm font-black uppercase tracking-widest">Weight: {totalScore}%</span>
                    </div>
                    <button 
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-3 bg-gray-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-gray-900/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                    >
                        <Save size={18} />
                        <span>{loading ? 'Saving...' : 'Save Settings'}</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Left Column: Components Management */}
                <div className="xl:col-span-4 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <LayoutGrid size={18} className="text-indigo-600" />
                                Term Selection
                            </h3>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Academic Session</label>
                                <div className="relative">
                                    <Calendar size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select 
                                        value={session} 
                                        onChange={(e) => setSession(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option>2024/2025</option>
                                        <option>2025/2026</option>
                                        <option>2026/2027</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block px-2">Term</label>
                                <div className="relative">
                                    <Activity size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <select 
                                        value={term} 
                                        onChange={(e) => setTerm(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option>First Term</option>
                                        <option>Second Term</option>
                                        <option>Third Term</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16"></div>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm border-t-4 border-t-indigo-500"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Target size={18} className="text-indigo-600" />
                                Score Distribution
                            </h3>
                            <button 
                                onClick={handleAddComponent}
                                className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                            >
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <AnimatePresence mode="popLayout">
                                {components.map((comp, index) => (
                                    <motion.div 
                                        key={index}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="p-5 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:border-indigo-100 transition-all"
                                    >
                                        <div className="flex gap-3 mb-4">
                                            <div className="flex-1">
                                                <input
                                                    placeholder="Component (e.g. CA1)"
                                                    value={comp.name}
                                                    onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm font-black text-gray-700 placeholder:text-gray-300"
                                                />
                                            </div>
                                            <div className="w-24 relative">
                                                <input
                                                    type="number"
                                                    value={comp.maxScore}
                                                    onChange={(e) => handleComponentChange(index, 'maxScore', e.target.value)}
                                                    className="w-full pl-4 pr-8 py-3 bg-white border-2 border-transparent focus:border-indigo-500 rounded-xl outline-none text-sm font-black text-gray-700 no-spinners"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-300">%</span>
                                            </div>
                                            <button 
                                                onClick={() => handleRemoveComponent(index)}
                                                className="p-3 text-gray-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div 
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(comp.maxScore, 100)}%` }}
                                                className={`h-full ${index % 2 === 0 ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                                            />
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {totalScore !== 100 && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mt-8 p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600"
                            >
                                <AlertCircle size={20} className="shrink-0" />
                                    Total must reach 100% to save.
                            </motion.div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column: Grading Scale */}
                <div className="xl:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-sm relative overflow-hidden min-h-full"
                    >
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Trophy size={20} className="text-amber-500" />
                                    Grading Scale
                                </h3>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Define grade ranges and remarks</p>
                            </div>
                            <button 
                                onClick={handleAddGrade}
                                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-100 transition-all active:scale-95"
                            >
                                <Plus size={16} />
                                Add Grade
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-24">Grade</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-32">Min Score</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center w-32">Max Score</th>
                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-10">Remark</th>
                                        <th className="px-6 py-4 w-12"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {gradingScale.map((grade, index) => (
                                        <motion.tr 
                                            key={index}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + index * 0.05 }}
                                            className="group hover:bg-gray-50/30 transition-colors"
                                        >
                                            <td className="px-6 py-4">
                                                <input
                                                    value={grade.grade}
                                                    onChange={(e) => handleGradeChange(index, 'grade', e.target.value)}
                                                    className="w-full px-3 py-3 bg-transparent text-center font-black text-gray-900 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none"
                                                    placeholder="A"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={grade.minScore}
                                                    onChange={(e) => handleGradeChange(index, 'minScore', e.target.value)}
                                                    className="w-full px-3 py-3 bg-transparent text-center font-black text-gray-700 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none"
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={grade.maxScore}
                                                    onChange={(e) => handleGradeChange(index, 'maxScore', e.target.value)}
                                                    className="w-full px-3 py-3 bg-transparent text-center font-black text-gray-700 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none"
                                                    placeholder="100"
                                                />
                                            </td>
                                            <td className="px-6 py-4 px-10">
                                                <input
                                                    value={grade.remark}
                                                    onChange={(e) => handleGradeChange(index, 'remark', e.target.value)}
                                                    className="w-full px-6 py-3 bg-transparent font-bold text-gray-500 border-2 border-transparent focus:border-amber-500 focus:bg-white rounded-xl outline-none"
                                                    placeholder="Describe achievement..."
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => handleRemoveGrade(index)}
                                                    className="p-2 text-gray-200 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {gradingScale.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                                <Strikethrough size={64} className="text-gray-200 mb-6" />
                                <h4 className="text-xl font-black text-gray-900">No Grading Scale</h4>
                                <p className="text-sm font-medium text-gray-400 mt-2">Add your first grade to start.</p>
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mb-32"></div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentSettings;
