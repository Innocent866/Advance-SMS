import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Plus, Search, Mail, Hash, User as UserIcon, Edit, Trash2 } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

import Loader from '../components/Loader';

const StudentsList = () => {
    usePageTitle('Students');
    const { user, checkLimit } = useAuth();
    const { showNotification } = useNotification();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentStudentId, setCurrentStudentId] = useState(null);
    
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
        arm: ''
    });

    useEffect(() => {
        fetchStudents();
        fetchClasses();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await api.get('/students');
            setStudents(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching students', error);
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/academic/classes');
            setClasses(res.data);
        } catch (error) {
            console.error('Error fetching classes', error);
        }
    };

    // Filter Logic
    const filteredStudents = students.filter(student => {
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
        const matchesName = fullName.includes(filterName.toLowerCase()) || 
                          student.email.toLowerCase().includes(filterName.toLowerCase());
        const matchesClass = filterClass ? (student.classId?._id === filterClass) : true;
        return matchesName && matchesClass;
    });

    // Sort Logic
    const sortedStudents = [...filteredStudents].sort((a, b) => {
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

   const [file, setFile] = useState(null);
    const fileInputRef = useRef(null);

    // Refresh function
    const handleRefresh = async () => {
        setLoading(true);
        await Promise.all([fetchStudents(), fetchClasses()]);
        setLoading(false);
    };

    if (loading) return <Loader type="spinner" />;

    // Derived state for arms
    const selectedClass = classes.find(c => c._id === formData.classId);
    const availableArms = selectedClass?.arms || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                 data.append(key, formData[key]);
            });
            
             // If file selected
            if (file) {
                data.append('profilePicture', file);
            }

            if (editMode) {
                await api.put(`/students/${currentStudentId}`, data);
                showNotification('Student updated successfully', 'success');
            } else {
                await api.post('/students', data);
                showNotification('Student created successfully', 'success');
            }

            resetForm();
            handleRefresh(); 
        } catch (error) {
           console.error("Error submitting form", error);
           showNotification(error.response?.data?.message || 'Error processing request', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student? This action cannot be undone.')) {
            try {
                await api.delete(`/students/${id}`);
                showNotification('Student deleted successfully', 'success');
                handleRefresh();
            } catch (error) {
                console.error("Error deleting student", error);
                showNotification(error.response?.data?.message || 'Error deleting student', 'error');
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
            password: '', // Leave empty to keep unchanged
            gender: student.gender,
            level: student.level,
            classId: student.classId?._id || student.classId,
            arm: student.arm || ''
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
            gender: 'Male', level: 'SSS', classId: '', arm: '' 
        });
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

   // ... Render Logic ...
    return (
        <div>
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-gray-800">Students</h1>
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

                    {/* Class Filter */}
                    <div className="relative">
                        <select 
                            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary bg-white appearance-none pr-8 cursor-pointer"
                            value={filterClass}
                            onChange={(e) => setFilterClass(e.target.value)}
                        >
                            <option value="">Filter: All Classes</option>
                            {[...classes].sort((a,b) => a.name.localeCompare(b.name)).map(c => (
                                <option key={c._id} value={c._id}>{c.name}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-.707-.707L10 12.586 9.293 12.95zm-2.293-2.293L2.293 5.95 3 5.243l6.293 6.293-.707.707z"/></svg>
                        </div>
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
                            <option value="class-asc">Class Level (A-Z)</option>
                            <option value="class-desc">Class Level (Z-A)</option>
                        </select>
                    </div>

                    {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                        <div className="flex flex-col items-end">
                            <button 
                                onClick={() => { 
                                    if (checkLimit('Student', students.length)) {
                                        resetForm(); setShowForm(!showForm); 
                                    } else {
                                        alert('Subscription Limit Reached. Please upgrade your plan to add more students.');
                                    }
                                }}
                                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                                    checkLimit('Student', students.length) 
                                    ? 'bg-primary text-white hover:bg-green-700' 
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <Plus size={20} />
                                <span>{showForm ? 'Cancel' : 'Add Student'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">{editMode ? 'Edit Student' : 'Add New Student'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* File Input */}
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Picture (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                ref={fileInputRef}
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
                        {/* Duplicate Last Name removed */}
                         {/* Student ID is now Auto Generated */}
                         <select
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                            value={formData.gender}
                            onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        >
                            <option>Male</option>
                            <option>Female</option>
                        </select>
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                       
                        <select
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                            value={formData.classId}
                            onChange={(e) => setFormData({...formData, classId: e.target.value, arm: ''})}
                            required
                        >
                            <option value="">Select Class</option>
                            {[...classes].sort((a,b) => a.name.localeCompare(b.name)).map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                        
                        {formData.classId && (
                            availableArms.length > 0 ? (
                                <select
                                    className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
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
                                    placeholder="Enter Arm (Optional)"
                                    className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                                    value={formData.arm}
                                    onChange={(e) => setFormData({...formData, arm: e.target.value})}
                                />
                            )
                        )}

                        <select
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                        >
                            <option>JSS</option>
                            <option>SSS</option>
                        </select>

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
                                {editMode ? 'Update Student' : 'Create Student'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-600">Student Info</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Class</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Contact</th>
                            <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {sortedStudents.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                          {student.profilePicture ? (
                                            <img src={student.profilePicture} className="w-10 h-10 rounded-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                                                <div className="font-bold text-lg">{student.firstName[0]}</div>
                                            </div>
                                        )}
                                        <div>
                                             <div className="font-bold text-gray-800">{student.firstName} {student.lastName}</div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-mono tracking-wide">{student.studentId}</span>
                                                <span className="capitalize">• {student.gender}</span>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">
                                        {student.classId?.name || 'Unassigned'} {student.arm ? `(${student.arm})` : ''}
                                    </span>
                                    <div className="text-xs text-gray-400 mt-1 pl-1">Level: {student.level}</div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                     <div className="flex items-center space-x-2 text-sm">
                                        <Mail size={14} />
                                        <span>{student.email}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/students/${student._id}`} className="text-primary hover:underline text-sm font-medium">View Profile</Link>
                                        {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                                            <>
                                                <button 
                                                    onClick={() => handleEdit(student)}
                                                    className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(student._id)}
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
                 {sortedStudents.length === 0 && (
                     <div className="p-12 text-center text-gray-500">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                             <UserIcon className="text-gray-400" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">No students found</h3>
                        <p className="text-sm">Try adjusting your filters or add new students.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsList;
