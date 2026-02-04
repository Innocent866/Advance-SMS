import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import { User, Mail, Phone, MapPin, Calendar, Book, Award, Clock, ArrowLeft, Edit2, Save, X, Camera, Hash, School, GraduationCap, BookOpen, MonitorPlay, CheckCircle, FileQuestion, FileText, Download, ExternalLink } from 'lucide-react';
import usePageTitle from '../hooks/usePageTitle';
import Loader from '../components/Loader';

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
            const res = await api.put(`/students/${id}`, formData);
            setStudent(res.data); // Update with new data (including new image URL)
            setUploading(false);
        } catch (error) {
            console.error('Upload Error:', error);
            // Error handled globally via api.js
            // setUploading(false); // Handled in finally or below? Ah code had lines 48-52
            // Let's match lines carefully.
             setUploading(false);
        }
    };

    if (loading) return <Loader type="spinner" />;
    if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
    
    if (!student) return <div>Student not found</div>;

    return (
        <div className="max-w-4xl mx-auto">
            <Link to="/students" className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 transition-colors">
                <ArrowLeft size={18} />
                Back to Students
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
                <div className="px-8 pb-8">
                    <div className="relative -mt-24 mb-6">
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
                                    {student.classId?.name || 'Unassigned'} {student.arm ? `(Arm ${student.arm})` : ''}
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

                        {/* Parent Info */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <User className="text-purple-600" size={20} />
                                Parent / Guardian
                            </h3>
                            {student.parent ? (
                                <div className="space-y-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
                                    <div className="flex items-center gap-3 text-gray-700">
                                        <span className="font-bold flex-1">{student.parent.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Mail size={16} className="text-purple-400" />
                                        <span>{student.parent.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600">
                                        <Phone size={16} className="text-purple-400" />
                                        <span>{student.parent.phone || 'No phone number'}</span>
                                    </div>
                                    {student.parent.address && (
                                        <div className="flex items-center gap-3 text-gray-600">
                                            <MapPin size={16} className="text-purple-400" />
                                            <span>{student.parent.address}</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-400 italic text-sm text-center">
                                    No parent linked yet.
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <BookOpen className="text-primary" size={20} />
                                Academic Overview
                            </h3>
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-gray-600">Status</span>
                                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded font-bold uppercase">{student.status}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Enrolled Since</span>
                                    <span className="text-gray-900 font-medium">{new Date(student.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl border border-gray-100 mb-6">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                    <BookOpen size={16} className="text-primary" />
                                    Assigned Subjects ({student.subjects?.length || 0})
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {student.subjects && student.subjects.length > 0 ? (
                                        student.subjects.map(subject => (
                                            <span key={subject._id} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                {subject.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-sm text-gray-400 italic">No subjects assigned</span>
                                    )}
                                </div>
                            </div>

                            {/* Video Progress Section */}
                            {student.videoProgress && (
                                <div className="mt-8 animate-fade-in-up">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <MonitorPlay className="text-primary" size={20} />
                                        Lesson Progress
                                    </h3>
                                    
                                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-500 font-medium">Completion Rate</span>
                                            <span className="text-2xl font-bold text-primary">{student.videoProgress.completionRate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                            <div 
                                                className="bg-primary h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${student.videoProgress.completionRate}%` }}
                                            ></div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Taken Videos */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Completed ({student.videoProgress.taken.length})
                                                </h4>
                                                {student.videoProgress.taken.length > 0 ? (
                                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                        {student.videoProgress.taken.map((video) => (
                                                            <div key={video._id} className="text-sm bg-green-50 p-2 rounded border border-green-100 flex items-start gap-2">
                                                                <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
                                                                <div>
                                                                    <p className="font-medium text-gray-800 line-clamp-1">{video.title}</p>
                                                                    <p className="text-xs text-green-700">{video.topic}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic pl-2">No videos completed yet.</p>
                                                )}
                                            </div>

                                            {/* Not Taken Videos */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <Clock size={12} className="text-orange-500" />
                                                    Pending ({student.videoProgress.notTaken.length})
                                                </h4>
                                                {student.videoProgress.notTaken.length > 0 ? (
                                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                        {student.videoProgress.notTaken.map((video) => (
                                                            <div key={video._id} className="text-sm bg-gray-50 p-2 rounded border border-gray-100 flex items-start gap-2 hover:bg-gray-100 transition-colors">
                                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 mt-0.5 shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-gray-600 line-clamp-1">{video.title}</p>
                                                                    <p className="text-xs text-gray-400">{video.topic}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-green-500 italic pl-2">All assigned videos completed! 🎉</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quiz Progress Section */}
                            {student.quizProgress && (
                                <div className="mt-8 animate-fade-in-up delay-100">
                                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileQuestion className="text-secondary" size={20} />
                                        Quiz Performance
                                    </h3>
                                    
                                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm text-gray-500 font-medium">Completion Rate</span>
                                            <span className="text-2xl font-bold text-secondary">{student.quizProgress.completionRate}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
                                            <div 
                                                className="bg-secondary h-2 rounded-full transition-all duration-1000" 
                                                style={{ width: `${student.quizProgress.completionRate}%` }}
                                            ></div>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Taken Quizzes */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <CheckCircle size={12} className="text-green-500" />
                                                    Completed ({student.quizProgress.taken.length})
                                                </h4>
                                                {student.quizProgress.taken.length > 0 ? (
                                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                        {student.quizProgress.taken.map((quiz) => (
                                                            <div key={quiz._id} className="text-sm bg-yellow-50 p-2 rounded border border-yellow-100 flex justify-between items-start">
                                                                <div className="flex items-start gap-2">
                                                                    <Award size={14} className="text-secondary mt-0.5 shrink-0" />
                                                                    <div>
                                                                        <p className="font-medium text-gray-800 line-clamp-1">{quiz.title}</p>
                                                                        <p className="text-xs text-yellow-700">Score: {quiz.score !== undefined ? quiz.score : 'N/A'}</p>
                                                                    </div>
                                                                </div>
                                                                <span className="text-xs text-gray-400">{new Date(quiz.submittedAt).toLocaleDateString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-gray-400 italic pl-2">No quizzes completed yet.</p>
                                                )}
                                            </div>

                                            {/* Not Taken Quizzes */}
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                                                    <Clock size={12} className="text-orange-500" />
                                                    Pending ({student.quizProgress.notTaken.length})
                                                </h4>
                                                {student.quizProgress.notTaken.length > 0 ? (
                                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pr-1">
                                                        {student.quizProgress.notTaken.map((quiz) => (
                                                            <div key={quiz._id} className="text-sm bg-gray-50 p-2 rounded border border-gray-100 flex items-start gap-2 hover:bg-gray-100 transition-colors">
                                                                <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300 mt-0.5 shrink-0"></div>
                                                                <div>
                                                                    <p className="font-medium text-gray-600 line-clamp-1">{quiz.title}</p>
                                                                    <p className="text-xs text-gray-400">Attached to lesson</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-green-500 italic pl-2">All assigned quizzes completed! 🌟</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            {/* Assignments Section */}
                            <div className="mt-8 animate-fade-in-up delay-200">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <FileText className="text-primary" size={20} />
                                    Assignments ({student.assignments?.length || 0})
                                </h3>
                                
                                {student.assignments && student.assignments.length > 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                                        {student.assignments.map((assignment) => (
                                            <div key={assignment._id} className="p-3 bg-blue-50/50 rounded-lg border border-blue-100 hover:border-blue-200 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">{assignment.title}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                            <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{assignment.subject}</span>
                                                            <span>• {new Date(assignment.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={assignment.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
                                                        title="Download/View"
                                                    >
                                                        <Download size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center text-gray-400 italic">
                                        No active assignments found.
                                    </div>
                                )}
                            </div>

                            {/* Learning Materials Section */}
                            <div className="mt-8 animate-fade-in-up delay-300">
                                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <Book className="text-orange-500" size={20} />
                                    Learning Resources ({student.learningMaterials?.length || 0})
                                </h3>
                                
                                {student.learningMaterials && student.learningMaterials.length > 0 ? (
                                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-3">
                                        {student.learningMaterials.map((material) => (
                                            <div key={material._id} className="p-3 bg-orange-50/50 rounded-lg border border-orange-100 hover:border-orange-200 transition-colors">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="font-semibold text-gray-800">{material.title}</h4>
                                                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                            <span className="bg-white px-2 py-0.5 rounded border border-gray-100 text-orange-600 font-medium">{material.type}</span>
                                                            <span className="bg-white px-2 py-0.5 rounded border border-gray-100">{material.subject}</span>
                                                        </div>
                                                    </div>
                                                    <a 
                                                        href={material.fileUrl} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-orange-600 hover:bg-orange-100 rounded-full transition-colors"
                                                        title="Download/View"
                                                    >
                                                        <ExternalLink size={18} />
                                                    </a>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center text-gray-400 italic">
                                        No additional learning resources found.
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDetails;
