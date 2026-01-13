import { useAuth } from '../context/AuthContext';
import { BookOpen, Video, CheckCircle, Clock, User, Trophy, PlayCircle } from 'lucide-react';
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

const StudentDashboard = () => {
    const { user } = useAuth();
    // In a real app, we would fetch student specific stats here (e.g. % completed, pending tasks)

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Hi, {user?.name?.split(' ')[0]} 👋</h1>
                <p className="text-gray-500 mt-2">Ready to start learning today?</p>
            </header>

            {/* Quick Stats / Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Video Lessons" 
                    value="Start Learning" 
                    icon={Video} 
                    color="bg-purple-500" 
                    to="/videos" 
                />
                <StatCard 
                    label="My Tasks" 
                    value="View Pending" 
                    icon={CheckCircle} 
                    color="bg-orange-500" 
                    to="/student-submissions" 
                />
                <StatCard 
                    label="History" 
                    value="View Progress" 
                    icon={Clock} 
                    color="bg-blue-500" 
                    to="/student-history" 
                />
                <StatCard 
                    label="My Profile" 
                    value="Update Info" 
                    icon={User} 
                    color="bg-green-500" 
                    to="/student-profile" 
                />
            </div>

            {/* Learning Path / Activity Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Featured / Continue Learning */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-800">Continue Learning</h3>
                        <Link to="/videos" className="text-primary text-sm font-medium hover:underline">View All Library</Link>
                    </div>
                    
                    <div className="bg-gray-50 rounded-lg p-6 text-center border border-dashed border-gray-300">
                        <PlayCircle size={48} className="mx-auto text-gray-400 mb-3" />
                        <h4 className="font-bold text-gray-700">No active sessions</h4>
                        <p className="text-sm text-gray-500 mb-4">Pick a video from the library to start monitoring your progress.</p>
                        <Link to="/videos" className="bg-primary text-white px-6 py-2 rounded-lg inline-block font-medium hover:bg-opacity-90">
                            Browse Videos
                        </Link>
                    </div>
                </div>

                {/* Motivation / Tips Panel */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl text-white shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Trophy size={24} className="text-yellow-300" />
                        <h3 className="text-lg font-bold">Daily Tip</h3>
                    </div>
                    <p className="mb-6 opacity-90 leading-relaxed">
                        "Consistency is key! Try to watch at least one lesson video every day to stay on top of your subjects."
                    </p>
                    <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                        <div className="text-sm font-bold opacity-80 mb-1">YOUR LEVEL</div>
                        <div className="text-2xl font-bold">{user?.classId?.name || 'Students'}</div>
                        <div className="text-xs opacity-75">Keep up the great work!</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
