import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Plus, Mail, Phone, MapPin, MoreVertical, Briefcase, Edit, Trash2 } from 'lucide-react';
 
import usePageTitle from '../hooks/usePageTitle';

import Loader from '../components/Loader';

const TeachersList = () => {
    usePageTitle('Teachers');
    const { user, checkLimit } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentTeacherId, setCurrentTeacherId] = useState(null);
    
    // Filters & Sorting
    const [filterName, setFilterName] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        gender: 'Male',
        qualification: '',
        phoneNumber: '',
        subjects: [] 
    });

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const res = await api.get('/teachers');
            setTeachers(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching teachers', error);
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await fetchTeachers();
    };

    // Filter Logic
    const filteredTeachers = teachers.filter(teacher => {
        const fullName = `${teacher.firstName} ${teacher.lastName}`.toLowerCase();
        const matchesName = fullName.includes(filterName.toLowerCase()) || 
                          teacher.email.toLowerCase().includes(filterName.toLowerCase());
        return matchesName;
    });

    // Sort Logic
    const sortedTeachers = [...filteredTeachers].sort((a, b) => {
        let aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
        let bValue = `${b.firstName} ${b.lastName}`.toLowerCase();

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
                    // Handle array if needed, currently empty array in state
                } else {
                    data.append(key, formData[key]);
                }
            });
            // If file selected (needs state for file)
            if (file) {
                data.append('profilePicture', file);
            }

            if (editMode) {
                await api.put(`/teachers/${currentTeacherId}`, data);
                // showNotification('Teacher updated successfully', 'success'); // Assuming notification context is available or add alert
                alert('Teacher updated successfully');
            } else {
                await api.post('/teachers', data);
                // showNotification('Teacher created successfully', 'success');
                alert('Teacher created successfully');
            }
            
            resetForm();
            handleRefresh();
        } catch (error) {
            alert(error.response?.data?.message || 'Error processing request');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this teacher? This action cannot be undone.')) {
            try {
                await api.delete(`/teachers/${id}`);
                // showNotification('Teacher deleted successfully', 'success');
                alert('Teacher deleted successfully');
                handleRefresh();
            } catch (error) {
                console.error("Error deleting teacher", error);
                alert(error.response?.data?.message || 'Error deleting teacher');
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
            password: '', // Leave empty to keep unchanged
            gender: teacher.gender,
            qualification: teacher.qualification,
            phoneNumber: teacher.phoneNumber || '',
            subjects: teacher.subjects || []
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setShowForm(false);
        setEditMode(false);
        setCurrentTeacherId(null);
        setFormData({ 
            firstName: '', lastName: '', email: '', password: '', 
            gender: 'Male', qualification: '', phoneNumber: '', subjects: [] 
        });
        setFile(null);
        // Reset file input not captured in ref here but okay
    };
    
    // Add file state
    const [file, setFile] = useState(null);

    // ... Render Logic ...
    if (loading) return <Loader type="spinner" />;

    return (
        <div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
                     <button 
                        onClick={handleRefresh}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100"
                        title="Refresh List"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"></path><path d="M3 12a9 9 0 0 1 15-6.7L21 8"></path><path d="M3 22v-6h6"></path><path d="M21 12a9 9 0 0 1-15 6.7L3 16"></path></svg>
                    </button>
                </div>
                
                {/* Filters & Actions Group */}
                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            placeholder="Search by name or email..." 
                            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-64 focus:outline-none focus:ring-1 focus:ring-primary"
                            value={filterName}
                            onChange={(e) => setFilterName(e.target.value)}
                        />
                    </div>

                    {/* Sort */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-600 hidden md:inline">Sort By:</span>
                        <select 
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white cursor-pointer"
                            value={`${sortConfig.key}-${sortConfig.direction}`}
                            onChange={(e) => {
                                const [key, direction] = e.target.value.split('-');
                                setSortConfig({ key, direction });
                            }}
                        >
                            <option value="name-asc">Name (A-Z)</option>
                            <option value="name-desc">Name (Z-A)</option>
                        </select>
                    </div>

                    {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                        <div className="flex flex-col items-end">
                            <button 
                                onClick={() => { 
                                    if (checkLimit('Teacher', teachers.length)) {
                                        resetForm(); setShowForm(!showForm); 
                                    } else {
                                        alert('Subscription Limit Reached. Please upgrade your plan to add more teachers.');
                                    }
                                }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                                    checkLimit('Teacher', teachers.length) 
                                    ? 'bg-primary text-white hover:bg-green-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Plus size={20} />
                                <span>{showForm ? 'Cancel' : 'Add New Teacher'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">{editMode ? 'Edit Teacher Profile' : 'Add New Teacher Profile'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* File Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files[0])}
                                className="w-full p-2 border rounded-lg"
                            />
                        </div>

                        <input
                            placeholder="First Name"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            required
                        />
                        <input
                            placeholder="Last Name"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                         <input
                            placeholder="Phone Number"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.phoneNumber}
                            onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                        <select
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                        <input
                            placeholder="Qualification (e.g. B.Ed, MSc)"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.qualification}
                            onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        />
                        
                        {/* Password is now auto-generated based on School Default */}
                        
                        <div className="md:col-span-2 flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                            <button 
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                {editMode ? 'Update Profile' : 'Create Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Full Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Qualification</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedTeachers.map((teacher) => (
                            <tr key={teacher._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        {teacher.profilePicture ? (
                                            <img src={teacher.profilePicture} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <div className="font-bold text-lg">{teacher.firstName[0]}</div>
                                            </div>
                                        )}
                                        <div>
                                            <div className="font-medium text-gray-800">{teacher.firstName} {teacher.lastName}</div>
                                            <div className="text-xs text-gray-400 capitalize">{teacher.gender}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                    <div className="flex items-center space-x-2 text-sm">
                                        <Mail size={14} />
                                        <span>{teacher.email}</span>
                                    </div>
                                    {teacher.phoneNumber && (
                                        <div className="flex items-center space-x-2 text-sm mt-1 text-gray-500">
                                            <Phone size={14} />
                                            <span>{teacher.phoneNumber}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center space-x-2">
                                        <Briefcase size={16} className="text-gray-400" />
                                        <span className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                            {teacher.qualification || 'N/A'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/teachers/${teacher._id}`} className="text-primary hover:underline font-medium text-sm">View Profile</Link>
                                        {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                                            <>
                                                <button 
                                                    onClick={() => handleEdit(teacher)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(teacher._id)}
                                                    className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {sortedTeachers.length === 0 && (
                    <div className="p-12 text-center text-gray-500">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Briefcase className="text-gray-400" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">No teachers yet</h3>
                        <p className="text-sm">Add a new teacher profile to get started.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeachersList;
