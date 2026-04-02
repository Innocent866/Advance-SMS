import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    FileText, 
    TrendingUp, 
    Award, 
    Target, 
    Calendar, 
    Filter, 
    ChevronRight, 
    Layout, 
    Zap,
    Download,
    BarChart3,
    ShieldCheck,
    UserCircle,
    Activity
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const ParentResults = () => {
    usePageTitle('Child Results');

    const [session, setSession] = useState('');
    const [term, setTerm] = useState('First Term');
    const [loading, setLoading] = useState(true);
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
            console.error('Failed to load session data:', error);
        } finally {
            setLoading(false);
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
            const resConfig = await api.get(`/assessment-config?session=${session}&term=${term}`);
            setConfig(resConfig.data); 

            const resResults = await api.get(`/parents/child-results?session=${session}&term=${term}`);
            setResults(resResults.data);
        } catch (error) {
            console.error('Failed to load results:', error);
        } finally {
            setLoading(false);
        }
    };

    const components = config?.components || [];

    const getGradeColor = (grade) => {
        const g = grade ? grade.toUpperCase() : '';
        if (g === 'A') return 'from-emerald-400 to-emerald-600 shadow-emerald-200';
        if (g === 'B') return 'from-blue-400 to-blue-600 shadow-blue-200';
        if (g === 'C') return 'from-amber-400 to-amber-600 shadow-amber-200';
        if (g === 'D') return 'from-orange-400 to-orange-600 shadow-orange-200';
        if (g === 'E') return 'from-slate-400 to-slate-600 shadow-slate-200';
        if (g === 'F') return 'from-rose-400 to-rose-600 shadow-rose-200';
        return 'from-gray-400 to-gray-600 shadow-gray-200';
    };

    const getDisplayGrade = (result) => {
        if (config && config.gradingScale && config.gradingScale.length > 0) {
            const total = result.totalScore || 0;
            const match = config.gradingScale.find(g => total >= g.minScore && total <= g.maxScore);
            return match ? match.grade : 'F'; 
        }
        return result.grade || '-';
    };

    const stats = {
        avgScore: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + (r.totalScore || 0), 0) / results.length) : 0,
        distinctions: results.filter(r => ['A', 'B'].includes(getDisplayGrade(r))).length,
        completion: results.length
    };

    if (loading && sessions.length === 0) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Neural Oversight Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <ShieldCheck size={14} /> Child Results
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            Academic <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Results</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg text-balance">
                            View a summary of your child's academic performance and grades.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[220px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">Average Score</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.avgScore}%</h3>
                            <div className="mt-4 flex items-center gap-2">
                                <Activity size={14} className="text-emerald-400" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Latest Data</span>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[220px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3">High Grades</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter">{stats.distinctions}</h3>
                            <div className="mt-4 flex items-center gap-2 text-indigo-400">
                                <Award size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">A & B Grades</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Filter Hub */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] shadow-4xl border border-slate-100 mb-12 flex flex-wrap gap-8 items-center"
            >
                <div className="flex items-center gap-4 text-slate-900 min-w-[200px]">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-slate-100">
                        <Calendar size={20} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Filter</span>
                        <span className="text-sm font-black">Select Term</span>
                    </div>
                </div>

                <div className="flex-1 flex flex-wrap gap-6 items-center lg:justify-end">
                    <div className="relative group min-w-[240px]">
                        <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                        <select 
                            value={session} 
                            onChange={(e) => setSession(e.target.value)}
                            className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                        >
                            {sessions.map(s => <option key={s._id} value={s.name}>{s.name}</option>)}
                        </select>
                    </div>

                    <div className="relative group min-w-[200px]">
                        <Layout className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={16} />
                        <select 
                            value={term} 
                            onChange={(e) => setTerm(e.target.value)}
                            className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer"
                        >
                            <option>First Term</option>
                            <option>Second Term</option>
                            <option>Third Term</option>
                        </select>
                    </div>

                    <button 
                        onClick={fetchResults}
                        className="px-8 py-4 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95 flex items-center gap-3"
                    >
                        <Zap size={14} /> Refresh
                    </button>
                </div>
            </motion.div>

            {/* Synchronized Result Matrix */}
            <div className="bg-white rounded-[3.5rem] shadow-4xl border border-slate-100 overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <Loader />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500">Subject</th>
                                {components.map(c => (
                                    <th key={c.name} className="px-6 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">
                                        {c.name}
                                        <span className="block text-[9px] opacity-40 mt-1">MAX: {c.maxScore}</span>
                                    </th>
                                ))}
                                <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-primary text-center bg-primary/5">Total</th>
                                <th className="px-8 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Grade</th>
                                <th className="px-10 py-8 text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 text-center">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode='popLayout'>
                                {results.length > 0 ? (
                                    results.map((r, i) => (
                                        <motion.tr 
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="hover:bg-slate-50/50 transition-colors group"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-white group-hover:text-primary transition-all shadow-inner">
                                                        <BarChart3 size={18} />
                                                    </div>
                                                    <div>
                                                        <div className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors">{r.subjectId?.name}</div>
                                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{r.subjectId?.code}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            {components.map(c => (
                                                <td key={c.name} className="px-6 py-8 text-center">
                                                    <span className="text-lg font-bold text-slate-600">
                                                        {r.scores?.[c.name] ?? (
                                                            <span className="text-slate-200">--</span>
                                                        )}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className="px-8 py-8 text-center bg-slate-50/30 group-hover:bg-primary/5 transition-colors">
                                                <span className="text-xl font-black text-slate-900 tracking-tighter">{r.totalScore}</span>
                                            </td>
                                            <td className="px-8 py-8 text-center">
                                                <div className="flex justify-center">
                                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getGradeColor(getDisplayGrade(r))} flex items-center justify-center text-white text-xl font-black shadow-lg shadow-opacity-20 transform group-hover:scale-110 transition-transform`}>
                                                        {getDisplayGrade(r)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="max-w-[200px] mx-auto text-center">
                                                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic line-clamp-2">
                                                        {r.remark ? `"${r.remark}"` : <span className="opacity-20">No remarks</span>}
                                                    </p>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={components.length + 4} className="py-32">
                                            <div className="flex flex-col items-center justify-center text-slate-300">
                                                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner">
                                                    <FileText size={40} />
                                                </div>
                                                <h3 className="text-xl font-black tracking-tight mb-2">No Records Found</h3>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No results found for the selected term</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {results.length > 0 && (
                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-bold">Records verified and synchronized</span>
                        </div>
                        <button className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-primary hover:border-primary transition-all shadow-sm group">
                            <Download size={14} className="group-hover:-translate-y-0.5 transition-transform" /> Download Report Card
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ParentResults;
