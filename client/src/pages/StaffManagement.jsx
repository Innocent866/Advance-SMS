import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Mail, 
    Phone, 
    Home, 
    Trash2, 
    Edit2, 
    X,
    Filter,
    Search,
    Upload,
    Camera,
    BookOpen,
    Calendar,
    HeartPulse
} from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import toast from 'react-hot-toast';

const StaffManagement = () => {
    usePageTitle('Staff Management');
    const [staff, setStaff] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [hostels, setHostels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [editingStaff, setEditingStaff] = useState(null);
    const [profileImage, setProfileImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'teacher',
        phoneNumber: '',
        gender: 'Male',
        designation: '',
        departmentId: '',
        subjects: [],
        assignedHouse: '',
        dateAssigned: '',
        emergencyContact: {
            name: '',
            relationship: '',
            phone: ''
        }
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [staffRes, deptRes, subjectRes, hostelRes] = await Promise.all([
                api.get('/staff/unified'),
                api.get('/departments'),
                api.get('/academic/subjects'),
                api.get('/hostels')
            ]);
            
            // Filter only teaching and boarding staff
            const filteredStaff = staffRes.data.data.filter(s => 
                ['teacher', 'house_parent', 'hostel_warden'].includes(s.userId?.role)
            );
            
            setStaff(filteredStaff);
            setDepartments(deptRes.data.data);
            setSubjects(subjectRes.data.data || []);
            setHostels(hostelRes.data.data || []);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (['subjects', 'emergencyContact'].includes(key)) {
                    data.append(key, JSON.stringify(formData[key]));
                } else if (formData[key] !== undefined && formData[key] !== null && formData[key] !== '') {
                    data.append(key, formData[key]);
                }
            });

            if (profileImage) {
                data.append('profilePicture', profileImage);
            }

            if (editingStaff) {
                await api.put(`/staff/${editingStaff._id}`, data);
                toast.success('Staff updated successfully');
            } else {
                await api.post('/staff', data);
                toast.success('Staff added successfully');
            }
            setShowModal(false);
            setEditingStaff(null);
            resetForm();
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/staff/${id}`);
            toast.success('Staff removed successfully');
            fetchData();
        } catch (error) {
            toast.error('Failed to remove staff');
        }
    };

    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            role: 'teacher',
            phoneNumber: '',
            gender: 'Male',
            designation: '',
            departmentId: '',
            subjects: [],
            assignedHouse: '',
            dateAssigned: '',
            emergencyContact: {
                name: '',
                relationship: '',
                phone: ''
            }
        });
        setProfileImage(null);
        setImagePreview(null);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const toggleSubject = (subjectId) => {
        const current = [...formData.subjects];
        if (current.includes(subjectId)) {
            setFormData({ ...formData, subjects: current.filter(id => id !== subjectId) });
        } else {
            setFormData({ ...formData, subjects: [...current, subjectId] });
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || s.userId?.role === filterRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Staff Management</h1>
                    <p className="text-gray-500">Manage teachers and school staff.</p>
                </div>
                <button 
                    onClick={() => { setShowModal(true); setEditingStaff(null); resetForm(); }}
                    className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-all font-bold shadow-lg shadow-primary-200"
                >
                    <UserPlus size={20} />
                    <span>Add New Staff</span>
                </button>
            </header>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search staff by name or email..."
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        className="border border-gray-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 outline-none"
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                    >
                        <option value="all">All Roles</option>
                        <option value="teacher">Teachers</option>
                        <option value="house_parent">Houseparents</option>
                        <option value="hostel_warden">Hostel Wardens</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-gray-500">Loading staff directory...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredStaff.map((member) => (
                        <motion.div 
                            layout
                            key={member._id}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all relative group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600">
                                    {member.profilePicture ? (
                                        <img src={member.profilePicture} alt="" className="w-full h-full object-cover rounded-2xl" />
                                    ) : (
                                        <Users size={32} />
                                    )}
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => {
                                            setEditingStaff(member);
                                            setFormData({
                                                firstName: member.firstName,
                                                lastName: member.lastName,
                                                email: member.email,
                                                role: member.userId?.role,
                                                phoneNumber: member.phoneNumber || '',
                                                gender: member.gender || 'Male',
                                                designation: member.designation || '',
                                                departmentId: member.departmentId?._id || member.departmentId || '',
                                                subjects: member.subjects?.map(s => s._id || s) || [],
                                                assignedHouse: member.assignedHouse?._id || member.assignedHouse || '',
                                                dateAssigned: member.dateAssigned ? member.dateAssigned.split('T')[0] : '',
                                                emergencyContact: member.emergencyContact || { name: '', relationship: '', phone: '' }
                                            });
                                            setImagePreview(member.profilePicture);
                                            setShowModal(true);
                                        }}
                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(member._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-800 text-lg">{member.firstName} {member.lastName}</h3>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        member.userId?.role === 'teacher' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'
                                    }`}>
                                        {member.userId?.role?.replace('_', ' ')}
                                    </span>
                                    {member.departmentId && (
                                        <span className="text-xs text-gray-400 capitalize">• {(member.departmentId.name || 'Dept')}</span>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col gap-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Mail size={16} className="text-gray-400" />
                                    <span>{member.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Phone size={16} className="text-gray-400" />
                                    <span>{member.phoneNumber || 'No phone'}</span>
                                </div>
                                {member.assignedHouse && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                                        <Home size={16} className="text-orange-400" />
                                        <span>House: {member.assignedHouse.name}</span>
                                    </div>
                                )}
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
                            className="bg-white rounded-3xl p-8 max-w-4xl w-full shadow-2xl overflow-y-auto max-h-[90vh]"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editingStaff ? 'Edit Staff Profile' : 'Add New Staff'}
                                </h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={24} className="text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {/* Column 1: Profile & Basic */}
                                    <div className="space-y-6">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <div className="relative group">
                                                <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                                                    {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera className="text-gray-300" />}
                                                </div>
                                                <label className="absolute -bottom-1 -right-1 p-2 bg-primary-600 text-white rounded-lg cursor-pointer">
                                                    <Upload size={14} />
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                                </label>
                                            </div>
                                            <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Profile Picture</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Role</label>
                                                <select 
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                    value={formData.role}
                                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                                >
                                                    <option value="teacher">Teacher</option>
                                                    <option value="house_parent">Houseparent</option>
                                                    <option value="hostel_warden">Hostel Warden</option>
                                                </select>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Gender</label>
                                                <select 
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                    value={formData.gender}
                                                    onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Column 2: Personal Details */}
                                    <div className="space-y-4 col-span-2 grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">First Name</label>
                                            <input 
                                                type="text" required
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Last Name</label>
                                            <input 
                                                type="text" required
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1 col-span-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Email Address</label>
                                            <input 
                                                type="email" required disabled={editingStaff}
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm disabled:bg-gray-50"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                            <input 
                                                type="text"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.phoneNumber}
                                                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                                            />
                                        </div>
                                        {!editingStaff && (
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Password</label>
                                                <input 
                                                    type="password"
                                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                    placeholder="Default: staff123"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="h-px bg-gray-100 w-full"></div>

                                {/* Role Specific Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {formData.role === 'teacher' ? (
                                        <>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <BookOpen size={16} className="text-primary-500" />
                                                    Department & Subjects
                                                </label>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Main Department</label>
                                                    <select 
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        value={formData.departmentId}
                                                        onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
                                                    >
                                                        <option value="">Select Department</option>
                                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Assigned Subjects</label>
                                                <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                                    {subjects.map(s => (
                                                        <button
                                                            key={s._id} type="button"
                                                            onClick={() => toggleSubject(s._id)}
                                                            className={`text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                                                formData.subjects.includes(s._id)
                                                                ? 'bg-primary-600 text-white shadow-sm'
                                                                : 'bg-white text-gray-600 border border-gray-100 hover:border-primary-300'
                                                            }`}
                                                        >
                                                            {s.name}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="space-y-4">
                                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                                    <Home size={16} className="text-orange-500" />
                                                    Boarding Assignment
                                                </label>
                                                <div className="space-y-1">
                                                    <label className="text-xs font-bold text-gray-500 uppercase">Assigned House</label>
                                                    <select 
                                                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        value={formData.assignedHouse}
                                                        onChange={(e) => setFormData({...formData, assignedHouse: e.target.value})}
                                                    >
                                                        <option value="">Select House</option>
                                                        {hostels.map(h => <option key={h._id} value={h._id}>{h.name} ({h.type})</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-bold text-gray-500 uppercase">Date Assigned</label>
                                                <div className="relative">
                                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                                    <input 
                                                        type="date"
                                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                        value={formData.dateAssigned}
                                                        onChange={(e) => setFormData({...formData, dateAssigned: e.target.value})}
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>

                                <div className="h-px bg-gray-100 w-full"></div>

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                        <HeartPulse size={16} className="text-red-500" />
                                        Emergency Contact Info
                                    </label>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Contact Name</label>
                                            <input 
                                                type="text"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.emergencyContact.name}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    emergencyContact: {...formData.emergencyContact, name: e.target.value}
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Relationship</label>
                                            <input 
                                                type="text"
                                                placeholder="e.g. Spouse, Parent"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.emergencyContact.relationship}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                                                })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                                            <input 
                                                type="text"
                                                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                                value={formData.emergencyContact.phone}
                                                onChange={(e) => setFormData({
                                                    ...formData, 
                                                    emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex gap-4">
                                    <button 
                                        type="button" onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 px-6 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 px-6 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 shadow-lg shadow-primary-200"
                                    >
                                        {editingStaff ? 'Save Changes' : 'Add Staff'}
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

export default StaffManagement;
