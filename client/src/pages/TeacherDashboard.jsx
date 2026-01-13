import { useAuth } from '../context/AuthContext';
import { BookOpen, Video, Users, CheckCircle, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, to }) => (
    <Link to={to} className="block group">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 transition-transform group-hover:scale-105">
            <div className={`p-3 rounded-lg ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            <div>
                <p className="text-gray-500 text-sm font-medium">{label}</p>
                <h3 className="text-2xl font-bold text-gray-800">{value !== undefined ? value : '-'}</h3>
            </div>
        </div>
    </Link>
);

const TeacherDashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Welcome Back, {user?.name?.split(' ')[0]} 🍎</h1>
                <p className="text-gray-500 mt-2">Manage your classes and lessons efficiently.</p>
            </header>

            {/* Quick Stats / Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard 
                    label="My Students" 
                    value="View List" 
                    icon={Users} 
                    color="bg-blue-500" 
                    to="/my-students" 
                />
                <StatCard 
                    label="Lesson Plans" 
                    value="Create New" 
                    icon={BookOpen} 
                    color="bg-green-500" 
                    to="/lessons/create" 
                />
                <StatCard 
                    label="Video Library" 
                    value="Manage Videos" 
                    icon={Video} 
                    color="bg-purple-500" 
                    to="/videos/manage" 
                />
                <StatCard 
                    label="My Profile" 
                    value="Update Info" 
                    icon={User} 
                    color="bg-orange-500" 
                    to="/teacher-profile" 
                />
            </div>

            {/* Recent Activity / Quick Actions Container */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Quick Actions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                        <Link to="/lessons/create" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="flex items-center gap-3 text-gray-700">
                                <BookOpen size={18} className="text-blue-500" />
                                Generate AI Lesson Plan
                            </span>
                            <span className="text-xs font-bold text-blue-600">Start</span>
                        </Link>
                        <Link to="/videos/manage" className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="flex items-center gap-3 text-gray-700">
                                <Video size={18} className="text-purple-500" />
                                Upload New Video Lesson
                            </span>
                            <span className="text-xs font-bold text-purple-600">Upload</span>
                        </Link>
                    </div>
                </div>

                {/* Info Panel */}
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h3 className="text-lg font-bold text-blue-800 mb-4">Teacher Tips</h3>
                    <ul className="space-y-2 text-sm text-blue-700">
                        <li className="flex gap-2">
                            <CheckCircle size={16} className="mt-0.5" />
                            Use AI to generate comprehensive lesson notes in seconds.
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle size={16} className="mt-0.5" />
                            Upload video content to engage visual learners.
                        </li>
                        <li className="flex gap-2">
                            <CheckCircle size={16} className="mt-0.5" />
                            Keep your profile updated for better administrative tracking.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TeacherDashboard;
