import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, Utensils, Heart, ShieldAlert, FileText, ChevronRight, Home } from 'lucide-react';
import api from '../utils/api';
import usePageTitle from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HouseParentDashboard from '../components/boarding/HouseParentDashboard';

const ActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button 
        onClick={onClick}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start space-x-4 hover:shadow-md hover:border-primary/20 transition-all text-left group"
    >
        <div className={`p-4 rounded-xl ${color} text-white group-hover:scale-110 transition-transform`}>
            <Icon size={28} />
        </div>
        <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-1">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </div>
        <div className="self-center text-gray-300 group-hover:text-primary transition-colors">
            <ChevronRight size={24} />
        </div>
    </button>
);

const BoardingManagement = () => {
    usePageTitle('Boarding Management');
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalBoarders: 0,
        presentTonight: 0,
        onLeave: 0,
        medicalCases: 0
    });

    useEffect(() => {
        if (!isHouseParent) {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/boarding/analytics');
            setStats({
                totalBoarders: res.data.data.boarders,
                presentTonight: res.data.data.occupancy.occupied,
                onLeave: res.data.data.leaves.pending,
                medicalCases: res.data.data.health.recentVisits
            });
        } catch (error) {
            console.error('Failed to fetch stats');
        }
    };

    const isAdmin = ['school_admin', 'assistant_admin', 'super_admin'].includes(user?.role);
    const isHouseParent = user?.role === 'house_parent';

    const actions = [
        { 
            title: 'Daily Roll Call', 
            description: 'Mark nightly or weekend attendance for all hostels.', 
            icon: CheckCircle, 
            color: 'bg-indigo-500', 
            path: '/boarding/roll-call' 
        },
        { 
            title: 'Room Allocation', 
            description: 'Assign or transfer students to hostel rooms and beds.', 
            icon: Users, 
            color: 'bg-blue-500', 
            path: '/boarding/allocate',
            adminOnly: true
        },
        { 
            title: 'Leave & Exits', 
            description: 'Manage student leave requests, exits, and returns.', 
            icon: Clock, 
            color: 'bg-orange-500', 
            path: '/boarding/leaves' 
        },
        { 
            title: 'Hostel Management', 
            description: 'Manage hostels, rooms, beds and facility settings.', 
            icon: Home, 
            color: 'bg-teal-500', 
            path: '/hostel-management',
            adminOnly: true
        },
        { 
            title: 'Meal Tracking', 
            description: 'Mark attendance for breakfast, lunch, and dinner.', 
            icon: Utensils, 
            color: 'bg-green-500', 
            path: '/boarding/meals' 
        },
        { 
            title: 'Medical Records', 
            description: 'Track clinic visits, medications, and health status.', 
            icon: Heart, 
            color: 'bg-red-500', 
            path: '/boarding/medical' 
        },
        { 
            title: 'Discipline', 
            description: 'Record incidents and disciplinary actions in hostels.', 
            icon: ShieldAlert, 
            color: 'bg-gray-800', 
            path: '/boarding/discipline' 
        },
        { 
            title: 'Boarding Reports', 
            description: 'Generate occupancy, health, and attendance reports.', 
            icon: FileText, 
            color: 'bg-purple-600', 
            path: '/boarding/reports' 
        }
    ].filter(action => !action.adminOnly || isAdmin);

    if (isHouseParent) {
        return <HouseParentDashboard user={user} />;
    }


    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            <header>
                <h1 className="text-3xl font-bold text-gray-800">Boarding & Hostel Hub</h1>
                <p className="text-gray-500 mt-2">Centralized management for all hostel activities and student boarding records.</p>
            </header>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Boarders', value: stats.totalBoarders, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Occupancy', value: stats.presentTonight, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Leaves', value: stats.onLeave, color: 'text-orange-600', bg: 'bg-orange-50' },
                    { label: 'Medical Cases', value: stats.medicalCases, color: 'text-red-600', bg: 'bg-red-50' }
                ].map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border border-gray-100 ${stat.bg}`}>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                        <h3 className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Action Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {actions.map((action, i) => (
                    <ActionCard 
                        key={i}
                        {...action}
                        onClick={() => navigate(action.path)}
                    />
                ))}
            </div>
        </motion.div>
    );
};

export default BoardingManagement;
