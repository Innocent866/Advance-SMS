import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { 
    User, 
    Mail, 
    Phone, 
    Briefcase, 
    BookOpen, 
    Users, 
    Calendar, 
    ArrowLeft,
    ShieldCheck,
    CheckCircle,
    Star,
    Layers,
    MapPin,
    Terminal,
    Binary,
    Cpu,
    Zap,
    ExternalLink,
    ChevronRight,
    Award,
    Activity,
    Clock,
    UserCheck,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const TeacherDetails = () => {
    usePageTitle('Faculty 360° Profile');
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await api.get(`/teachers/${id}`);
                setTeacher(res.data);
            } catch (error) {
                console.error('Core sync failure:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
            />
        </div>
    );

    if (!teacher) return (
        <div className="p-20 text-center">
            <div className="w-24 h-24 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={48} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">Identity Unmapped</h1>
            <p className="text-slate-400 font-medium mb-8">The requested administrative entity does not exist in this sector.</p>
            <Link to="/teachers" className="text-primary font-black uppercase tracking-widest text-xs hover:gap-4 transition-all flex items-center justify-center gap-2">
                <ArrowLeft size={14} /> Return to Intelligence Hub
            </Link>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            <div className="mb-8">
                <Link to="/teachers" className="inline-flex items-center gap-2 text-slate-400 hover:text-primary transition-all font-black uppercase tracking-widest text-[10px] group">
                    <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:bg-primary group-hover:text-white transition-all">
                        <ArrowLeft size={14} />
                    </div>
                    Back to Hub
                </Link>
            </div>

            {/* Premium Profile Hero */}
            <div className="relative mb-8 p-12 rounded-[4rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row items-center gap-12">
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group mr-0 lg:mr-8"
                    >
                        <div className="w-48 h-48 rounded-[3.5rem] p-2 bg-gradient-to-tr from-primary to-indigo-500 shadow-2xl group-hover:rotate-6 transition-all duration-700">
                            <div className="w-full h-full rounded-[3rem] bg-slate-900 overflow-hidden relative border-4 border-slate-900 flex items-center justify-center">
                                {teacher.profilePicture ? (
                                    <img src={teacher.profilePicture} className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-slate-700" />
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-primary border-4 border-slate-900 group-hover:scale-110 transition-transform">
                            <UserCheck size={20} />
                        </div>
                    </motion.div>

                    <div className="flex-1 text-center lg:text-left space-y-4">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.2em] mb-4">
                            <Binary size={14} className="text-primary" /> Faculty Entity
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-tight">
                            {teacher.firstName} <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">{teacher.lastName}</span>
                        </h1>
                        <div className="flex flex-wrap justify-center lg:justify-start gap-4 pt-4">
                            <span className="bg-white/10 backdrop-blur-3xl px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-white/10">
                                {teacher.role?.replace('_', ' ') || 'STAFF'}
                            </span>
                            <span className="bg-primary/20 backdrop-blur-3xl text-primary px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-primary/20 flex items-center gap-2">
                                <Activity size={14} /> Active Sync
                            </span>
                            <span className="bg-indigo-500/20 backdrop-blur-3xl text-indigo-300 px-6 py-2 rounded-2xl text-xs font-black uppercase tracking-widest border border-indigo-500/20 flex items-center gap-2">
                                <Award size={14} /> {teacher.qualification || 'Global Scholar'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Identity Dashlets */}
                <div className="space-y-8">
                    {/* Intelligence Dashlet: Identity Matrix */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-2xl shadow-slate-200/50"
                    >
                        <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-slate-50 rounded-xl text-slate-400"><Cpu size={18} /></div>
                            Identity Parameters
                        </h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Digital Mail', value: teacher.email, icon: Mail, color: 'text-indigo-400' },
                                { label: 'Voice Link', value: teacher.phoneNumber || 'Unmapped', icon: Phone, color: 'text-primary' },
                                { label: 'Biological Vector', value: teacher.gender, icon: User, color: 'text-blue-400' },
                                { label: 'Employment Status', value: teacher.employmentType || 'Standard', icon: Clock, color: 'text-emerald-400' }
                            ].map((item, i) => (
                                <div key={i} className="group flex items-center gap-5 p-4 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                                    <div className={`p-3 bg-slate-50 rounded-xl ${item.color} group-hover:scale-110 transition-transform shadow-sm`}>
                                        <item.icon size={16} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.label}</p>
                                        <p className="text-sm font-bold text-slate-700 truncate">{item.value}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Geography Dashlet */}
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-indigo-950 rounded-[3rem] p-10 text-white shadow-3xl shadow-indigo-900/20 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-16 -mt-16" />
                        <h3 className="text-xl font-black mb-8 flex items-center gap-3 relative">
                            <div className="p-2 bg-white/10 rounded-xl text-primary"><MapPin size={18} /></div>
                            Residency Vector
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-6 italic">
                            "{teacher.address || 'Geographic coordinates not established in primary registry.'}"
                        </p>
                        <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary pt-6 border-t border-white/10">
                            <Globe size={14} /> Territory Mapping Enabled
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Pedagogical Hub */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Dashlet: Academic Assignments */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-[4rem] p-12 border border-slate-100 shadow-2xl shadow-slate-200/50"
                    >
                        <div className="flex justify-between items-center mb-10">
                            <h3 className="text-2xl font-black text-slate-900 flex items-center gap-4">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary"><BookOpen size={24} /></div>
                                Pedagogical Load
                            </h3>
                            <button className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-900/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                Audit Schedule <Terminal size={14} />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {teacher.teachingAssignments && teacher.teachingAssignments.length > 0 ? (
                                teacher.teachingAssignments.map((assign, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/50 transition-all hover:-translate-y-1"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                                                <Layers size={20} />
                                            </div>
                                            <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full text-[10px] font-black text-primary border border-slate-100 shadow-sm">
                                                <Zap size={10} /> PRIORITY
                                            </div>
                                        </div>
                                        <h4 className="text-lg font-black text-slate-900 mb-1">{assign.subjectId?.name || 'Academic Domain'}</h4>
                                        <p className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-2">
                                            <ChevronRight size={12} className="text-primary" /> {assign.classId?.name || 'Unassigned Sector'} {assign.arm ? `_ ARM ${assign.arm}` : ''}
                                        </p>
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                            <div className="flex -space-x-2">
                                                {[1,2,3].map(i => (
                                                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200" />
                                                ))}
                                            </div>
                                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all cursor-pointer">
                                                Registry <ExternalLink size={12} />
                                            </span>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="col-span-full py-20 text-center bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100">
                                    <BookOpen className="text-slate-200 mx-auto mb-4" size={48} />
                                    <p className="text-slate-400 font-bold">No active pedagogical assignments recorded.</p>
                                    <button className="mt-6 text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Establish Linkage</button>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Dashlet: Qualified Domains */}
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-indigo-50/50 rounded-[4.5rem] p-12 border border-indigo-100 shadow-2xl shadow-indigo-200/20"
                    >
                        <h3 className="text-2xl font-black text-slate-900 mb-10 flex items-center gap-4">
                            <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm border border-indigo-100"><Zap size={24} /></div>
                            Qualified Subject Vectors
                        </h3>
                        <div className="flex flex-wrap gap-4">
                            {teacher.subjects && teacher.subjects.length > 0 ? (
                                teacher.subjects.map((sub, idx) => (
                                    <motion.span 
                                        key={idx}
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-white px-8 py-4 rounded-3xl text-sm font-black text-indigo-900 border border-indigo-100 shadow-lg shadow-indigo-100/50 flex items-center gap-3 group cursor-default"
                                    >
                                        <Star size={14} className="text-primary fill-primary group-hover:rotate-45 transition-transform" />
                                        {sub.name}
                                    </motion.span>
                                ))
                            ) : (
                                <span className="text-slate-400 font-medium italic">No qualified domains indexed.</span>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default TeacherDetails;
