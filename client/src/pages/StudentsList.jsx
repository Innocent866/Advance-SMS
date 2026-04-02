import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    Plus, 
    Search, 
    Mail, 
    Hash, 
    User as UserIcon, 
    Edit, 
    Trash2, 
    Link as LinkIcon, 
    Copy, 
    X, 
    CheckCircle,
    RefreshCw,
    Filter,
    Users,
    GraduationCap,
    Home,
    Binary,
    ChevronDown,
    MoreVertical,
    ArrowUpRight,
    QrCode,
    Activity,
    BookOpen,
    UserPlus,
    LayoutGrid,
    List,
    Layers,
    Clock,
    ShieldCheck,
    Zap,
    Download,
    Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';

const StudentsList = () => {
    usePageTitle('Student List');
    const location = useLocation();
    const isPromotionMode = new URLSearchParams(location.search).get('mode') === 'promotion';
    const { user, checkLimit } = useAuth();
    const { showNotification } = useNotification();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentStudentId, setCurrentStudentId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    
    // Link Generation State
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkHubTab, setLinkHubTab] = useState('active'); // 'active' or 'generate'
    const [linkData, setLinkData] = useState({ classId: '', arm: '' });
    const [generatedLink, setGeneratedLink] = useState(null);
    const [isCopying, setIsCopying] = useState(false);
    const [activeLinks, setActiveLinks] = useState([]);
    const [showActiveLinks, setShowActiveLinks] = useState(false);
    const [copyingToken, setCopyingToken] = useState(null);
    
    // Bulk Actions
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [showBulkPromoteModal, setShowBulkPromoteModal] = useState(false);
    const [bulkPromoting, setBulkPromoting] = useState(false);
    const [bulkPromotionData, setBulkPromotionData] = useState({
        toClassId: '',
        toArm: '',
        reason: 'End of Term Bulk Promotion'
    });
    
    // Filters & Sorting
    const [filterName, setFilterName] = useState('');
    const [filterClass, setFilterClass] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'Male',
        level: 'SSS',
        classId: '',
        arm: '',
        enrollmentStatus: 'Day'
    });

    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [s, c, l] = await Promise.all([
                api.get('/students'),
                api.get('/academic/classes'),
                api.get('/students/active-upload-links')
            ]);
            setStudents(s.data);
            setClasses(c.data);
            setActiveLinks(l.data);
        } catch (error) {
            console.error('Data Fetch Failure:', error);
            showNotification('Failed to sync student data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => fetchData();

    const filteredStudents = useMemo(() => {
        return students.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const matchesName = fullName.includes(filterName.toLowerCase()) || 
                              student.email.toLowerCase().includes(filterName.toLowerCase()) ||
                              student.studentId?.toLowerCase().includes(filterName.toLowerCase());
            const matchesClass = filterClass ? (student.classId?._id === filterClass) : true;
            return matchesName && matchesClass;
        });
    }, [students, filterName, filterClass]);

    const sortedStudents = useMemo(() => {
        return [...filteredStudents].sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === 'name') {
                aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
                bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            } else if (sortConfig.key === 'class') {
                aValue = a.classId?.name?.toLowerCase() || '';
                bValue = b.classId?.name?.toLowerCase() || '';
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredStudents, sortConfig]);

    const selectedClass = classes.find(c => c._id === formData.classId);
    const availableArms = selectedClass?.arms || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (file) data.append('profilePicture', file);

            if (editMode) {
                await api.put(`/students/${currentStudentId}`, data);
                showNotification('Student profile updated', 'success');
            } else {
                await api.post('/students', data);
                showNotification('Student identity created', 'success');
            }
            resetForm();
            handleRefresh(); 
        } catch (error) {
            showNotification(error.response?.data?.message || 'Transaction failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to terminate this student record?')) {
            try {
                await api.delete(`/students/${id}`);
                showNotification('Record removed', 'success');
                handleRefresh();
            } catch (error) {
                showNotification('Error removing record', 'error');
            }
        }
    };

    const handleEdit = (student) => {
        setEditMode(true);
        setCurrentStudentId(student._id);
        setFormData({
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            password: '', 
            gender: student.gender,
            level: student.level,
            classId: student.classId?._id || student.classId,
            arm: student.arm || '',
            enrollmentStatus: student.enrollmentStatus || 'Day'
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setShowForm(false);
        setEditMode(false);
        setCurrentStudentId(null);
        setFormData({ 
            firstName: '', lastName: '', email: '', password: '', 
            gender: 'Male', level: 'SSS', classId: '', arm: '',
            enrollmentStatus: 'Day'
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleGenerateLink = async () => {
        if (!linkData.classId || !linkData.arm) return showNotification('Incomplete parameters', 'warning');
        try {
            const res = await api.post('/students/generate-upload-link', linkData);
            setGeneratedLink(res.data.uploadLink);
            if (res.data.session) setActiveLinks(prev => [res.data.session, ...prev]);
            showNotification('Access link generated', 'success');
        } catch (error) {
            showNotification('Generation failed', 'error');
        }
    };

    const handleRevokeLink = async (sessionId) => {
        try {
            await api.post('/students/revoke-upload-session', { sessionId });
            showNotification('Access revoked', 'success');
            setActiveLinks(prev => prev.filter(s => s._id !== sessionId));
        } catch (error) {
            showNotification('Revocation failed', 'error');
        }
    };

    const toggleStudentSelection = (id) => {
        setSelectedStudents(prev => 
            prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
        );
    };

    const handleBulkPromote = async (e) => {
        e.preventDefault();
        if (!bulkPromotionData.toClassId) return showNotification('Please select a target class', 'warning');
        
        setBulkPromoting(true);
        try {
            await api.post('/students/promote', {
                studentIds: selectedStudents,
                ...bulkPromotionData
            });
            showNotification(`Successfully promoted ${selectedStudents.length} students`, 'success');
            setShowBulkPromoteModal(false);
            setSelectedStudents([]);
            fetchData();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Bulk promotion failed', 'error');
        } finally {
            setBulkPromoting(false);
        }
    };

    const stats = {
        total: students.length,
        male: students.filter(s => s.gender === 'Male').length,
        female: students.filter(s => s.gender === 'Female').length,
        boarding: students.filter(s => s.enrollmentStatus === 'Border').length
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Intelligence Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Student Management
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Student <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-indigo-400">
                                {isPromotionMode ? 'Promotion' : 'List'}
                            </span>
                        </h1>
                        <p className="text-gray-400 font-medium max-w-xl text-xl leading-relaxed">
                            {isPromotionMode 
                                ? 'Select students below to initiate bulk class promotion and level transitions.'
                                : 'Manage your student records, view profiles, and handle enrollments in one place.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {[
                            { label: 'Total Students', value: stats.total, icon: Users, color: 'text-primary' },
                            { label: 'Boarders', value: stats.boarding, icon: Home, color: 'text-indigo-400' },
                            { label: 'Male/Female', value: `${stats.male}/${stats.female}`, icon: Activity, color: 'text-blue-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-48 text-center group hover:bg-white/10 transition-all">
                                <stat.icon className={`${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} size={28} />
                                <p className="text-3xl font-black">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Command Bar */}
            <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-gray-200 p-3 rounded-[2.5rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        placeholder="Search student name or email..." 
                        className="w-full pl-14 pr-8 py-4 bg-gray-100/50 rounded-3xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center px-2">
                    <select 
                        className="bg-gray-100/50 text-xs font-black uppercase tracking-widest text-gray-700 px-6 py-4 rounded-3xl border border-transparent focus:border-primary/30 outline-none cursor-pointer hover:bg-gray-200/50 transition-all appearance-none"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                    >
                        <option value="">All Classes</option>
                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>

                    <div className="h-8 w-px bg-gray-200 mx-2" />

                    <div className="flex bg-gray-100/50 p-1 rounded-[1.5rem]">
                        <button 
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-lg text-primary' : 'text-gray-400'}`}
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button 
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-white shadow-lg text-primary' : 'text-gray-400'}`}
                        >
                            <List size={18} />
                        </button>
                    </div>

                    <div className="flex gap-2">
                        <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowLinkModal(true)}
                            className="bg-blue-600 text-white p-4 rounded-3xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all"
                             title="Generate Upload Link"
                        >
                            <LinkIcon size={20} />
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowForm(!showForm)}
                            className="bg-primary text-white p-4 rounded-3xl shadow-lg shadow-primary/20 hover:bg-green-700 transition-all"
                             title="Add New Student"
                        >
                            <UserPlus size={20} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Enrollment Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-2xl relative">
                            <div className="absolute top-8 right-8 cursor-pointer text-gray-400 hover:text-gray-600" onClick={resetForm}>
                                <X size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
                                <Zap className="text-primary" /> {editMode ? 'Edit Student Details' : 'Add New Student'}
                            </h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-3 flex items-center gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group">
                                    <div className="w-20 h-20 rounded-full bg-white border-4 border-gray-100 overflow-hidden flex items-center justify-center text-gray-300 relative">
                                        {file ? (
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        ) : <UserIcon size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Profile Picture</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="w-full text-xs font-bold text-gray-500 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">First Name</label>
                                    <input
                                        placeholder="Full Name"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Last Name</label>
                                    <input
                                        placeholder="Family Name"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Gender</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="entity@schoolhub.com"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                               
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Assign Class</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                        value={formData.classId}
                                        onChange={(e) => setFormData({...formData, classId: e.target.value, arm: ''})}
                                        required
                                    >
                                        <option value="">Select Level</option>
                                        {classes.map(cls => (
                                            <option key={cls._id} value={cls._id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Assign Arm</label>
                                    {availableArms.length > 0 ? (
                                        <select
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                            value={formData.arm}
                                            onChange={(e) => setFormData({...formData, arm: e.target.value})}
                                            required
                                        >
                                            <option value="">Select Arm</option>
                                            {availableArms.map((arm, index) => (
                                                <option key={index} value={arm.name}>{arm.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            placeholder="Alpha/Beta/Gamma"
                                            className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            value={formData.arm}
                                            onChange={(e) => setFormData({...formData, arm: e.target.value})}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Status</label>
                                    <select
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                        value={formData.enrollmentStatus}
                                        onChange={(e) => setFormData({...formData, enrollmentStatus: e.target.value})}
                                    >
                                        <option value="Day">Day Student</option>
                                        <option value="Border">Boarder</option>
                                    </select>
                                </div>

                                <div className="md:col-span-3 flex justify-end gap-3 mt-8 pt-8 border-t border-gray-100">
                                     <button 
                                        type="button"
                                        onClick={resetForm}
                                        className="px-8 py-4 text-gray-500 hover:text-gray-900 font-black text-xs uppercase tracking-widest transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="bg-primary text-white px-10 py-4 rounded-3xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-green-700 transition-all"
                                    >
                                        {editMode ? 'Save Changes' : 'Add Student'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Registry Display */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[2.5rem]" />
                        ))
                    ) : sortedStudents.map((student, idx) => (
                        <motion.div 
                            key={student._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative bg-white border border-gray-100 rounded-[2.5rem] transition-all hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 overflow-hidden ${
                                viewMode === 'list' ? 'flex items-center p-6 gap-6' : 'p-8'
                            } ${selectedStudents.includes(student._id) ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : ''}`}
                        >
                            {/* Selection Checkbox */}
                            {user?.role === 'school_admin' && (
                                <div 
                                    onClick={() => toggleStudentSelection(student._id)}
                                    className={`absolute top-6 left-6 z-10 w-6 h-6 rounded-lg border-2 cursor-pointer flex items-center justify-center transition-all ${
                                        selectedStudents.includes(student._id) 
                                            ? 'bg-primary border-primary text-white' 
                                            : 'bg-white border-gray-200 hover:border-primary opacity-0 group-hover:opacity-100'
                                    }`}
                                >
                                    {selectedStudents.includes(student._id) && <CheckCircle size={14} />}
                                </div>
                            )}

                            <div className={`flex items-center gap-6 ${viewMode === 'list' ? 'flex-1' : 'mb-8'}`}>
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] border-4 border-gray-50 overflow-hidden shadow-lg group-hover:rotate-6 transition-transform duration-500">
                                        {student.profilePicture ? (
                                            <img src={student.profilePicture} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-3xl">
                                                {student.firstName[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-4 border-white rounded-full ${
                                        student.enrollmentStatus === 'Border' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    }`} title={student.enrollmentStatus} />
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors">
                                        {student.firstName} {student.lastName}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono select-all">
                                            #{student.studentId}
                                        </span>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest select-none">
                                            {student.gender}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`${viewMode === 'list' ? 'flex-[1.5] flex items-center gap-8' : 'space-y-4 mb-10'}`}>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-gray-50/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100/50">
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Assigned Class</p>
                                        <p className="text-xs font-black text-gray-700 truncate">
                                            {student.classId?.name || 'Null'} <span className="text-primary">{student.arm ? `(Arm ${student.arm})` : ''}</span>
                                        </p>
                                    </div>
                                    <div className={`flex-1 bg-gray-50/80 backdrop-blur-md p-4 rounded-2xl border border-gray-100/50 ${viewMode === 'list' ? 'hidden md:block' : ''}`}>
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Level</p>
                                        <p className="text-xs font-black text-gray-700">{student.level || 'Standard'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-gray-400 group-hover:text-gray-600 transition-colors ${viewMode === 'list' ? 'hidden lg:flex' : ''}">
                                    <Mail size={14} className="shrink-0" />
                                    <span className="text-xs font-bold truncate max-w-[200px]">{student.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <Link 
                                    to={`/students/${student._id}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                                >
                                    View Profile <ArrowUpRight size={14} />
                                </Link>

                                <div className="flex gap-2">
                                    {user?.role === 'school_admin' && (
                                        <>
                                            <button 
                                                onClick={() => handleEdit(student)}
                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(student._id)}
                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {sortedStudents.length === 0 && !loading && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[3.5rem] border-2 border-dashed border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Search size={48} className="text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800">No Students Found</h3>
                            <p className="text-gray-400 mt-2 font-medium">No students match your search or filter.</p>
                            <button onClick={handleRefresh} className="mt-8 text-primary font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mx-auto hover:gap-4 transition-all">
                                Refresh List <RefreshCw size={14} />
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* MODALS */}
            {/* Generate Link Modal */}
            <AnimatePresence>
                {showLinkModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl"
                            onClick={() => { setShowLinkModal(false); setGeneratedLink(null); }}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
                        >
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] -ml-32 -mb-32" />
                            
                            {/* Header */}
                            <div className="p-10 border-b border-gray-100 relative z-10 flex justify-between items-center bg-white/50 backdrop-blur-md">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                                        <QrCode size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Upload Link Management</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Manage links for student self-registration</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => { setShowLinkModal(false); setGeneratedLink(null); }} 
                                    className="p-4 hover:bg-gray-100 rounded-2xl transition-all text-gray-400 hover:text-gray-900 group"
                                >
                                    <X size={24} className="group-hover:rotate-90 transition-transform" />
                                </button>
                            </div>

                            {/* Hub Navigation */}
                            <div className="px-10 py-6 bg-gray-50/50 flex gap-4 relative z-10">
                                {[
                                    { id: 'active', label: 'Active Links', icon: Activity, count: activeLinks.length },
                                    { id: 'generate', label: 'Generate Link', icon: Zap }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setLinkHubTab(tab.id)}
                                        className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all border ${
                                            linkHubTab === tab.id 
                                                ? 'bg-slate-900 text-white shadow-xl border-slate-900' 
                                                : 'bg-white text-gray-400 border-gray-100 hover:border-gray-200 hover:text-gray-600'
                                        }`}
                                    >
                                        <tab.icon size={14} />
                                        {tab.label}
                                        {tab.count !== undefined && (
                                            <span className={`ml-2 px-2 py-0.5 rounded-full text-[9px] ${
                                                linkHubTab === tab.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Hub Content */}
                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar relative z-10">
                                <AnimatePresence mode="wait">
                                    {linkHubTab === 'active' ? (
                                        <motion.div 
                                            key="active"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            className="space-y-6"
                                        >
                                            {activeLinks.length > 0 ? (
                                                activeLinks.map((link, idx) => (
                                                    <div key={link._id} className="p-8 bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group">
                                                        <div className="flex justify-between items-start gap-6 mb-6">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                                                    <Layers size={20} />
                                                                </div>
                                                                 <div>
                                                                    <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400">Target Class</p>
                                                                    <h4 className="text-xl font-black text-gray-900">
                                                                        {link.classId?.name || classes.find(c => c._id === (link.classId?._id || link.classId))?.name || 'Unknown Class'} 
                                                                        <span className="text-primary ml-2">{link.arm ? `(Arm ${link.arm})` : ''}</span>
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                            <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                                                                <button 
                                                                    onClick={() => {
                                                                        const fullLink = `${window.location.origin}/bulk-upload-portal?token=${link.token}`;
                                                                        navigator.clipboard.writeText(fullLink);
                                                                        setCopyingToken(link.token);
                                                                        setTimeout(() => setCopyingToken(null), 2000);
                                                                    }}
                                                                    className={`p-3 rounded-xl transition-all flex items-center gap-2 ${
                                                                        copyingToken === link.token ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary hover:bg-white'
                                                                    }`}
                                                                >
                                                                    {copyingToken === link.token ? <CheckCircle size={18} /> : <Copy size={18} />}
                                                                    <span className="text-[10px] font-black tracking-widest uppercase">Copy</span>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleRevokeLink(link._id)}
                                                                    className="p-3 rounded-xl text-gray-400 hover:text-rose-600 hover:bg-white transition-all flex items-center gap-2"
                                                                >
                                                                    <Trash2 size={18} />
                                                                    <span className="text-[10px] font-black tracking-widest uppercase">Revoke</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 rounded-2xl border border-gray-100">
                                                            <div className="flex items-center gap-3">
                                                                <Clock size={14} className="text-gray-400" />
                                                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                                    Expires: <span className="text-gray-900">{new Date(link.expiresAt).toLocaleDateString()}</span>
                                                                </p>
                                                            </div>
                                                              <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Active</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
                                                    <Activity size={48} className="text-gray-200 mx-auto mb-6" />
                                                    <p className="text-gray-400 font-black text-xs uppercase tracking-widest">No active registration links</p>
                                                    <button onClick={() => setLinkHubTab('generate')} className="mt-6 text-primary font-black uppercase tracking-widest text-[10px] flex items-center gap-2 mx-auto hover:gap-4 transition-all">
                                                        Generate New Link <ArrowUpRight size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    ) : (
                                        <motion.div 
                                            key="generate"
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-8"
                                        >
                                            {!generatedLink ? (
                                                <div className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Select Class</label>
                                                            <select 
                                                                className="w-full px-8 py-5 bg-gray-100 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer"
                                                                value={linkData.classId}
                                                                onChange={(e) => setLinkData({ ...linkData, classId: e.target.value, arm: '' })}
                                                            >
                                                                <option value="">Select Target Class</option>
                                                                {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-3">
                                                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Select Class Arm</label>
                                                            <select 
                                                                className="w-full px-8 py-5 bg-gray-100 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                                                value={linkData.arm}
                                                                onChange={(e) => setLinkData({ ...linkData, arm: e.target.value })}
                                                                disabled={!linkData.classId}
                                                            >
                                                                <option value="">Select Arm</option>
                                                                {classes.find(c => c._id === linkData.classId)?.arms.map(a => (
                                                                    <option key={a._id} value={a.name}>{a.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2.5rem] flex items-start gap-4">
                                                        <Info className="text-blue-500 shrink-0" size={20} />
                                                         <p className="text-xs font-bold text-blue-900 leading-relaxed">
                                                            Generating a link will create a temporary 48-hour gateway allowing teachers to register students for the selected class.
                                                        </p>
                                                    </div>

                                                    <button 
                                                        onClick={handleGenerateLink}
                                                        className="w-full bg-primary text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl shadow-primary/20 hover:bg-green-700 hover:-translate-y-1 transition-all"
                                                    >
                                                        Generate Link
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                                    <div className="p-10 bg-emerald-50 rounded-[3rem] border-2 border-dashed border-emerald-200 flex flex-col items-center gap-6">
                                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-xl border-4 border-emerald-50 animate-bounce">
                                                            <CheckCircle size={40} />
                                                        </div>
                                                        <div className="text-center space-y-2">
                                                            <p className="text-xl font-black text-emerald-950">Synthesis Successful</p>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Gateway Node Active for 48 Hours</p>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="relative group">
                                                        <div className="bg-gray-900 p-8 rounded-[2.5rem] border border-gray-800 font-mono text-xs text-primary break-all leading-relaxed pr-24 select-all shadow-inner">
                                                            {generatedLink}
                                                        </div>
                                                        <button 
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(generatedLink);
                                                                setIsCopying(true);
                                                                setTimeout(() => setIsCopying(false), 2000);
                                                            }}
                                                            className={`absolute right-4 top-1/2 -translate-y-1/2 w-16 h-16 rounded-3xl shadow-2xl shadow-black transition-all flex items-center justify-center ${
                                                                isCopying ? 'bg-emerald-500 text-white' : 'bg-white text-gray-900 hover:scale-110'
                                                            }`}
                                                        >
                                                            {isCopying ? <CheckCircle size={24} /> : <Copy size={24} />}
                                                        </button>
                                                    </div>

                                                    <button 
                                                        onClick={() => { setGeneratedLink(null); setLinkHubTab('active'); }}
                                                        className="w-full bg-slate-900 text-white py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                                                    >
                                                        Finalize & View Matrix
                                                    </button>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Bulk Action Bar */}
            <AnimatePresence>
                {selectedStudents.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[90] bg-slate-900 text-white px-10 py-6 rounded-[3rem] shadow-3xl border border-white/10 flex items-center gap-12 backdrop-blur-2xl"
                    >
                        <div className="flex items-center gap-4 border-r border-white/10 pr-12">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center font-black">
                                {selectedStudents.length}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Students Selected</p>
                        </div>

                        <div className="flex gap-4">
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowBulkPromoteModal(true)}
                                className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center gap-3"
                            >
                                <Zap size={14} /> Bulk Promote
                            </motion.button>
                            <button 
                                onClick={() => setSelectedStudents([])}
                                className="text-gray-400 hover:text-white font-black text-[10px] uppercase tracking-widest px-4"
                            >
                                Deselect All
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bulk Promotion Modal */}
            <AnimatePresence>
                {showBulkPromoteModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xl"
                            onClick={() => setShowBulkPromoteModal(false)}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative bg-white w-full max-w-xl rounded-[3.5rem] shadow-3xl overflow-hidden border border-white/20 p-12"
                        >
                            <h3 className="text-3xl font-black text-gray-900 mb-8 flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Zap size={24} />
                                </div>
                                Bulk Promotion
                            </h3>
                            <p className="text-gray-500 font-bold mb-8 pl-4 border-l-4 border-primary/20">
                                You are about to promote <span className="text-primary">{selectedStudents.length}</span> students to a new class level.
                            </p>

                            <form onSubmit={handleBulkPromote} className="space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Class</label>
                                    <select 
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer"
                                        value={bulkPromotionData.toClassId}
                                        onChange={(e) => setBulkPromotionData({...bulkPromotionData, toClassId: e.target.value, toArm: ''})}
                                        required
                                    >
                                        <option value="">Select Target Class</option>
                                        {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Target Arm</label>
                                    <select 
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-[2rem] text-sm font-bold text-gray-700 outline-none transition-all appearance-none cursor-pointer disabled:opacity-50"
                                        value={bulkPromotionData.toArm}
                                        onChange={(e) => setBulkPromotionData({...bulkPromotionData, toArm: e.target.value})}
                                        disabled={!bulkPromotionData.toClassId}
                                    >
                                        <option value="">Select Arm</option>
                                        {classes.find(c => c._id === bulkPromotionData.toClassId)?.arms.map(a => (
                                            <option key={a._id} value={a.name}>{a.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 pl-4">Promotion Reason</label>
                                    <textarea 
                                        placeholder="Reason for bulk movement..."
                                        className="w-full px-8 py-5 bg-gray-50 border border-transparent focus:border-primary/30 rounded-3xl text-sm font-bold text-gray-700 outline-none transition-all min-h-[100px] resize-none"
                                        value={bulkPromotionData.reason}
                                        onChange={(e) => setBulkPromotionData({...bulkPromotionData, reason: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end gap-4 pt-6">
                                    <button 
                                        type="button"
                                        onClick={() => setShowBulkPromoteModal(false)}
                                        className="px-8 py-4 text-gray-400 font-black text-[10px] uppercase tracking-widest hover:text-gray-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={bulkPromoting}
                                        className="bg-primary text-white px-10 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center gap-3 disabled:opacity-50"
                                    >
                                        {bulkPromoting ? 'Moving Students...' : 'Confirm Bulk Promotion'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentsList;
