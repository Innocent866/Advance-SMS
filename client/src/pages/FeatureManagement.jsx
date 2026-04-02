import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Shield, 
    Home, 
    CreditCard, 
    BookOpen, 
    BarChart2, 
    Users, 
    Activity,
    ClipboardList,
    Check,
    X,
    Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import usePageTitle from '../hooks/usePageTitle';

const FeatureManagement = () => {
    usePageTitle('Feature Management');
    const { user, refreshUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [features, setFeatures] = useState(user?.schoolId?.features || {
        boarding: true,
        financials: true,
        learningManagement: true,
        advancedAnalytics: true,
        medicalRecords: true,
        disciplineManagement: true,
        attendanceTracking: true
    });

    const featureConfig = [
        {
            id: 'boarding',
            name: 'Boarding Management',
            description: 'Manage hostels, room allocations, leave requests, and student daily operations.',
            icon: Home,
            color: 'bg-blue-100 text-blue-600'
        },
        {
            id: 'financials',
            name: 'Financial Management',
            description: 'Track school fees, payments, bank receipts, and financial reporting.',
            icon: CreditCard,
            color: 'bg-emerald-100 text-emerald-600'
        },
        {
            id: 'learningManagement',
            name: 'Learning Management',
            description: 'Video lessons, study materials, quizzes, and academic performance tracking.',
            icon: BookOpen,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            id: 'advancedAnalytics',
            name: 'Advanced Analytics',
            description: 'Detailed insights and automated reporting for school activities.',
            icon: BarChart2,
            color: 'bg-amber-100 text-amber-600'
        },
        {
            id: 'medicalRecords',
            name: 'Medical Records',
            description: 'Centralized health tracking, clinic visits, and medical alerts for students.',
            icon: Activity,
            color: 'bg-red-100 text-red-600'
        },
        {
            id: 'disciplineManagement',
            name: 'Discipline Tracking',
            description: 'Log and monitor student misconduct and discipline history.',
            icon: ClipboardList,
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            id: 'attendanceTracking',
            name: 'Daily Attendance',
            description: 'Easily track student and staff daily attendance across the school.',
            icon: Users,
            color: 'bg-cyan-100 text-cyan-600'
        }
    ];

    const handleToggle = (id) => {
        setFeatures(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            await api.put(`/school/${user.schoolId._id}`, { features });
            await refreshUser();
            toast.success('Feature accessibility updated successfully!');
        } catch (error) {
            toast.error('Failed to update features');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                        <Shield className="text-primary-600" size={32} />
                        Feature Customization
                    </h1>
                    <p className="text-gray-500 mt-2">
                        Tailor GT-SchoolHub to your school's specific requirements by enabling or disabling modules.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-primary-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
                >
                    {loading ? (
                        <span className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></span>
                    ) : (
                        <Save size={20} />
                    )}
                    <span>Save Changes</span>
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featureConfig.map((feat) => (
                    <motion.div
                        key={feat.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-6 rounded-3xl border transition-all duration-300 ${
                            features[feat.id] 
                                ? 'bg-white border-gray-100 shadow-sm' 
                                : 'bg-gray-50/50 border-gray-200 opacity-80'
                        }`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl ${feat.color}`}>
                                <feat.icon size={24} />
                            </div>
                            <button
                                onClick={() => handleToggle(feat.id)}
                                className={`w-14 h-7 rounded-full transition-all duration-300 relative ${
                                    features[feat.id] ? 'bg-primary-600' : 'bg-gray-300'
                                }`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${
                                    features[feat.id] ? 'left-8' : 'left-1'
                                }`} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                {feat.name}
                                {features[feat.id] && <Check size={16} className="text-primary-600" />}
                            </h3>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                {feat.description}
                            </p>
                        </div>

                        <div className={`mt-6 pt-4 border-t flex items-center gap-2 text-xs font-bold uppercase transition-colors ${
                            features[feat.id] ? 'text-primary-600 border-primary-50' : 'text-gray-400 border-gray-100'
                        }`}>
                            {features[feat.id] ? (
                                <>
                                    <Check size={14} />
                                    <span>Feature Enabled</span>
                                </>
                            ) : (
                                <>
                                    <X size={14} />
                                    <span>Feature Disabled</span>
                                </>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            <section className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                <div className="p-2 bg-amber-100 text-amber-600 rounded-xl h-fit">
                    <Shield size={20} />
                </div>
                <div>
                    <h4 className="font-bold text-amber-800">Operational Note</h4>
                    <p className="text-sm text-amber-700 leading-relaxed">
                        Disabling a feature hides it from the dashboard and blocks its API endpoints. 
                        No data will be deleted, and you can reactive the module at any time to resume operations.
                        Changes take effect immediately for all staff and students.
                    </p>
                </div>
            </section>
        </div>
    );
};

export default FeatureManagement;
