import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Phone, Briefcase, BookOpen, Users, Calendar, ArrowLeft } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const TeacherDetails = () => {
    usePageTitle('Teacher Details');
    const { id } = useParams();
    const navigate = useNavigate();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacher = async () => {
            try {
                const res = await api.get(`/teachers/${id}`);
                setTeacher(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchTeacher();
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!teacher) return <div>Teacher not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/teachers" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={18} />
                Back to Teachers
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/10 to-blue-50"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg inline-block overflow-hidden relative">
                            {teacher.profilePicture ? (
                                <img 
                                    src={teacher.profilePicture} 
                                    alt={`${teacher.firstName} ${teacher.lastName}`}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <User size={48} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{teacher.firstName} {teacher.lastName}</h1>
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                                    {teacher.status || 'Active'}
                                </span>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Briefcase size={14} />
                                    {teacher.qualification || 'No Qualification Listed'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 border-t border-gray-100 pt-8">
                         <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="text-primary" size={20} />
                                Personal Info
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail size={18} className="text-gray-400" />
                                    <span>{teacher.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Phone size={18} className="text-gray-400" />
                                    <span>{teacher.phoneNumber || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="font-medium text-gray-400 w-5 text-center">G</span>
                                    <span className="capitalize">{teacher.gender}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="text-primary" size={20} />
                                Academic Assignments
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500 mb-2">Active Teaching Schedule</p>
                                    <div className="space-y-2">
                                        {teacher.teachingAssignments && teacher.teachingAssignments.length > 0 ? (
                                            teacher.teachingAssignments.map((assign, idx) => (
                                                <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-100 flex justify-between items-center text-sm">
                                                    <div>
                                                        <span className="font-bold text-gray-800">{assign.subjectId?.name || 'Unknown Subject'}</span>
                                                        <div className="text-gray-500 text-xs mt-0.5">
                                                            {assign.classId?.name || 'Unknown Class'} {assign.arm ? `(Arm ${assign.arm})` : ''}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">No active classes assigned</span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-500 mb-1">Qualified Subjects</p>
                                    <div className="flex flex-wrap gap-2">
                                        {teacher.subjects && teacher.subjects.length > 0 ? (
                                            teacher.subjects.map((sub, idx) => (
                                                <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium border border-blue-100">
                                                    {sub.name}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">No subjects listed</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherDetails;
