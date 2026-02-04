import { useState, useEffect } from 'react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { Search, FileText } from 'lucide-react';

const ParentResults = () => {
    usePageTitle('Child Results');

    const [session, setSession] = useState('2025/2026');
    const [term, setTerm] = useState('First Term');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [config, setConfig] = useState(null);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchMetadata();
    }, []);

    const fetchMetadata = async () => {
        try {
            const resSessions = await api.get('/academic/sessions');
            setSessions(resSessions.data);
            
            const activeSession = resSessions.data.find(s => s.isActive);
            if (activeSession) {
                setSession(activeSession.name);
                setTerm(activeSession.currentTerm || 'First Term');
            } else if (resSessions.data.length > 0) {
                 setSession(resSessions.data[0].name);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (session && term) {
            fetchResults();
        }
    }, [session, term]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            
            // 1. Fetch Config for Headers
            const resConfig = await api.get(`/assessment-config?session=${session}&term=${term}`);
            setConfig(resConfig.data); 

            // 2. Fetch Child Results
            const resResults = await api.get(`/parents/child-results?session=${session}&term=${term}`);
            setResults(resResults.data);

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const components = config?.components || [];

    const getGradeColor = (grade) => {
        const g = grade ? grade.toUpperCase() : '';
        if (g === 'A') return 'bg-green-100 text-green-700';
        if (g === 'B') return 'bg-blue-100 text-blue-700';
        if (g === 'C') return 'bg-yellow-100 text-yellow-700';
        if (g === 'D') return 'bg-orange-100 text-orange-700';
        if (g === 'E') return 'bg-gray-200 text-gray-700';
        if (g === 'F') return 'bg-red-100 text-red-700';
        return 'bg-gray-100 text-gray-700';
    };

    const getDisplayGrade = (result) => {
        if (config && config.gradingScale && config.gradingScale.length > 0) {
            const total = result.totalScore || 0;
            const match = config.gradingScale.find(g => total >= g.minScore && total <= g.maxScore);
            return match ? match.grade : 'F'; 
        }
        return result.grade || '-';
    };

    return (
        <div className="max-w-5xl mx-auto">
             <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Academic Results</h1>
                    <p className="text-gray-500 text-sm">View your child's performance report.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 flex gap-4 items-end">
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Session</label>
                     <select 
                        value={session} onChange={(e) => setSession(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg outline-none"
                    >
                        {sessions.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                 <div className="flex-1">
                     <label className="block text-sm font-medium text-gray-700 mb-1">Term</label>
                     <select 
                        value={term} onChange={(e) => setTerm(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg outline-none"
                    >
                         <option>First Term</option>
                         <option>Second Term</option>
                         <option>Third Term</option>
                    </select>
                </div>
                <button 
                    onClick={fetchResults}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                    <Search size={18} />
                    <span>Check Result</span>
                </button>
            </div>

            {/* Results Table */}
            {loading ? (
                <div className="text-center py-12">Loading...</div>
            ) : (
                <>
                    {results.length > 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold text-gray-600">Subject</th>
                                        {components.map(c => (
                                            <th key={c.name} className="px-4 py-4 font-semibold text-gray-600 text-center">
                                                {c.name} <span className="text-[10px] text-gray-400">({c.maxScore})</span>
                                            </th>
                                        ))}
                                        {components.length === 0 && <th className="px-4 py-4 font-semibold text-gray-600">Scores</th>}
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center bg-gray-50">Total</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center bg-gray-50">Grade</th>
                                        <th className="px-6 py-4 font-semibold text-gray-600 text-center bg-gray-50">Remark</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {results.map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 font-medium text-gray-800">
                                                {r.subjectId?.name || 'Unknown'}
                                                <div className="text-xs text-gray-400">{r.subjectId?.code}</div>
                                            </td>
                                            {components.map(c => (
                                                <td key={c.name} className="px-4 py-4 text-center text-gray-600">
                                                    {r.scores?.[c.name] ?? '-'}
                                                </td>
                                            ))}
                                            {components.length === 0 && (
                                                <td className="px-4 py-4 text-gray-500 italic">Config missing</td>
                                            )}
                                            <td className="px-6 py-4 text-center font-bold text-gray-900 bg-gray-50">
                                                {r.totalScore}
                                            </td>
                                            <td className="px-6 py-4 text-center bg-gray-50">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${getGradeColor(getDisplayGrade(r))}`}>
                                                    {getDisplayGrade(r)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm text-gray-500 bg-gray-50">
                                                {r.remark || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                         <div className="text-center p-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                            <h3 className="text-gray-500 font-medium">No results found for this session/term.</h3>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default ParentResults;
