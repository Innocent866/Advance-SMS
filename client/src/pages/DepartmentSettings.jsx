import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { 
    Building, 
    User, 
    Plus, 
    Edit2, 
    Trash2, 
    X, 
    Search,
    ChevronRight,
    Users
} from 'lucide-react';
import Loader from '../components/Loader';
import { useNotification } from '../context/NotificationContext';

const DepartmentSettings = () => {
    usePageTitle('Department Management');
    const { showNotification } = useNotification();
    
    const [departments, setDepartments] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [selectedDept, setSelectedDept] = useState(null);
    
    const [formData, setFormData] = useState({
        name: '',
        hodId: '',
        description: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, teacherRes] = await Promise.all([
                api.get('/departments'),
                api.get('/teachers')
            ]);
            setDepartments(deptRes.data.data);
            setTeachers(teacherRes.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching departments:', error);
            showNotification('Failed to load data', 'error');
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await api.put(`/departments/${editId}`, formData);
                showNotification('Department updated successfully', 'success');
            } else {
                await api.post('/departments', formData);
                showNotification('Department created successfully', 'success');
            }
            setShowModal(false);
            setFormData({ name: '', hodId: '', description: '' });
            setEditId(null);
            fetchData();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Action failed', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/departments/${id}`);
            showNotification('Department deleted', 'success');
            fetchData();
        } catch (error) {
            showNotification('Failed to delete department', 'error');
        }
    };

    const filteredDepartments = departments.filter(d => 
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.hodId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <Loader type="spinner" />;

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 bg-gradient-to-br from-white to-gray-50 p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 flex items-center gap-4 tracking-tight">
                        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <Building size={32} />
                        </div>
                        Departments
                    </h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">Manage your school's departments and assign heads.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditId(null);
                        setFormData({ name: '', hodId: '', description: '' });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-3 bg-primary text-white px-8 py-4 rounded-2xl font-bold hover:bg-opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 group"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                    Add Department
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="relative w-full md:w-[450px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input 
                                type="text"
                                placeholder="Find a department or HOD..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-2xl focus:ring-4 focus:ring-primary/5 focus:bg-white outline-none transition-all font-medium text-gray-700"
                            />
                        </div>
                        <div className="flex items-center gap-3 px-5 py-2.5 bg-gray-50 rounded-full border border-gray-100 italic">
                            <Users size={16} className="text-primary" />
                            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                                {filteredDepartments.length} Active Departments
                            </span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-8 py-6 text-left">Department Name</th>
                                    <th className="px-8 py-6 text-left">Head of Dept</th>
                                    <th className="px-8 py-6 text-center">Staff Count</th>
                                    <th className="px-8 py-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredDepartments.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200">
                                                    <Search size={40} />
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">No departments found</h3>
                                                    <p className="text-gray-400 mt-1">Try a different search term or add a new one.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredDepartments.map((dept) => (
                                        <tr key={dept._id} className="hover:bg-gray-50/50 transition-colors group">
                                            <td className="px-8 py-7">
                                                <div className="flex flex-col">
                                                    <span className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors tracking-tight">
                                                        {dept.name}
                                                    </span>
                                                    {dept.description && (
                                                        <span className="text-sm text-gray-500 mt-1 max-w-sm line-clamp-2 font-medium italic">
                                                            {dept.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center gap-4 p-3 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm w-fit group-hover:shadow-md transition-all">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary flex items-center justify-center font-black text-lg border border-primary/10">
                                                        {dept.hodId?.name?.[0]}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-gray-900 text-sm tracking-tight">{dept.hodId?.name}</span>
                                                        <span className="text-xs text-gray-500 font-bold opacity-70 italic">{dept.hodId?.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-7 text-center">
                                                <button 
                                                    onClick={() => {
                                                        setSelectedDept(dept);
                                                        setShowMembersModal(true);
                                                    }}
                                                    className="inline-flex flex-col items-center gap-1 group/count hover:scale-105 transition-transform"
                                                >
                                                    <span className="text-2xl font-black text-gray-900 group-hover/count:text-primary transition-colors">
                                                        {teachers.filter(t => t.departmentId?._id === dept._id || t.departmentId === dept._id).length}
                                                    </span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/count:text-primary/70">Members</span>
                                                </button>
                                            </td>
                                            <td className="px-8 py-7">
                                                <div className="flex items-center justify-end gap-3">
                                                    <button 
                                                        onClick={() => {
                                                            setEditId(dept._id);
                                                            setFormData({
                                                                name: dept.name,
                                                                hodId: dept.hodId?._id || '',
                                                                description: dept.description || ''
                                                            });
                                                            setShowModal(true);
                                                        }}
                                                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/5 rounded-2xl transition-all border border-transparent hover:border-primary/10 active:scale-90"
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(dept._id)}
                                                        className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all border border-transparent hover:border-red-100 active:scale-90"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Premium Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editId ? 'Edit Department' : 'Add Department'}
                                </h3>
                                <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">System Configuration</p>
                            </div>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 shadow-sm transition-all active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-10 space-y-8">
                            <div className="group">
                                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">Department Name</label>
                                <input 
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="e.g. Science & Technology"
                                    className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all text-gray-900 font-bold text-lg"
                                    required
                                />
                            </div>
                            <div className="group">
                                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">Head of Department</label>
                                <div className="relative">
                                    <select 
                                        value={formData.hodId}
                                        onChange={(e) => setFormData({...formData, hodId: e.target.value})}
                                        className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all text-gray-900 font-bold appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="">Select a teacher...</option>
                                        {teachers.map(teacher => (
                                            <option key={teacher._id} value={teacher.userId?._id || teacher.userId}>
                                                {teacher.firstName} {teacher.lastName} ({teacher.email})
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                        <ChevronRight className="rotate-90" size={20} />
                                    </div>
                                </div>
                            </div>
                            <div className="group">
                                <label className="block text-xs font-black text-gray-400 mb-3 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors">Description (Optional)</label>
                                <textarea 
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    rows="3"
                                    placeholder="Briefly describe the focus of this department..."
                                    className="w-full px-6 py-5 rounded-[1.5rem] bg-gray-50 border-2 border-transparent focus:bg-white focus:border-primary/20 outline-none transition-all text-gray-900 font-bold resize-none leading-relaxed"
                                />
                            </div>
                            <div className="pt-4 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-8 py-5 border-2 border-gray-100 text-gray-500 rounded-[1.5rem] font-black hover:bg-gray-50 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-[2] px-8 py-5 bg-primary text-white rounded-[1.5rem] font-black hover:bg-opacity-90 transition-all shadow-2xl shadow-primary/30 active:scale-95 text-lg"
                                >
                                    {editId ? 'Save Changes' : 'Add Department'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Department Members Modal */}
            {showMembersModal && selectedDept && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-xl flex items-center justify-center p-4 z-[9998] animate-in fade-in duration-300">
                    <div className="bg-white rounded-[3rem] shadow-3xl max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
                        <div className="p-10 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {selectedDept.name} Members
                                </h3>
                                <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest opacity-60">Department Roster</p>
                            </div>
                            <button 
                                onClick={() => setShowMembersModal(false)}
                                className="w-12 h-12 flex items-center justify-center bg-white text-gray-400 hover:text-red-500 rounded-2xl border border-gray-100 shadow-sm transition-all shadow-xl active:scale-90"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-10 space-y-6">
                            {(() => {
                                const members = teachers.filter(t => t.departmentId?._id === selectedDept._id || t.departmentId === selectedDept._id);
                                if (members.length === 0) {
                                    return (
                                        <div className="text-center py-10 italic text-gray-400 font-medium">
                                            No members assigned to this department yet.
                                        </div>
                                    );
                                }
                                return members.map(member => (
                                    <div key={member._id} className="flex items-center justify-between p-6 bg-gray-50 rounded-3xl border border-gray-100 hover:bg-white hover:shadow-xl hover:shadow-gray-200/50 transition-all border-none group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                {member.profilePicture ? (
                                                    <img src={member.profilePicture} alt="" className="w-full h-full rounded-2xl object-cover" />
                                                ) : (
                                                    <User size={24} />
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-black text-gray-900 tracking-tight">
                                                    {member.firstName} {member.lastName}
                                                </h4>
                                                <p className="text-xs text-gray-500 font-bold opacity-70 italic">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                member.role === 'hostel_warden' ? 'bg-indigo-50 text-indigo-600' :
                                                member.role === 'house_parent' ? 'bg-violet-50 text-violet-600' : 'bg-emerald-50 text-emerald-600'
                                            }`}>
                                                {member.role || 'Teacher'}
                                            </span>
                                            {member.subjects && member.subjects.length > 0 && (
                                                <span className="text-[10px] text-gray-400 font-bold mt-2 italic truncate max-w-[150px]">
                                                    {member.subjects.map(s => s.name).join(', ')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ));
                            })()}
                        </div>
                        
                        <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex justify-center sticky bottom-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] italic">
                                Total Members: {teachers.filter(t => t.departmentId?._id === selectedDept._id || t.departmentId === selectedDept._id).length}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DepartmentSettings;
