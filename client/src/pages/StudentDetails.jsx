import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Phone, MapPin, Calendar, Book, Award, Clock, ArrowLeft, Edit2, Save, X, Camera } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';

const StudentDetails = () => {
    usePageTitle('Student Details');
    const { id } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchStudent = async () => {
            try {
                const res = await api.get(`/students/${id}`);
                setStudent(res.data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                const errorMsg = error.response?.data?.message || error.message || 'Failed to load student';
                setError(errorMsg);
                setLoading(false);
            }
        };
        fetchStudent();
    }, [id]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('profilePicture', file);

        setUploading(true);
        try {
            const res = await api.put(`/students/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setStudent(res.data); // Update with new data (including new image URL)
            setUploading(false);
        } catch (error) {
            console.error('Upload Error:', error);
            alert(error.response?.data?.message || 'Failed to upload image');
            setUploading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    
    console.log('Rendering Student Details:', student);

    if (!student) return <div>Student not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/students" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={18} />
                Back to Students
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary/10 to-green-50"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-16 mb-6">
                        <div className="w-32 h-32 bg-white rounded-full p-2 shadow-lg inline-block overflow-hidden relative group">
                            {student.profilePicture ? (
                                <img 
                                    src={student.profilePicture} 
                                    alt={`${student.firstName} ${student.lastName}`}
                                    className="w-full h-full rounded-full object-cover border-4 border-gray-50"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <User size={48} />
                                </div>
                            )}
                            
                            {/* Upload Overlay */}
                            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                {uploading ? (
                                    <span className="text-white text-xs">Uploading...</span>
                                ) : (
                                    <Camera className="text-white" size={24} />
                                )}
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                />
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{student.firstName} {student.lastName}</h1>
                            <div className="flex flex-wrap gap-3 mb-6">
                                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <Hash size={14} />
                                    {student.studentId}
                                </span>
                                <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                                    <School size={14} />
                                    {student.classId?.name || 'Unassigned'}
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
                                    <span>{student.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <span className="font-medium text-gray-400 w-5 text-center">G</span>
                                    <span className="capitalize">{student.gender}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <GraduationCap size={18} className="text-gray-400" />
                                    <span>Level: {student.level}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="text-primary" size={20} />
                                Academic Overview
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Status</span>
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold uppercase">{student.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Enrolled Since</span>
                                    <span className="text-gray-900 font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
