import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, Search, Plus, Mail, Phone, MapPin, MoreVertical, Briefcase } from 'lucide-react';
 
import usePageTitle from '../hooks/usePageTitle';

const TeachersList = () => {
    usePageTitle('Teachers');
    const { user } = useAuth();
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
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

            await api.post('/teachers', data);
            setShowForm(false);
            setFormData({ 
                firstName: '', lastName: '', email: '', password: '', 
                gender: 'Male', qualification: '', phoneNumber: '', subjects: [] 
            });
            setFile(null);
            fetchTeachers();
        } catch (error) {
            alert(error.response?.data?.message || 'Error creating teacher');
        }
    };
    
    // Add file state
    const [file, setFile] = useState(null);

    // ... (rest of render)
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
                {(user?.role === 'school_admin' || user?.role === 'super_admin') && (
                    <button 
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus size={20} />
                        <span>Add New Teacher</span>
                    </button>
                )}
            </div>
            {showForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 animate-fade-in">
                    <h3 className="text-lg font-bold mb-4">Add New Teacher Profile</h3>
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
                        <input
                            type="password"
                            placeholder="Default Password"
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
                                Create Profile
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
                        {teachers.map((teacher) => (
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
                                    <Link to={`/teachers/${teacher._id}`} className="text-primary hover:underline font-medium text-sm">View Profile</Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {teachers.length === 0 && (
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
