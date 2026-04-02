import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import logo from '../assets/logo.png';
import { 
    Loader2, 
    CheckCircle, 
    XCircle, 
    Plus, 
    User, 
    Camera, 
    Info,
    Fingerprint,
    UserCheck,
    History,
    Sparkles,
    ShieldCheck,
    Layers,
    Clock,
    ArrowRight,
    ArrowLeft,
    ChevronRight,
    Layout,
    Mail,
    Phone,
    MapPin,
    Calendar,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BulkStudentUpload = () => {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    
    const [status, setStatus] = useState('verifying'); // verifying, error, ready, uploading, completed
    const [error, setError] = useState(null);
    const [context, setContext] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        gender: 'Male',
        email: '',
        enrollmentStatus: 'Day'
    });
    
    const [file, setFile] = useState(null);
    const [previewURL, setPreviewURL] = useState(null);
    const [submittedName, setSubmittedName] = useState("");

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setError('Missing upload token. Please use the link provided by your administrator.');
            return;
        }
        verifyToken();
    }, [token]);

    const verifyToken = async () => {
        try {
            const response = await api.post('/students/verify-upload-token', { token });
            setContext(response.data.context);
            setStatus('ready');
        } catch (err) {
            console.error('Token verification failed:', err.response?.data);
            setStatus('error');
            setError(err.response?.data?.message || 'Invalid or expired upload link.');
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewURL(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.firstName || !formData.lastName || !formData.email) {
            alert('Please fill all required fields');
            return;
        }

        setStatus('uploading');
        try {
            const data = new FormData();
            data.append('token', token);
            data.append('firstName', formData.firstName);
            data.append('lastName', formData.lastName);
            data.append('email', formData.email);
            data.append('gender', formData.gender);
            data.append('enrollmentStatus', formData.enrollmentStatus);
            if (file) {
                data.append('profilePicture', file);
            }

            await api.post('/students/bulk-upload', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmittedName(`${formData.firstName} ${formData.lastName}`);
            setStatus('completed');
        } catch (err) {
            setStatus('ready');
            const msg = err.response?.data?.message || 'Failed to submit student details.';
            alert(msg);
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            gender: 'Male',
            email: '',
            enrollmentStatus: 'Day'
        });
        setFile(null);
        setPreviewURL(null);
        setStatus('ready');
    };

    // Shared Layout Wrapper with Decorative Elements
    const PortalLayout = ({ children, title, subtitle }) => (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background Orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] -mr-96 -mt-96 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[100px] -ml-64 -mb-64" />
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>
            
            <div className="max-w-4xl w-full relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center mb-12"
                >
                    <img src={logo} alt="School Logo" className="h-16 w-auto mb-8 grayscale hover:grayscale-0 transition-all cursor-pointer" />
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight italic">
                            {title}
                        </h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">
                            {subtitle}
                        </p>
                    </div>
                </motion.div>
                {children}
            </div>
        </div>
    );

    if (status === 'verifying') {
        return (
            <PortalLayout title="Verifying Authorization" subtitle="Authenticating Upload Session">
                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-24 text-center shadow-3xl">
                    <div className="relative w-24 h-24 mx-auto mb-10">
                        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-primary">
                            <Fingerprint size={32} />
                        </div>
                    </div>
                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest animate-pulse">
                        Synchronizing Identity Matrix...
                    </p>
                </div>
            </PortalLayout>
        );
    }

    if (status === 'error') {
        return (
            <PortalLayout title="Access Denied" subtitle="Authorization Protocol Failure">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-3xl border border-rose-500/20 rounded-[4rem] p-20 text-center shadow-3xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-rose-500/30">
                        <XCircle className="text-rose-500" size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-6">Unauthorized Gateway</h3>
                    <p className="text-gray-400 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                        {error}
                    </p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="px-12 py-5 bg-white/5 text-white rounded-3xl font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all"
                    >
                        Retry Security Handshake
                    </button>
                </motion.div>
            </PortalLayout>
        );
    }

    if (status === 'completed') {
        return (
            <PortalLayout title="Entry Confirmed" subtitle="Identity Successfully Synced">
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white/5 backdrop-blur-3xl border border-emerald-500/20 rounded-[4rem] p-20 text-center shadow-3xl overflow-hidden relative"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="w-32 h-32 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-10 border-4 border-emerald-500/30 relative">
                        <CheckCircle className="text-emerald-500 animate-bounce" size={56} />
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                    </div>
                    <h3 className="text-4xl font-black text-white mb-4 tracking-tight leading-none">
                        Registration <span className="text-emerald-500">Mastered</span>
                    </h3>
                    <p className="text-gray-400 mb-12 max-w-md mx-auto font-medium">
                        The identity of <span className="text-emerald-400 font-bold">{submittedName}</span> has been permanently recorded in the registry of <span className="text-white font-bold">{context?.className} {context?.arm}</span>.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button 
                            onClick={resetForm}
                            className="px-12 py-6 bg-emerald-500 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/30 hover:bg-emerald-600 transition-all flex items-center justify-center gap-3"
                        >
                            <Plus size={18} /> Add Next Identity
                        </button>
                        <button 
                            onClick={() => window.close()}
                            className="px-12 py-6 bg-white/5 text-white rounded-[2rem] font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white hover:text-black transition-all"
                        >
                            Seal Portal
                        </button>
                    </div>
                </motion.div>
            </PortalLayout>
        );
    }

    return (
        <PortalLayout 
            title="Identity Enrollment" 
            subtitle={`Active Gateway: ${context?.className} - ${context?.arm}`}
        >
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[4rem] shadow-3xl overflow-hidden relative"
            >
                {/* Visual Progress Header */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-white/5 overflow-hidden">
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: previewURL ? '20%' : '-10%' }}
                        className="h-full bg-primary"
                    />
                </div>

                <form onSubmit={handleSubmit} className="p-16 space-y-12">
                    {/* Biometric Header Section */}
                    <div className="flex flex-col md:flex-row items-center gap-12 border-b border-white/5 pb-12">
                        <div className="relative group">
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className="w-48 h-48 rounded-[3.5rem] p-3 bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center relative overflow-hidden group-hover:border-primary/50 transition-all"
                            >
                                {previewURL ? (
                                    <img src={previewURL} alt="Biometric Preview" className="w-full h-full object-cover rounded-[3rem]" />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-500">
                                        <User size={64} className="mb-2 opacity-20" />
                                        <span className="text-[8px] font-black uppercase tracking-widest px-4 text-center">Awaiting Capture</span>
                                    </div>
                                )}
                                <label className="absolute inset-0 bg-primary/40 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                                    <div className="flex flex-col items-center">
                                        <Camera className="text-white mb-2" size={32} />
                                        <span className="text-[8px] font-black uppercase tracking-tighter text-white">Upload Biometrics</span>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                </label>
                            </motion.div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl rotate-12 transition-transform group-hover:rotate-0">
                                <ShieldCheck size={20} />
                            </div>
                        </div>

                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <h3 className="text-3xl font-black text-white tracking-tight italic">Biometric <span className="text-primary">Profile</span></h3>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-sm">
                                Submit high-resolution identity parameters to synchronize this entity with the school's central pedagogy matrix.
                            </p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">First Name Vector</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                                        <Fingerprint size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-gray-700"
                                        placeholder="Given Name"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">Last Name Vector</label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                                        <Layers size={16} />
                                    </div>
                                    <input 
                                        type="text" 
                                        required 
                                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-gray-700"
                                        placeholder="Surname"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">Email Communication Uplink</label>
                            <div className="relative">
                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary">
                                    <Mail size={16} />
                                </div>
                                <input 
                                    type="email" 
                                    required 
                                    className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold text-sm focus:bg-white/10 focus:border-primary/50 outline-none transition-all placeholder:text-gray-700"
                                    placeholder="entity.communication@nexus.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">Biological Vector</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold text-sm focus:bg-white/10 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option className="bg-[#0a0c10]" value="Male">Male Entity</option>
                                        <option className="bg-[#0a0c10]" value="Female">Female Entity</option>
                                        <option className="bg-[#0a0c10]" value="Other">Custom Orientation</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 pl-4">Housing Allocation</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-8 py-5 bg-white/5 border border-white/10 rounded-3xl text-white font-bold text-sm focus:bg-white/10 focus:border-primary/50 outline-none appearance-none cursor-pointer"
                                        value={formData.enrollmentStatus}
                                        onChange={(e) => setFormData({...formData, enrollmentStatus: e.target.value})}
                                    >
                                        <option className="bg-[#0a0c10]" value="Day">Day Student Hub</option>
                                        <option className="bg-[#0a0c10]" value="Border">Resident Boarder Hub</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                        <ChevronRight size={16} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-10">
                        <motion.button 
                            whileHover={{ scale: 1.02, y: -5 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={status === 'uploading'}
                            className={`w-full py-8 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.25em] flex items-center justify-center space-x-3 transition-all shadow-2xl ${
                                status === 'uploading' 
                                ? 'bg-white/5 text-gray-500 cursor-not-allowed' 
                                : 'bg-primary text-white shadow-primary/30 hover:bg-green-700'
                            }`}
                        >
                            {status === 'uploading' ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Syncing Identity...</span>
                                </>
                            ) : (
                                <>
                                    <Fingerprint size={20} />
                                    <span>Initiate Enrollment</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>

                {/* Secure Footer Notification */}
                <div className="bg-white/5 p-10 border-t border-white/5 flex items-start gap-5 group">
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/20 group-hover:scale-110 transition-transform">
                        <Info size={20} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400">Secure Gateway Protocol</p>
                        <p className="text-[10px] font-medium text-gray-500 leading-relaxed">
                            This entry point is synchronized with the <span className="text-white font-bold">{context?.className}</span> sector. Unauthorized use or biometric forgery is monitored by the central administrative oversight system.
                        </p>
                    </div>
                </div>
            </motion.div>
        </PortalLayout>
    );
};

export default BulkStudentUpload;

