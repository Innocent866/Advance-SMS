import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    UserPlus, 
    Mail, 
    Phone, 
    Trash2, 
    Edit2, 
    X,
    Search,
    Upload,
    Camera,
    Shield,
    Lock
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const AdminUserManagement = () => {
    usePageTitle('Admin Management');
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'assistant_admin',
        phoneNumber: '',
        gender: 'Male',
        permissions: []
    });

    const availablePermissions = [
        { id: 'school_setup', label: 'School Setup', icon: Shield },
        { id: 'financials', label: 'Financial Management', icon: Lock },
        { id: 'reports', label: 'Academic Reports', icon: Shield },
        { id: 'staff_management', label: 'Staff Management', icon: Shield },
        { id: 'student_records', label: 'Student Records', icon: Shield },
        { id: 'boarding', label: 'Boarding Management', icon: Shield }
    ];

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await api.get('/staff/unified');
            // Filter only admins
            const filteredAdmins = res.data.data.filter(s => 
                ['school_admin', 'assistant_admin', 'super_admin'].includes(s.userId?.role)
            );
            setAdmins(filteredAdmins);
        } catch (error) {
            toast.error('Failed to load admin members');
        } finally {
            setLoading(false);
        }
    };

    const togglePermission = (permId) => {
        const current = [...formData.permissions];
        if (current.includes(permId)) {
            setFormData({ ...formData, permissions: current.filter(id => id !== permId) });
        } else {
            setFormData({ ...formData, permissions: [...current, permId] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'permissions') {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            if (profileImage) {
                data.append('profilePicture', profileImage);
            }

            if (editingAdmin) {
                await api.put(`/staff/${editingAdmin._id}`, data);
                toast.success('Admin updated successfully');
            } else {
                await api.post('/staff', data);
                toast.success('Admin added successfully');
            }
            setShowModal(false);
            setEditingAdmin(null);
            resetForm();
            fetchAdmins();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this admin?')) return;
        try {
            await api.delete(`/staff/${id}`);
            toast.success('Admin removed successfully');
            fetchAdmins();
        } catch (error) {
            toast.error('Failed to remove admin');
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'assistant_admin',
            phoneNumber: '',
            gender: 'Male',
            permissions: []
        });
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const filteredAdmins = admins.filter(s => 
        `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Admin Management</h1>
                    <p className="text-gray-500">Manage school administrators and their permissions.</p>
                </div>
                <button 
                    onClick={() => { setShowModal(true); setEditingAdmin(null); resetForm(); }}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all font-bold shadow-lg shadow-indigo-200"
                >
                    <UserPlus size={20} />
                    <span>Add New Admin</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search admins by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading admin directory...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmins.map((admin) => (
                        <motion.div 
                            layout
                            key={admin._id}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    {admin.profilePicture ? (
                                        <img src={admin.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <ShieldCheck size={32} />
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            setEditingAdmin(admin);
                                            setFormData({
                                                firstName: admin.firstName,
                                                lastName: admin.lastName,
                                                email: admin.email,
                                                role: admin.userId?.role,
                                                phoneNumber: admin.phoneNumber || '',
                                                gender: admin.gender || 'Male',
                                                permissions: admin.userId?.permissions || []
                                            });
                                            setImagePreview(admin.profilePicture);
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(admin._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-800 text-lg">{admin.firstName} {admin.lastName}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        admin.userId?.role === 'super_admin' ? 'bg-red-100 text-red-600' : 'bg-indigo-100 text-indigo-600'
                                    }`}>
                                        {admin.userId?.role?.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail size={16} className="text-gray-400" />
                                    <span>{admin.email}</span>
                                </div>
                                {admin.phoneNumber && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} className="text-gray-400" />
                                        <span>{admin.phoneNumber}</span>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {admin.userId?.permissions?.map(p => (
                                        <span key={p} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                                            {p.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingAdmin ? 'Edit Admin User' : 'Add New Admin'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="flex flex-col items-center justify-center space-y-4 mb-6">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera className="text-gray-300" size={32} />
                                            )}
                                        </div>
                                        <label className="absolute bottom-2 right-2 p-2 bg-indigo-600 text-white rounded-xl cursor-pointer shadow-lg hover:bg-indigo-700 transition-all">
                                            <Upload size={16} />
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">First Name</label>
                                        <input 
                                            type="text" required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Last Name</label>
                                        <input 
                                            type="text" required
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                        <input 
                                            type="email" required disabled={editingAdmin}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Role</label>
                                        <select 
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.role}
                                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        >
                                            <option value="school_admin">School Admin</option>
                                            <option value="assistant_admin">Assistant Admin</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-sm font-semibold text-gray-700">Permissions</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {availablePermissions.map(perm => (
                                            <button
                                                key={perm.id}
                                                type="button"
                                                onClick={() => togglePermission(perm.id)}
                                                className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                                                    formData.permissions.includes(perm.id)
                                                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                                        : 'border-gray-100 text-gray-500 hover:bg-gray-50'
                                                }`}
                                            >
                                                <perm.icon size={16} />
                                                {perm.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button 
                                        type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 px-6 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                                    >
                                        {editingAdmin ? 'Update Admin' : 'Save Admin'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminUserManagement;
