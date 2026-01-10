import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Mail, Hash, User as UserIcon } from 'lucide-react';

const StudentsList = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '', // Make optional in UI if allowed, but backend creates User so needs unique email usually. Let's keep required.
        password: '',
        gender: 'Male',
        studentId: '', // Admission Number
        level: 'SSS', // Default
        classId: ''
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

            await api.post('/students', data);
            setShowForm(false);
            setFormData({ 
                firstName: '', lastName: '', email: '', password: '', 
                gender: 'Male', studentId: '', level: 'SSS', classId: '' 
            });
            setFile(null);
            fetchStudents();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating student');
        }
    };

    const [file, setFile] = useState(null);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
             <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Students</h1>
                {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add New Student</span>
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">Add New Student</h3>
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
                            placeholder="Student ID / Admission No."
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.studentId}
                            onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                            required
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
                            onChange={(e) => setFormData({...formData, classId: e.target.value})}
                            required
                        >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                                <option key={cls._id} value={cls._id}>{cls.name}</option>
                            ))}
                        </select>
                        
                         <select
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none bg-white"
                            value={formData.level}
                            onChange={(e) => setFormData({...formData, level: e.target.value})}
                        >
                            <option>JSS</option>
                            <option>SSS</option>
                        </select>

                        <input
                            type="password"
                            placeholder="Temporary Password"
                            className="px-4 py-2 border rounded-lg focus:ring-1 focus:ring-primary outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                        
                        <div className="md:col-span-2 flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                             <button 
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                            >
                                Create Student
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
                        {students.map((student) => (
                            <tr key={student._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                          {student.profilePicture ? (
                                            <img src={`http://localhost:5001/${student.profilePicture}`} className="w-10 h-10 rounded-full object-cover" alt="" />
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
                                        {student.classId?.name || 'Unassigned'}
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
                                    <Link to={`/students/${student._id}`} className="text-primary hover:underline text-sm font-medium">View Profile</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {students.length === 0 && (
                     <div className="p-12 text-center text-gray-500">
                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                             <UserIcon className="text-gray-400" size={24} />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-1">No students found</h3>
                        <p className="text-sm">Add students to begin tracking their progress.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentsList;
