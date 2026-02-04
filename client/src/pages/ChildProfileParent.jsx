import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';
import api from '../utils/api';
import { User, Calendar, MapPin, Phone, Mail, BookOpen, Activity } from 'lucide-react';

const ProfileSection = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">{title}</h3>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 text-gray-700">
        <div className="text-gray-400">
             <Icon size={18} />
        </div>
        <div className="flex-1">
            <span className="text-sm text-gray-500 block">{label}</span>
            <span className="font-medium">{value || '-'}</span>
        </div>
    </div>
);

const ChildProfileParent = () => {
    usePageTitle('Child Profile');
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/parents/child-profile');
                setStudent(res.data);
            } catch (error) {
                console.error("Failed to fetch child profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    if (loading) return <Loader type="spinner" />;
    if (!student) return <div className="p-8 text-center text-red-500">Unable to load child details.</div>;

    return (
        <div className="max-w-5xl mx-auto">
            {/* Cover Background */}
            <div className="relative mb-20 rounded-b-3xl -mx-4 -mt-8 md:-mt-8 md:-mx-4">
                <div className="h-48 bg-gradient-to-r from-sky-400 to-blue-600 rounded-b-3xl shadow-sm"></div>
                
                {/* Profile Header Overlap */}
                <div className="absolute -bottom-16 left-0 right-0 px-4 md:px-8 flex flex-col md:flex-row items-end gap-6">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-white text-gray-400 flex items-center justify-center">
                             {/* Ideally fetch picture if available, utilizing current generic User icon for now as no profilePic in state here explicitly shown */}
                             <User size={64} />
                        </div>
                    </div>
                     <div className="mb-2 md:mb-4 flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 drop-shadow-sm md:text-white md:drop-shadow-md">
                            {student.firstName} {student.lastName}
                        </h1>
                        <p className="text-gray-600 font-medium md:text-white/90 md:font-normal">
                             ID: {student.studentId}
                        </p>
                    </div>
                </div>
            </div>
            
            {student.quizProgress && (
                <div className="mb-8 grid grid-cols-2 gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div>
                        <span className="text-sm text-gray-500 font-medium block">Quiz Completion</span>
                        <span className="text-2xl font-bold text-secondary">{student.quizProgress.completionRate}%</span>
                    </div>
                    <div>
                        <span className="text-sm text-gray-500 font-medium block">Avg. Score</span>
                        <span className="text-2xl font-bold text-green-600">{student.quizProgress.averageScore || 0}%</span>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <ProfileSection title="Personal Information">
                    <InfoRow icon={Calendar} label="Date of Birth" value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString() : '-'} />
                    <InfoRow icon={User} label="Gender" value={student.gender} />
                    <InfoRow icon={MapPin} label="Address" value={student.address} />
                    <InfoRow icon={Phone} label="Student Phone" value={student.phone} />
                    <InfoRow icon={Mail} label="Student Email" value={student.email} />
                </ProfileSection>

                {/* Academic Information */}
                <ProfileSection title="Academic Details">
                    <InfoRow icon={BookOpen} label="Class" value={student.classId?.name} />
                    <InfoRow icon={Activity} label="Department" value={student.department?.name} />
                    <InfoRow icon={User} label="Admission Number" value={student.admissionNumber} />
                    <InfoRow icon={Calendar} label="Enrollment Date" value={student.enrollmentDate ? new Date(student.enrollmentDate).toLocaleDateString() : '-'} />
                </ProfileSection>

                {/* Guardian Info (Read Only as stored on Student) */}
                <ProfileSection title="Guardian Contact (School Record)">
                     <InfoRow icon={User} label="Guardian Name" value={student.guardianName} />
                     <InfoRow icon={Phone} label="Guardian Phone" value={student.guardianPhone} />
                     <InfoRow icon={Mail} label="Guardian Email" value={student.guardianEmail} />
                </ProfileSection>

                {/* Account Status */}
                 <ProfileSection title="Account Status">
                     <div className="flex items-center gap-2">
                         <span className={`px-3 py-1 rounded-full text-sm font-medium ${student.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                             {student.isActive ? 'Active' : 'Inactive'}
                         </span>
                     </div>
                </ProfileSection>
            </div>
        </div>
    );
};

export default ChildProfileParent;
