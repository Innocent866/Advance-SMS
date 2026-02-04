import { useState, useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';
import api from '../utils/api';
import { User, BookOpen, Clock, CheckCircle } from 'lucide-react';

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

const ParentDashboard = () => {
    usePageTitle('Parent Portal');
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/parents/dashboard');
                setData(res.data);
            } catch (error) {
                console.error("Failed to fetch dashboard", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading child profile...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Unable to load profile. Please contact support.</div>;

    const { student, stats } = data;

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">My Child: {student.firstName} {student.lastName}</h1>
                <p className="text-gray-500 mt-2">Class: {student.classId?.name || '-'}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard 
                    label="Attendance" 
                    value={`${stats?.attendance || 0}%`} 
                    icon={CheckCircle} 
                    color="bg-green-500" 
                />
                <StatCard 
                    label="Tasks Completed" 
                    value={stats?.tasksCompleted || 0} 
                    icon={BookOpen} 
                    color="bg-blue-500" 
                />
                <StatCard 
                    label="Lessons Watched" 
                    value={stats?.videosWatched || 0} 
                    icon={Clock} 
                    color="bg-purple-500" 
                />
                 <StatCard 
                    label="Student ID" 
                    value={student.studentId} 
                    icon={User} 
                    color="bg-orange-500" 
                />
            </div>

            {/* Detailed sections would go here - Results, Attendance Breakdown etc. */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="flex gap-4">
                     <a href="/parent/payments" className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90">
                        Pay Fees
                     </a>
                     {/* Links to Results or other details */}
                </div>
            </div>
        </div>
    );
};

export default ParentDashboard;
