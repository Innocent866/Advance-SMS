import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { 
    Users, 
    Search, 
    Plus, 
    Mail, 
    Phone, 
    MoreVertical, 
    Briefcase, 
    Edit, 
    Trash2,
    Binary,
    Activity,
    ShieldCheck,
    RefreshCw,
    X,
    LayoutGrid,
    List,
    ChevronRight,
    ArrowUpRight,
    GraduationCap,
    Clock,
    Zap,
    BookOpen,
    Layers,
    UserPlus,
    UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const TeachersList = () => {
    usePageTitle('Staff List');
    const { user, checkLimit } = useAuth();
    const notification = useNotification();
    const showNotification = notification?.showNotification || (() => {});
    const [teachers, setTeachers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    const [viewMode, setViewMode] = useState('grid');
    
    // Filters & Sorting
    const [filterName, setFilterName] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Add file state
    const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'Male',
        qualification: '',
        phoneNumber: '',
        subjects: [],
        departmentId: '',
        role: 'teacher',
        employmentType: 'Full-time',
        address: '',
        dateOfJoining: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [teacherRes, deptRes] = await Promise.all([
                api.get('/teachers'),
                api.get('/departments')
            ]);
            setTeachers(teacherRes.data);
            setDepartments(deptRes.data.data || []);
        } catch (error) {
            console.error('Data Fetch Failure:', error);
            showNotification('Failed to sync staff data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => fetchData();

    const filteredTeachers = teachers.filter(staff => {
        const fullName = `${staff.firstName} ${staff.lastName} ${staff.name || ''}`.trim().toLowerCase();
        return fullName.includes(filterName.toLowerCase()) || 
               staff.email.toLowerCase().includes(filterName.toLowerCase()) ||
               (staff.role && staff.role.toLowerCase().includes(filterName.toLowerCase()));
    });

    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let aValue = `${a.firstName} ${a.lastName} ${a.name || ''}`.trim().toLowerCase();
        let bValue = `${b.firstName} ${b.lastName} ${b.name || ''}`.trim().toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'subjects') {
                    data.append(key, JSON.stringify(formData[key]));
                } else {
                    data.append(key, formData[key] || '');
                }
            });
            
            if (file) data.append('profilePicture', file);

            if (editMode) {
                await api.put(`/teachers/${currentTeacherId}`, data);
                showNotification('Staff profile updated', 'success');
            } else {
                await api.post('/teachers', data);
                showNotification('Staff profile created', 'success');
            }
            
            resetForm();
            handleRefresh();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Transaction failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff record?')) {
            try {
                await api.delete(`/teachers/${id}`);
                showNotification('Record removed', 'success');
                setTeachers(teachers.filter(t => t._id !== id));
            } catch (error) {
                showNotification('Error removing record', 'error');
            }
        }
    };

    const handleEdit = (teacher) => {
        setEditMode(true);
        setCurrentTeacherId(teacher._id);
        setFormData({
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            password: '', 
            gender: teacher.gender,
            qualification: teacher.qualification,
            phoneNumber: teacher.phoneNumber || '',
            subjects: teacher.subjects || [],
            departmentId: teacher.departmentId?._id || teacher.departmentId || '',
            role: teacher.role || 'teacher',
            employmentType: teacher.employmentType || 'Full-time',
            address: teacher.address || '',
            dateOfJoining: teacher.dateOfJoining ? new Date(teacher.dateOfJoining).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentTeacherId(null);
        setFormData({ 
            firstName: '', lastName: '', email: '', password: '', 
            gender: 'Male', qualification: '', phoneNumber: '', subjects: [],
            departmentId: '', role: 'teacher', employmentType: 'Full-time',
            address: '', dateOfJoining: new Date().toISOString().split('T')[0]
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const stats = {
        total: teachers.length,
        departments: departments.length,
        male: teachers.filter(t => t.gender === 'Male').length,
        female: teachers.filter(t => t.gender === 'Female').length
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Neural Faculty Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Staff Management
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
                            Staff <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Directory</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Manage staff profiles, roles, and institutional assignments.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        {[
                            { label: 'Total Staff', value: stats.total, icon: Users, color: 'text-primary' },
                            { label: 'Departments', value: stats.departments, icon: Layers, color: 'text-indigo-400' },
                            { label: 'Male/Female', value: `${stats.male}/${stats.female}`, icon: Activity, color: 'text-blue-400' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-48 text-center group hover:bg-white/10 transition-all">
                                <stat.icon className={`${stat.color} mx-auto mb-4 group-hover:scale-110 transition-transform`} size={28} />
                                <p className="text-3xl font-black">{stat.value}</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>


            {/* Precision Command Bar */}
            <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-2xl border border-gray-200 p-3 rounded-[2.5rem] shadow-2xl mb-12 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                    <input 
                        placeholder="Search Name, Email or Role..." 
                        className="w-full pl-14 pr-8 py-4 bg-gray-100/50 rounded-3xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all border border-transparent focus:border-primary/30"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-3 items-center px-2">
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

                    <div className="h-8 w-px bg-gray-200 mx-2" />

                    {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                                if (checkLimit('Teacher', teachers.length)) {
                                    resetForm(); 
                                    setShowModal(true);
                                } else {
                                    showNotification('Subscription limit reached', 'warning');
                                }
                            }}
                            className="bg-primary text-white px-8 py-4 rounded-3xl shadow-xl shadow-primary/20 hover:bg-green-700 transition-all flex items-center gap-3 text-xs font-black uppercase tracking-widest"
                        >
                            <UserPlus size={18} /> Add New Staff
                        </motion.button>
                    )}
                </div>
            </div>

            {/* Staff Matrix */}
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        Array(6).fill(0).map((_, i) => (
                            <div key={i} className="h-64 bg-gray-100 animate-pulse rounded-[3rem]" />
                        ))
                    ) : sortedTeachers.map((staff, idx) => (
                        <motion.div 
                            key={staff._id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: idx * 0.05 }}
                            className={`group relative bg-white border border-gray-100 rounded-[3rem] transition-all hover:shadow-3xl hover:shadow-indigo-200/20 hover:-translate-y-2 overflow-hidden ${
                                viewMode === 'list' ? 'flex items-center p-6 gap-8' : 'p-10'
                            }`}
                        >
                            <div className={`flex items-center gap-6 ${viewMode === 'list' ? 'flex-1' : 'mb-8'}`}>
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2rem] border-4 border-gray-50 overflow-hidden shadow-lg group-hover:rotate-6 transition-transform duration-500">
                                        {staff.profilePicture ? (
                                            <img src={staff.profilePicture} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-3xl">
                                                {(staff.firstName && staff.firstName[0]) || (staff.name && staff.name[0])}
                                            </div>
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-2xl shadow-lg border border-gray-50 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <UserCheck size={14} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors">
                                        {staff.firstName} {staff.lastName} {staff.name}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                                            staff.role === 'teacher' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                        }`}>
                                            {staff.role?.replace('_', ' ') || 'Teacher'}
                                        </span>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                            {staff.gender}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={`${viewMode === 'list' ? 'flex-[1.5] flex items-center gap-12' : 'space-y-5 mb-10'}`}>
                                <div className="flex gap-4">
                                    <div className="flex-1 bg-slate-50/80 backdrop-blur-md p-4 rounded-2xl border border-slate-100/50">
                                        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1">Qualification</p>
                                        <p className="text-xs font-black text-slate-700 truncate">{staff.qualification || 'N/A'}</p>
                                    </div>
                                    <div className={`flex-1 bg-indigo-50/50 backdrop-blur-md p-4 rounded-2xl border border-indigo-100/50 ${viewMode === 'list' ? 'hidden md:block' : ''}`}>
                                        <p className="text-[8px] font-black uppercase tracking-[0.15em] text-indigo-400 mb-1">Department</p>
                                        <p className="text-xs font-black text-indigo-700 truncate">
                                            {typeof staff.departmentId === 'object' && staff.departmentId ? staff.departmentId.name : (departments?.find(d => d._id === staff.departmentId)?.name || 'General')}
                                        </p>
                                    </div>
                                </div>

                                <div className={`flex items-center gap-4 text-slate-400 group-hover:text-slate-600 transition-colors ${viewMode === 'list' ? 'hidden lg:flex' : ''}`}>
                                    <Mail size={16} className="shrink-0" />
                                    <span className="text-sm font-bold truncate max-w-[200px]">{staff.email}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between gap-4 pt-6 border-t border-gray-100">
                                <Link 
                                    to={`/teachers/${staff._id}`}
                                    className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all"
                                >
                                    View Profile <ArrowUpRight size={14} />
                                </Link>

                                <div className="flex gap-2">
                                    {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                                        <>
                                            <button 
                                                onClick={() => handleEdit(staff)}
                                                className="w-12 h-12 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all flex items-center justify-center shadow-sm"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(staff._id)}
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

                    {sortedTeachers.length === 0 && !loading && (
                        <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
                                <Users size={48} className="text-gray-200" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 tracking-tight">No Staff Found</h3>
                            <p className="text-gray-400 mt-2 font-medium">No staff members have been added to this list yet.</p>
                            <button onClick={handleRefresh} className="mt-8 text-primary font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 mx-auto hover:gap-4 transition-all">
                                Refresh List <RefreshCw size={14} />
                            </button>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Profile Synthesis Console (Modal) */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-sm">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                            onClick={resetForm}
                        />
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative bg-white w-full max-w-2xl rounded-[3.5rem] shadow-3xl p-12 overflow-y-auto max-h-[90vh] custom-scrollbar border border-white/20"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24" />
                            
                            <div className="flex justify-between items-start mb-10">
                                <div className="space-y-2">
                                    <div className="p-3 bg-primary/10 rounded-2xl text-primary w-fit">
                                        <UserPlus size={24} />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                                        {editMode ? 'Edit Staff Profile' : 'Add New Staff'}
                                    </h3>
                                    <p className="text-slate-400 font-medium font-sm">Enter the details for the staff member below.</p>
                                </div>
                                <button onClick={resetForm} className="p-3 hover:bg-gray-100 rounded-full transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 group">
                                    <div className="w-20 h-20 rounded-full bg-white border-4 border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 relative">
                                        {file ? (
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                        ) : <Users size={32} />}
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Profile Picture</label>
                                        <input 
                                            type="file" 
                                            accept="image/*"
                                            ref={fileInputRef}
                                            onChange={(e) => setFile(e.target.files[0])}
                                            className="w-full text-xs font-bold text-slate-500 rounded-xl cursor-pointer"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">First Name</label>
                                        <input
                                            placeholder="First Name"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Last Name</label>
                                        <input
                                            placeholder="Last Name"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Email Address</label>
                                        <input
                                            type="email"
                                            placeholder="email@example.com"
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-mono shadow-sm"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    {!editMode && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Password</label>
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Staff Role</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        >
                                            <option value="teacher">Teacher</option>
                                            <option value="hostel_warden">Hostel Warden</option>
                                            <option value="house_parent">House Parent</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Gender</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                                            value={formData.gender}
                                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        >
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Qualification</label>
                                        <input
                                            placeholder="B.Ed, M.Sc, etc."
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Department</label>
                                        <select
                                            className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer shadow-sm"
                                            value={formData.departmentId}
                                            onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(dept => (
                                                <option key={dept._id} value={dept._id}>{dept.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 pl-4">Home Address</label>
                                    <textarea
                                        placeholder="Address"
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm min-h-[100px]"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                    />
                                </div>

                                <div className="flex justify-end gap-4 mt-12 pt-10 border-t border-slate-100">
                                    <button 
                                        type="button" 
                                        onClick={resetForm} 
                                        className="px-8 py-4 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="bg-primary text-white px-10 py-4 rounded-3xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-primary/30 hover:bg-green-700 hover:-translate-y-1 transition-all"
                                    >
                                        {editMode ? 'Save Changes' : 'Add Staff'}
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

export default TeachersList;
