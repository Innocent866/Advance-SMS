import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Mail, Phone, Briefcase, BookOpen, Users, Calendar, Lock, Layers } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const TeacherProfile = () => {
    usePageTitle('My Profile');
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const [teacher, setTeacher] = useState(null);
    const [profile, setProfile] = useState({ name: '', email: '' });
    const [assignments, setAssignments] = useState([]);
    
    // Password Form
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setProfile({ name: user.name, email: user.email });
            // For now, we assume user object has subjects populated or we fetch fresh "me"
            fetchAssignments(); 
        }
    }, [user]);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/teachers/me');
            if (res.data) {
                setProfile(prev => ({ 
                    ...prev, 
                    name: `${res.data.firstName} ${res.data.lastName}`, 
                    email: res.data.email,
                    profilePicture: res.data.profilePicture
                }));
            }
            if (res.data.teachingAssignments) {
                setAssignments(res.data.teachingAssignments);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/auth/profile', { name: profile.name });
            showNotification('Profile updated successfully!', 'success');
            // Force reload or Context update ideally
            setTimeout(() => window.location.reload(), 1000); 
        } catch (error) {
           // Error handled globally via api.js
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            showNotification("New passwords don't match", 'error');
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            showNotification('Password changed successfully', 'success');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            // api.js handles generic errors, but if we want specific local handling:
            // showNotification(error.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header Removed for Cover Design */}

            {/* Cover Background */}
            <div className="relative mb-20 rounded-b-3xl -mx-4 -mt-8 md:-mt-8 md:-mx-4">
                <div className="h-48 bg-gradient-to-r from-emerald-500 to-teal-700 rounded-b-3xl shadow-sm"></div>
                
                {/* Profile Header Overlap */}
                <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8 flex flex-col md:flex-row items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                             {profile.profilePicture ? (
                                <img 
                                    src={profile.profilePicture} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                    <User size={64} />
                                </div>
                            )}
                        </div>
                        {/* Status Dot */}
                        <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                     {/* Name */}
                     <div className="mb-2 md:mb-4 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm md:text-white md:drop-shadow-md">
                            {profile.name}
                        </h1>
                        <p className="text-gray-600 font-medium md:text-white/90 md:font-normal">
                             Teacher • {assignments.length} Active Classes
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                
                {/* Profile Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                        
                        {/* Avatar removed from here as it's now in header */}

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input 
                                    className="w-full p-2 border rounded" 
                                    value={profile.name} 
                                    onChange={e => setProfile({...profile, name: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email (Read Only)</label>
                                <input 
                                    className="w-full p-2 border rounded bg-gray-50 text-gray-500" 
                                    value={profile.email} 
                                    disabled 
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 transition"
                            >
                                {loading ? 'Saving...' : 'Update Profile'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                            <Lock size={18} /> Security
                        </h3>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Current Password</label>
                                <input 
                                    type="password" 
                                    className="w-full p-2 border rounded" 
                                    value={passwords.current}
                                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full p-2 border rounded" 
                                    value={passwords.new}
                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full p-2 border rounded" 
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                />
                            </div>
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-gray-800 text-white py-2 rounded hover:bg-opacity-90 transition"
                            >
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>

                {/* Assignments (Read Only) */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-fit">
                    <h3 className="font-bold text-gray-700 mb-4 border-b pb-2 flex items-center gap-2">
                        <BookOpen size={18} /> My Assignments
                    </h3>
                    
                    {assignments.length === 0 ? (
                        <p className="text-gray-500 italic">No classes assigned yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assign, idx) => (
                                <div key={idx} className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                                    <div className="flex items-center gap-2 font-semibold text-blue-800">
                                        <Layers size={16} />
                                        <span>{assign.subjectId?.name || 'Unknown Subject'}</span>
                                    </div>
                                    <div className="text-sm text-blue-600 mt-1 pl-6">
                                        {assign.classId?.name || 'Unknown Class'} {assign.arm ? `(Arm ${assign.arm})` : ''}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-4">
                        * Assignments are managed by the School Administrator. Contact admin for changes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
