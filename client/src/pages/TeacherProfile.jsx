import { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { User, Lock, Save, BookOpen, Layers } from 'lucide-react';

const TeacherProfile = () => {
    const { user, login } = useAuth(); // login is helper to update user state
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
            const res = await api.put('/auth/profile', { name: profile.name });
            // Update auth context
            // Assuming login() accepts userData and token, or we might need a dedicated update function
            // Re-using local storage update logic in context if available, or just alert success
            alert('Profile updated successfully!');
            // Force reload or Context update ideally
            window.location.reload(); 
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            alert("New passwords don't match");
            return;
        }
        setLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            alert('Password changed successfully');
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <User /> My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Profile Details */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Personal Information</h3>
                        
                        <div className="flex justify-center mb-6">
                            {profile.profilePicture ? (
                                <img 
                                    src={profile.profilePicture} 
                                    alt="Profile" 
                                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                                />
                            ) : (
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <User size={48} />
                                </div>
                            )}
                        </div>

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
