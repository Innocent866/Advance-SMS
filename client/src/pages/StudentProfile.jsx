import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { User, BookOpen, GraduationCap, Mail, School } from 'lucide-react';

const StudentProfile = () => {
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

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <User className="text-primary" size={32} />
                My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Personal Information Card */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center text-gray-400">
                             <User size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-center text-gray-900">{profile?.firstName || user.name} {profile?.lastName}</h2>
                        <div className="text-center mb-6">
                            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                {profile?.studentId || 'STUDENT'}
                            </span>
                        </div>

                        <div className="space-y-4">
                             <div className="flex items-center gap-3 text-gray-600">
                                <Mail size={18} className="text-primary" />
                                <span className="text-sm">{profile?.email || user.email}</span>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <GraduationCap size={18} className="text-primary" />
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{profile?.classId?.name || user.classId?.name || 'Not Assigned'}</p>
                                    <p className="text-xs text-gray-400">Class Level: {profile?.level || 'N/A'}</p>
                                </div>
                             </div>
                             <div className="flex items-center gap-3 text-gray-600">
                                <School size={18} className="text-primary" />
                                <span className="text-sm capitalize">{profile?.gender || 'Student'}</span>
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
