import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    BookOpen, 
    Activity, 
    ShieldCheck, 
    Zap, 
    Fingerprint, 
    GraduationCap, 
    Map, 
    Clock, 
    ChevronRight, 
    Award, 
    Target, 
    TrendingUp,
    Contact,
    LifeBuoy,
    Hash,
    Layers
} from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';
import api from '../utils/api';

const IntelligenceModule = ({ title, icon: Icon, children, delay = 0 }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500 group"
    >
        <div className="flex items-center gap-4 mb-8 border-b border-slate-50 pb-6">
            <div className="p-3 bg-slate-900 text-white rounded-2xl group-hover:bg-primary transition-colors">
                <Icon size={20} />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        <div className="space-y-6">
            {children}
        </div>
    </motion.div>
);

const DataNode = ({ icon: Icon, label, value, color = "primary" }) => (
    <div className="flex items-center gap-4 group/node">
        <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center shadow-sm group-hover/node:scale-110 transition-transform`}>
            <Icon size={18} />
        </div>
        <div className="flex-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">{label}</span>
            <span className="text-sm font-bold text-slate-700">{value || 'N/A'}</span>
        </div>
    </div>
);

const ChildProfileParent = () => {
    usePageTitle('Student Profile Hub');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/parents/child-profile');
                setStudent(res.data);
            } catch (error) {
                console.error("Failed to fetch child profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <Loader fullScreen={true} />;
    if (!student) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <Activity size={64} className="text-slate-100 mb-4 animate-pulse" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Student Not Found</h3>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Unable to verify student profile</p>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto pb-20 px-4">
            {/* Neural Identity Header */}
            <div className="relative mb-24 rounded-[4rem] overflow-hidden shadow-3xl">
                {/* Cover Gradient */}
                <div className="h-64 bg-gradient-to-br from-slate-900 via-gray-900 to-black relative">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse" />
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-[80px] -ml-20 -mb-20" />
                    
                    <div className="absolute top-8 right-12 flex gap-3">
                        <div className={`px-5 py-2 rounded-full border border-white/10 backdrop-blur-3xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${student.isActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-ping ${student.isActive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                            {student.isActive ? 'Active Student' : 'Inactive'}
                        </div>
                    </div>
                </div>
                
                {/* Profile Biometric Overlap */}
                <div className="absolute -bottom-16 left-0 right-0 px-12 flex flex-col md:flex-row items-end gap-10">
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative group"
                    >
                        <div className="w-44 h-44 rounded-[3.5rem] border-8 border-white shadow-2xl overflow-hidden bg-slate-50 flex items-center justify-center ring-4 ring-slate-100/50">
                             <User size={80} className="text-slate-200 group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-xl border-4 border-white group-hover:rotate-12 transition-transform">
                            <Fingerprint size={20} />
                        </div>
                    </motion.div>
                    
                    <div className="mb-4 flex-1 text-center md:text-left">
                        <motion.div 
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white/90 backdrop-blur-3xl inline-block px-4 py-1.5 rounded-full border border-white/20 shadow-sm mb-4"
                        >
                            <span className="text-[10px] font-black text-slate-900 tracking-[0.2em] uppercase">Student Profile Core</span>
                        </motion.div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3">
                            {student.firstName} <span className="text-primary">{student.lastName}</span>
                        </h1>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-xl text-slate-500 text-[10px] font-black uppercase tracking-widest">
                                <Hash size={12} /> {student.studentId}
                            </div>
                            <div className="h-1 w-1 bg-slate-300 rounded-full" />
                            <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <Fingerprint size={12} className="text-indigo-400" /> Student • {student.classId?.name || 'Class'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Cognitive Performance Module */}
            <AnimatePresence>
                {student.quizProgress && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        <div className="md:col-span-2 bg-gradient-to-r from-indigo-600 to-indigo-900 p-10 rounded-[3.5rem] text-white shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] -mr-32 -mt-32" />
                            
                            <div className="relative space-y-8">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-white/10 backdrop-blur-3xl rounded-2xl flex items-center justify-center border border-white/20">
                                            <Target size={24} className="text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black tracking-tight leading-none">Academic Performance</h4>
                                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest mt-1">School Benchmarks</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-3xl font-black tabular-nums">{student.quizProgress.completionRate}%</div>
                                        <div className="text-[9px] font-black uppercase tracking-widest text-indigo-200">Completion Rate</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-100">
                                        <span>Academic Progress</span>
                                        <span>Excellent</span>
                                    </div>
                                    <div className="w-full h-4 bg-white/10 rounded-full overflow-hidden border border-white/10 p-1">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${student.quizProgress.completionRate}%` }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="h-full bg-gradient-to-r from-secondary to-blue-400 rounded-full shadow-lg"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-emerald-500 p-10 rounded-[3.5rem] text-white shadow-3xl text-center flex flex-col items-center justify-center group relative overflow-hidden">
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <TrendingUp size={48} className="text-white/20 absolute -top-4 -right-4 rotate-12" />
                            <div className="relative">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Average Quiz Score</p>
                                <h3 className="text-6xl font-black tracking-tighter tabular-nums mb-1">{student.quizProgress.averageScore || 0}<span className="text-2xl text-white/60 font-bold">%</span></h3>
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-3xl rounded-full text-[10px] font-black tracking-widest uppercase">
                                    <ShieldCheck size={12} /> High Performance
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Personal Information */}
                <IntelligenceModule title="Personal Info" icon={Contact} delay={0.1}>
                    <DataNode icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : 'N/A'} color="indigo" />
                    <DataNode icon={User} label="Gender" value={student.gender} color="blue" />
                    <DataNode icon={MapPin} label="Address" value={student.address} color="rose" />
                    <DataNode icon={Phone} label="Phone Number" value={student.phone} color="emerald" />
                    <DataNode icon={Mail} label="Email Address" value={student.email} color="primary" />
                </IntelligenceModule>

                {/* Academic Information */}
                <IntelligenceModule title="Academic Details" icon={GraduationCap} delay={0.2}>
                    <DataNode icon={Layers} label="Current Class" value={student.classId?.name} color="indigo" />
                    <DataNode icon={Activity} label="Department" value={student.department?.name} color="blue" />
                    <DataNode icon={Award} label="Admission Number" value={student.admissionNumber} color="amber" />
                    <DataNode icon={Clock} label="Enrollment Date" value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : 'N/A'} color="slate" />
                </IntelligenceModule>

                {/* Guardian Link */}
                <IntelligenceModule title="Parent/Guardian" icon={LifeBuoy} delay={0.3}>
                     <DataNode icon={User} label="Guardian Name" value={student.guardianName} color="blue" />
                     <DataNode icon={Phone} label="Guardian Phone" value={student.guardianPhone} color="emerald" />
                     <DataNode icon={Mail} label="Guardian Email" value={student.guardianEmail} color="primary" />
                     <div className="mt-8 pt-8 border-t border-slate-50">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 italic text-slate-400 text-[11px] leading-relaxed">
                            Personal and academic information synchronized from the school database.
                        </div>
                     </div>
                </IntelligenceModule>
            </div>
        </div>
    );
};

export default ChildProfileParent;
