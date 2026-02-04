
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, BookOpen, GraduationCap, Mail, School } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

const StudentProfile = () => {
    usePageTitle('My Profile');
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/students/me');
            setProfile(res.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile', error);
            setLoading(false);
        }
    };

    if (loading) return <Loader type="spinner" />;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header Removed to use Cover Overlap Style */}

            {/* Cover Background */}
            <div className="relative mb-20 rounded-b-3xl -mx-4 -mt-8 md:-mt-8 md:-mx-4">
                <div className="h-48 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-b-3xl shadow-sm"></div>
                
                {/* Profile Header Overlap */}
                <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8 flex flex-col md:flex-row items-end md:items-end gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                             {profile?.profilePicture ? (
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
                        <span className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>

                    {/* Name & Basic Info */}
                    <div className="mb-2 md:mb-4 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm md:text-white md:drop-shadow-md">
                            {profile?.firstName || user.name} {profile?.lastName}
                        </h1>
                        <p className="text-gray-600 font-medium md:text-white/90 md:font-normal">
                             {profile?.studentId || 'STUDENT'} • {profile?.classId?.name || 'Class N/A'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {/* Personal Information Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Personal Details</h2>
                        <div className="space-y-4">
                             <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={18} className="text-primary" />
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-400 uppercase">Email</span>
                                    <span className="text-sm font-medium">{profile?.email || user.email}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <GraduationCap size={18} className="text-primary" />
                                <div>
                                    <span className="text-xs text-gray-400 uppercase block">Class & Level</span>
                                    <span className="text-sm font-medium">{profile?.classId?.name || 'Unassigned'} {profile?.arm ? `(${profile.arm})` : ''} - {profile?.level || 'N/A'}</span>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <School size={18} className="text-primary" />
                                <div>
                                    <span className="text-xs text-gray-400 uppercase block">Gender</span>
                                    <span className="text-sm font-medium capitalize">{profile?.gender || 'Student'}</span>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Assigned Subjects Card */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BookOpen className="text-primary" size={20} />
                            Assigned Subjects
                        </h3>

                        {(!profile?.subjects || profile.subjects.length === 0) ? (
                            <p className="text-gray-500 text-center py-8">No subjects assigned yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {profile.subjects.map((subject) => (
                                    <div 
                                        key={subject._id} 
                                        className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors flex items-center gap-3"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-primary font-bold shadow-sm">
                                            {subject.code || subject.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800">{subject.name}</p>
                                            <p className="text-xs text-gray-500">Core Subject</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
