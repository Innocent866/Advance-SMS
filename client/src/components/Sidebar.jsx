
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    Home, 
    User,
    LayoutDashboard, 
    Users, 
    BookOpen, 
    Video, 
    Settings, 
    LogOut,
    GraduationCap,
    BarChart2,
    CheckCircle,
    Building,
    Clock,
    ShieldCheck,
    ClipboardList,
    PenTool,
    FileText,
    CreditCard
} from 'lucide-react';
import logo from '../assets/logo.png';


const Sidebar = () => {
    const { user, logout, checkAccess } = useAuth();
    const location = useLocation();

    // Derive logo: Check user's school logo first if branding is allowed
    const hasBranding = checkAccess('branding');
    // Note: 'logo' import is likely a placeholder. We should prioritize user.schoolId.logoUrl
    // If hasBranding is false, force default.
    const schoolLogo = hasBranding ? (user?.schoolId?.logoUrl || logo) : null; 
    const defaultLogo = '/logo.png'; 

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'school_admin', 'teacher', 'student'] },
        { path: '/teachers', label: 'Teachers', icon: Users, roles: ['school_admin'] },
        { path: '/students', label: 'Students', icon: GraduationCap, roles: ['school_admin'] },
        { path: '/my-students', label: 'My Students', icon: GraduationCap, roles: ['teacher'] },
        { path: '/lessons', label: 'Lesson Plan', icon: BookOpen, roles: ['teacher'] },
        { path: '/teacher-profile', label: 'My Profile', icon: User, roles: ['teacher'] },
        { path: '/videos/manage', label: 'Video Lessons', icon: Video, roles: ['teacher'] },
        { path: '/attendance/mark', label: 'Mark Attendance', icon: CheckCircle, roles: ['teacher'] },
        { path: '/results/entry', label: 'Enter Results', icon: PenTool, roles: ['teacher'] },
        { path: '/videos', label: 'Video Lessons', icon: Video, roles: ['student'] },
        { path: '/student-submissions', label: 'My Tasks', icon: CheckCircle, roles: ['student'] },
        { path: '/student-results', label: 'Check Results', icon: ClipboardList, roles: ['student'] },
        { path: '/student-history', label: 'Learning History', icon: Clock, roles: ['student'] },
        { path: '/student-profile', label: 'My Profile', icon: User, roles: ['student'] },
        { path: '/content-oversight', label: 'Content Oversight', icon: BookOpen, roles: ['school_admin'] },
        { path: '/learning-settings', label: 'Learning Settings', icon: CheckCircle, roles: ['school_admin'] }, // Changed icon to avoid confusion, CheckCircle as temp
        { path: '/analytics', label: 'Analytics', icon: BarChart2, roles: ['school_admin'], feature: 'advancedAnalytics' },
        { path: '/academic', label: 'Academic Settings', icon: Settings, roles: ['school_admin'] },
        { path: '/assessment-config', label: 'Assessment Config', icon: ClipboardList, roles: ['school_admin'], feature: 'continuousAssessment' },
        { path: '/attendance/history', label: 'Attendance Report', icon: CheckCircle, roles: ['school_admin', 'super_admin'] },
        { path: '/settings', label: 'School Settings', icon: Building, roles: ['school_admin'] },
        { path: '/finance', label: 'Financial Management', icon: CreditCard, roles: ['school_admin', 'super_admin'] },
        { path: '/super-admin', label: 'Platform Verification', icon: ShieldCheck, roles: ['super_admin'] },
        { path: '/staff/reports', label: 'Staff Reports', icon: FileText, roles: ['teacher'], feature: 'staffAdminComm' },
        { path: '/admin/reports', label: 'Report Management', icon: FileText, roles: ['school_admin'], feature: 'basicReports' },
        { path: '/teacher/learning-materials', label: 'Learning Materials', icon: BookOpen, roles: ['teacher'], feature: 'learningMaterials' },
        { path: '/student/learning-materials', label: 'Study Library', icon: BookOpen, roles: ['student'], feature: 'learningMaterials' },
        
        // Parent Routes
        { path: '/parent-dashboard', label: 'My Child', icon: User, roles: ['parent'] },
        { path: '/parent/child-profile', label: 'Child Profile', icon: ClipboardList, roles: ['parent'] },
        { path: '/parent/videos', label: 'Video Lessons', icon: Video, roles: ['parent'] },
        { path: '/parent/results', label: 'Results', icon: BarChart2, roles: ['parent'] },
        { path: '/parent/history', label: 'Learning History', icon: Clock, roles: ['parent'] },
        { path: '/parent/materials', label: 'Materials', icon: BookOpen, roles: ['parent'] },
        { path: '/parent/payments', label: 'Fees & Payments', icon: CreditCard, roles: ['parent'] },

    ];

    const filteredNav = navItems.filter(item => {
        // Role check
        if (!item.roles.includes(user?.role)) return false;
        // Feature check handling
        if (item.feature && !checkAccess(item.feature)) return false;
        return true;
    });

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-1 flex items-center justify-center border-b border-gray-200">
                <img 
                    src={schoolLogo || defaultLogo} 
                    alt="School Logo" 
                    className="h-24 w-auto object-contain"
                />
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {filteredNav.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.path) 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200">
                <div className="mb-4 px-4">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
