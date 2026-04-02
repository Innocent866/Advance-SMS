import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Home,
    Heart, 
    ShieldAlert, 
    Clock, 
    Bed,
    Calendar,
    AlertTriangle
} from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import DashboardChat from './DashboardChat';

const StatCard = ({ label, value, subLabel, icon: Icon, color, bg }) => (
    <div className={`p-8 rounded-[2.5rem] border border-gray-100 ${bg} relative overflow-hidden group transition-all hover:shadow-xl`}>
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform text-gray-900 blur-sm">
            <Icon size={120} />
        </div>
        <div className="relative z-10 flex flex-col gap-6">
            <div className={`w-16 h-16 rounded-3xl ${color} text-white flex items-center justify-center shrink-0 shadow-2xl shadow-current/20`}>
                <Icon size={32} />
            </div>
            <div>
                <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] leading-tight mb-2">{label}</p>
                <div className="flex items-baseline gap-3">
                    <h3 className="text-5xl font-black text-gray-900 tracking-tighter">{value}</h3>
                    {subLabel && <span className="text-sm text-gray-500 font-bold uppercase tracking-widest">{subLabel}</span>}
                </div>
            </div>
        </div>
    </div>
);

const HouseParentDashboard = ({ user }) => {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await api.get('/boarding/analytics');
            setAnalytics(res.data.data);
        } catch (error) {
            toast.error('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                </div>
            </div>
        );
    }

    if (analytics?.noHostel) {
        return (
            <div className="bg-white border-2 border-orange-100 p-16 rounded-[3rem] text-center shadow-2xl shadow-orange-100/20 max-w-2xl mx-auto mt-12">
                <div className="w-24 h-24 bg-orange-50 text-orange-500 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <AlertTriangle size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">Hostel Assignment Needed</h2>
                <p className="text-gray-500 font-medium leading-relaxed text-lg">{analytics.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 py-4">
                <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full border border-primary/10">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Operation Hub Live</span>
                    </div>
                    <h1 className="text-6xl font-black text-gray-900 tracking-tighter">
                        Welcome, {user?.name?.split(' ')[0] || 'Parent'} 
                    </h1>
                    <div className="flex items-center gap-4 text-gray-400 font-bold text-sm">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                           <Home size={18} className="text-primary" />
                           <span className="text-gray-900 uppercase tracking-widest font-black text-xs">
                               {analytics?.hostelInfo?.name || 'My Hostel'}
                           </span>
                        </div>
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-200"></span>
                        <span className="italic tracking-tight font-medium">Monitoring facility pulse in real-time.</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-[2rem] shadow-xl shadow-gray-100/50 border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Calendar size={28} />
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black text-gray-400 tracking-widest leading-none mb-1">Current Date</p>
                        <p className="text-lg font-black text-gray-900 leading-none">
                            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <StatCard 
                    label="Total School Occupancy" 
                    value={analytics?.schoolOccupancy?.occupied || 0}
                    subLabel={`/ ${analytics?.schoolOccupancy?.total || 0}`}
                    icon={Bed} 
                    color="bg-primary" 
                    bg="bg-primary/5"
                />
                <StatCard 
                    label="Medical Cases" 
                    value={analytics?.health?.approved || 0}
                    subLabel={`${analytics?.health?.pending || 0} Awaiting Action`}
                    icon={Heart} 
                    color="bg-rose-500" 
                    bg="bg-rose-50/50"
                />
                <StatCard 
                    label="Leaves Approved/Out" 
                    value={(analytics?.leaves?.approved || 0) + (analytics?.leaves?.out || 0)}
                    subLabel={`${analytics?.leaves?.pending || 0} Pending`}
                    icon={Clock} 
                    color="bg-orange-500" 
                    bg="bg-orange-50/50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2">
                    {/* Quick Action Reminder */}
                    <div className="bg-gray-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-gray-900/20 h-full min-h-[400px]">
                        <div className="absolute top-0 right-0 p-12 opacity-10">
                            <ShieldAlert size={160} />
                        </div>
                        <div className="relative z-10 max-w-xl">
                            <h3 className="text-4xl font-black mb-4 tracking-tighter">Unified Workflow</h3>
                            <p className="text-gray-400 text-lg font-medium leading-relaxed mb-8">
                                All operational tools are now accessible directly from your sidebar. 
                                Mark roll calls, track meals, or log clinic visits with a single click.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                {['Fast Navigation', 'Real-time Sync', 'Hostel Focus'].map((tag, i) => (
                                    <span key={i} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 text-xs font-black uppercase tracking-widest">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <DashboardChat user={user} />
                </div>
            </div>
        </div>
    );
};

export default HouseParentDashboard;
