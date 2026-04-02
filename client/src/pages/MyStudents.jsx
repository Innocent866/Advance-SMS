import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    Search, 
    Mail, 
    BookOpen, 
    UserPlus, 
    ShieldCheck, 
    Zap, 
    Layout, 
    Database, 
    ChevronRight,
    Star,
    ExternalLink,
    Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const MyStudents = () => {
    usePageTitle('My Students');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterClass, setFilterClass] = useState('all');

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students/my-students');
            setStudents(res.data);
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const classes = [...new Set(students.map(s => s.classId?.name))].filter(Boolean);

    const filteredStudents = students.filter(student => {
        const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.classId?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesClass = filterClass === 'all' || student.classId?.name === filterClass;
        return matchesSearch && matchesClass;
    });

    if (loading) return <Loader fullScreen={true} />;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20">
            {/* Neural Dashboard Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-slate-950 text-white shadow-4xl border border-white/5">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            <Users size={14} /> Faculty Oversight
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                            My <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-400 italic">Students</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-lg text-balance">
                            View and manage all students assigned to your classes and subjects.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[220px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 text-center lg:text-left">Total Students</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter text-center lg:text-left">{students.length}</h3>
                            <div className="mt-4 flex items-center gap-2 justify-center lg:justify-start">
                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em]">Active</span>
                                <div className="h-1 flex-1 bg-white/10 rounded-full overflow-hidden max-w-[80px]">
                                    <div className="h-full bg-emerald-500 w-full" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl min-w-[220px] group transition-all hover:bg-white/10">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-3 text-center lg:text-left">Total Classes</p>
                            <h3 className="text-5xl font-black text-white leading-none tracking-tighter text-center lg:text-left">{classes.length}</h3>
                            <div className="mt-4 flex items-center gap-2 justify-center lg:justify-start text-indigo-400">
                                <ShieldCheck size={14} />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Verified Access</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Command Bar */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-8 rounded-[3rem] shadow-4xl border border-slate-100 mb-12 flex flex-wrap gap-8 items-center"
            >
                <div className="flex items-center gap-4 text-slate-900">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary shadow-inner border border-slate-100">
                        <Search size={20} strokeWidth={2.5} />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Search List</span>
                </div>

                <div className="flex-1 min-w-[300px] relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" size={18} />
                    <input 
                        className="w-full pl-16 pr-8 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm transition-all"
                        placeholder="Search by name, ID or class..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            className="pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 font-bold text-slate-700 shadow-sm appearance-none cursor-pointer min-w-[200px]"
                            value={filterClass}
                            onChange={e => setFilterClass(e.target.value)}
                        >
                            <option value="all">All Classes</option>
                            {classes.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <button 
                        onClick={() => { setSearchTerm(''); setFilterClass('all'); }}
                        className="px-6 py-4 text-[10px] font-black text-rose-500 uppercase tracking-widest hover:bg-rose-50 rounded-2xl transition-all"
                    >
                        Reset
                    </button>
                </div>
            </motion.div>

            {/* Student Identity Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student, idx) => (
                        <motion.div 
                            layout
                            key={student._id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white p-8 rounded-[3.5rem] shadow-sm border border-slate-100 hover:shadow-4xl hover:border-primary/20 transition-all duration-500 group relative overflow-hidden flex flex-col"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 group-hover:bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
                            
                            <div className="flex items-center gap-6 mb-8 relative z-10">
                                <div className="relative">
                                    <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-indigo-500 rounded-full opacity-0 group-hover:opacity-20 blur transition-opacity" />
                                    {student.profilePicture ? (
                                        <img 
                                            src={student.profilePicture} 
                                            alt={student.name}
                                            className="w-20 h-20 rounded-[1.75rem] object-cover ring-4 ring-white shadow-xl relative z-10"
                                        />
                                    ) : (
                                        <div className="w-20 h-20 rounded-[1.75rem] bg-slate-950 text-white flex items-center justify-center text-3xl font-black ring-4 ring-white shadow-xl relative z-10">
                                            {student.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-primary z-20">
                                        <Star size={14} fill="currentColor" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight mb-1">{student.name}</h3>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:bg-primary/5 group-hover:border-primary/10 group-hover:text-primary transition-all">
                                        <Database size={10} /> {student.studentId || 'ID Pending'}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Class</p>
                                    <p className="text-sm font-black text-slate-700 truncate">
                                        {student.classId?.name || 'Assigned'}
                                    </p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 group-hover:bg-white transition-colors">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Group/Arm</p>
                                    <p className="text-sm font-black text-slate-700 truncate">
                                        {student.arm || 'Alpha'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8 overflow-hidden group/mail">
                                <Mail size={16} className="text-slate-300 group-hover/mail:text-primary transition-colors flex-shrink-0" />
                                <span className="text-[11px] font-bold text-slate-500 truncate">{student.email}</span>
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-50">
                                <div className="flex items-center gap-2">
                                    <Zap size={14} className="text-amber-400 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Active</span>
                                </div>
                                
                                <Link 
                                    to={`/students/${student._id}`} 
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all shadow-xl active:scale-95 group/btn"
                                >
                                    View Profile
                                    <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredStudents.length === 0 && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-32 bg-white rounded-[4rem] border-2 border-dashed border-slate-100"
                >
                    <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 text-slate-200 shadow-inner">
                        <Layout size={48} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-400 tracking-tight mb-2">No Students Found</h3>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] h-4">Try adjusting your search or filters</p>
                </motion.div>
            )}
        </div>
    );
};

export default MyStudents;
