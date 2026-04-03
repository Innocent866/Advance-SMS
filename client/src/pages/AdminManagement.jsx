import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { 
    ShieldCheck, 
    Search, 
    Plus, 
    Mail, 
    Phone, 
    Edit, 
    Trash2, 
    UserPlus, 
    Zap, 
    Activity, 
    Binary, 
    ChevronRight, 
    MoreVertical, 
    ShieldAlert, 
    UserCheck,
    Cpu,
    Fingerprint,
    Dna,
    Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const AdminManagement = () => {
    usePageTitle('Admin Management');
    const { user } = useAuth();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentAdminId, setCurrentAdminId] = useState(null);
    
    // Filters
    const [filterName, setFilterName] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'Male',
        phoneNumber: '',
        role: 'assistant_admin'
    });

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/teachers/staff/admins'); 
            setAdmins(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch admins:', error);
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await fetchAdmins();
    };

    const filteredAdmins = admins.filter(admin => {
        const fullName = `${admin.firstName} ${admin.lastName} ${admin.name || ''}`.trim().toLowerCase();
        return fullName.includes(filterName.toLowerCase()) || admin.email.toLowerCase().includes(filterName.toLowerCase());
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editMode) {
                await api.put(`/teachers/${currentAdminId}`, formData);
            } else {
                await api.post('/teachers', formData);
            }
            resetForm();
            handleRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to save admin');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Confirm permanent deletion of administrative entity?')) {
            try {
                await api.delete(`/teachers/${id}`);
                setAdmins(admins.filter(a => a._id !== id));
            } catch (error) {
                alert(error.response?.data?.message || 'Deletion failure');
            }
        }
    };

    const handleEdit = (admin) => {
        setEditMode(true);
        setCurrentAdminId(admin._id);
        setFormData({
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            password: '',
            gender: admin.gender,
            phoneNumber: admin.phoneNumber || '',
            role: admin.role
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setShowModal(false);
        setEditMode(false);
        setCurrentAdminId(null);
        setFormData({ 
            firstName: '', lastName: '', email: '', password: '', 
            gender: 'Male', phoneNumber: '', role: 'assistant_admin'
        });
    };

    if (loading) return <Loader type="spinner" />;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto pb-20 px-4"
        >
            {/* Neural Command Header */}
            <div className="relative mb-12 p-12 rounded-[3.5rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white shadow-3xl border border-white/5">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[120px] -mr-80 -mt-80 animate-pulse" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40" />
                
                <div className="relative flex flex-col lg:flex-row justify-between items-center gap-12">
                    <div className="space-y-6 text-center lg:text-left flex-1">
                        <div className="inline-flex items-center gap-3 px-5 py-2 bg-white/5 backdrop-blur-3xl rounded-full border border-white/10 text-[11px] font-black uppercase tracking-[0.25em]">
                            <Binary size={14} className="text-primary" /> Authority Hub
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.1]">
                            Admin <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-blue-400">Admin Management</span>
                        </h1>
                        <p className="text-slate-400 font-medium max-w-xl text-xl leading-relaxed">
                            Monitor and manage the administrative hierarchy of your secondary school institution.
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center">
                            <ShieldCheck className="text-primary mx-auto mb-4" size={28} />
                            <p className="text-3xl font-black">{admins.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">Total Admins</p>
                        </div>
                        <div className="bg-white/5 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 w-44 text-center">
                            <Activity className="text-indigo-400 mx-auto mb-4" size={28} />
                            <p className="text-3xl font-black">Sync</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-2">System Status</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Precision Command Bar */}
            <div className="flex flex-col md:flex-row gap-6 mb-12">
                <div className="flex-1 relative group">
                    <div className="absolute inset-y-0 left-6 flex items-center text-slate-400 group-focus-within:text-primary transition-colors">
                        <Search size={20} />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search admins by name or email..." 
                        className="w-full pl-16 pr-8 py-6 bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none font-bold text-slate-700 transition-all"
                        value={filterName}
                        onChange={(e) => setFilterName(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="px-10 py-6 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-black transition-all shadow-2xl shadow-slate-900/40 group active:scale-95"
                >
                    <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
                    Add New Admin
                </button>
            </div>

            {/* Identity Matrix (Staggered Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <AnimatePresence>
                    {filteredAdmins.map((admin, idx) => (
                        <motion.div 
                            key={admin._id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group relative bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 hover:shadow-primary/10 transition-all hover:-translate-y-2 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/5 transition-colors" />
                            
                            <div className="relative flex justify-between items-start mb-8">
                                <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                    <Fingerprint size={28} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleEdit(admin)} className="p-3 bg-white border border-slate-100 rounded-xl text-blue-500 hover:bg-blue-50 transition-all shadow-sm">
                                        <Edit size={16} />
                                    </button>
                                    {admin.role !== 'school_admin' && (
                                        <button onClick={() => handleDelete(admin._id)} className="p-3 bg-white border border-slate-100 rounded-xl text-rose-500 hover:bg-rose-50 transition-all shadow-sm">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="relative space-y-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 leading-tight">
                                        {admin.firstName} <br />
                                        <span className="text-slate-400">{admin.lastName} {admin.name}</span>
                                    </h3>
                                    <div className="inline-flex mt-3 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100 bg-indigo-50 text-indigo-600">
                                        {admin.role?.replace('_', ' ')}
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <Mail size={14} className="text-primary" />
                                        <span className="truncate">{admin.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 font-bold text-sm">
                                        <Phone size={14} className="text-indigo-400" />
                                        <span>{admin.phoneNumber || 'Unmapped'}</span>
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Verified</span>
                                    </div>
                                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                        ID: {admin._id.slice(-6).toUpperCase()}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {filteredAdmins.length === 0 && !loading && (
                <div className="p-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                    <ShieldAlert className="mx-auto mb-6 text-slate-200" size={64} />
                    <h3 className="text-2xl font-black text-slate-400">No Admins Found</h3>
                    <p className="text-slate-400 font-bold mt-2">No administrative accounts match your search.</p>
                </div>
            )}

            {/* Protocol Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={resetForm}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3.5rem] shadow-3xl w-full max-w-2xl overflow-hidden border border-white/20"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
                            
                            <div className="relative p-12">
                                <div className="flex justify-between items-center mb-10">
                                    <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-900/20">
                                            <Dna size={24} />
                                        </div>
                                        {editMode ? 'Edit Admin' : 'Add New Admin'}
                                    </h3>
                                    <button onClick={resetForm} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center font-black text-xl">
                                        &times;
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">First Name</p>
                                            <input
                                                placeholder="Enter first name"
                                                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Last Name</p>
                                            <input
                                                placeholder="Enter last name"
                                                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                                required
                                            />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</p>
                                        <input
                                            type="email"
                                            placeholder="admin@school.com"
                                            className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>

                                    {!editMode && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Password</p>
                                            <input
                                                type="password"
                                                placeholder="Enter password"
                                                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none font-bold text-slate-700 transition-all placeholder:text-slate-300"
                                                value={formData.password}
                                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                required
                                            />
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Gender</p>
                                            <select
                                                className="w-full px-8 py-5 bg-slate-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-primary outline-none font-bold text-slate-700 transition-all appearance-none cursor-pointer"
                                                value={formData.gender}
                                                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                            >
                                                <option>Male</option>
                                                <option>Female</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Admin Role</p>
                                            <select
                                                className="w-full px-8 py-5 bg-indigo-50 border border-transparent rounded-[2rem] focus:bg-white focus:border-indigo-400 outline-none font-black text-indigo-700 transition-all appearance-none cursor-pointer"
                                                value={formData.role}
                                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                required
                                            >
                                                <option value="assistant_admin">Assistant Admin</option>
                                                <option value="school_admin">School Admin</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4">
                                        <button type="button" onClick={resetForm} className="flex-1 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs text-slate-400 bg-slate-50 hover:bg-slate-100 transition-all">
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-[2] py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all active:scale-95 flex items-center justify-center gap-3">
                                            <UserCheck size={18} />
                                            {editMode ? 'Save Changes' : 'Save Admin'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AdminManagement;
