import { useAuth } from '../context/AuthContext';
import { Users, GraduationCap, BookOpen, Video } from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${color}`}>
            <Icon size={24} className="text-white" />
        </div>
        <div>
            <p className="text-gray-500 text-sm font-medium">{label}</p>
            <h3 className="text-2xl font-bold text-gray-800">{value !== undefined ? value : '-'}</h3>
        </div>
    </div>
);

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import TeacherDashboard from './TeacherDashboard'; 
import StudentDashboard from './StudentDashboard'; // Import
import usePageTitle from '../hooks/usePageTitle';

const DashboardHome = () => {
    usePageTitle('Dashboard');
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user?.role === 'super_admin') {
            navigate('/super-admin');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchStats = async () => {
            if (user?.role === 'school_admin') { // Only fetch stats for admins
                try {
                    const res = await api.get('/admin/analytics');
                    setStats(res.data);
                } catch (error) {
                    console.error("Failed to fetch dashboard stats", error);
                }
            }
        };
        fetchStats();
    }, [user]);

    // Role Based Dashboards
    if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    }
    if (user?.role === 'student') {
        return <StudentDashboard />;
    }

    const p = stats?.platformUsage || {};

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Hello, {user?.name?.split(' ')[0] || 'User'} 👋</h1>
                <p className="text-gray-500 mt-2">Here's what's happening in your school today.</p>
            </header>

            {/* Stats Grid - Real Data */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard label="Total Students" value={p.students || 0} icon={GraduationCap} color="bg-blue-500" />
                <StatCard label="Total Teachers" value={p.teachers || 0} icon={Users} color="bg-green-500" />
                <StatCard label="Active Lessons" value={p.lessonPlans || 0} icon={BookOpen} color="bg-purple-500" />
                <StatCard label="Video Library" value={p.videoLessons || 0} icon={Video} color="bg-orange-500" />
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex flex-wrap gap-4">
                    <button 
                        onClick={() => window.location.href = '/teachers'}
                        className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-3 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                        <Users size={20} />
                        <span className="font-medium">Manage Teachers</span>
                    </button>
                     <button 
                        onClick={() => window.location.href = '/students'}
                        className="flex items-center space-x-2 bg-green-50 text-green-600 px-4 py-3 rounded-lg hover:bg-green-100 transition-colors border border-green-200"
                    >
                        <GraduationCap size={20} />
                        <span className="font-medium">Manage Students</span>
                    </button>
                    {/* Add more as needed */}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
