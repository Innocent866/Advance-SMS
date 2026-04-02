
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
    CreditCard,
    MessageSquare,
    Utensils,
    Heart,
    ShieldAlert,
    Zap
} from 'lucide-react';
const logo = '/logo.png';


const Sidebar = () => {
    const { user, logout, checkAccess, checkFeature } = useAuth();
    const location = useLocation();

    // Derive logo: Check user's school logo first if branding is allowed
    const hasBranding = checkAccess('branding');
    // Note: 'logo' import is likely a placeholder. We should prioritize user.schoolId.logoUrl
    // If hasBranding is false, force default.
    const schoolLogo = hasBranding ? (user?.schoolId?.logoUrl || logo) : null; 
    const defaultLogo = '/logo.png'; 

    const isActive = (path) => {
        const [targetPath, targetSearch] = path.split('?');
        const currentPath = location.pathname;
        const currentSearch = location.search.substring(1); // remove ?

        if (targetSearch) {
            return currentPath === targetPath && currentSearch.includes(targetSearch);
        }
        // If target has no search, only match if current has no search or different search
        return currentPath === targetPath && (!currentSearch || !location.search.includes('mode=promotion'));
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['super_admin', 'school_admin', 'teacher', 'student', 'house_parent'] },
        { path: '/teachers', label: 'Staff Management', icon: Users, roles: ['school_admin'] },
        { path: '/admin/management', label: 'Admin Management', icon: ShieldCheck, roles: ['school_admin'] },
        { path: '/students', label: 'Students', icon: GraduationCap, roles: ['school_admin'] },
        { path: '/students?mode=promotion', label: 'Student Promotion', icon: Zap, roles: ['school_admin'] },
        { path: '/my-students', label: 'My Students', icon: GraduationCap, roles: ['teacher'] },
        { path: '/lessons', label: 'Lesson Plan', icon: BookOpen, roles: ['teacher'], module: 'learningManagement' },
        { path: '/teacher-profile', label: 'My Profile', icon: User, roles: ['teacher'] },
        { path: '/videos/manage', label: 'Video Lessons', icon: Video, roles: ['teacher'], module: 'videoManager' },
        { path: '/attendance/mark', label: 'Mark Attendance', icon: CheckCircle, roles: ['teacher'], module: 'attendanceTracking' },
        { path: '/results/entry', label: 'Enter Results', icon: PenTool, roles: ['teacher'], module: 'continuousAssessment' },
        { path: '/videos', label: 'Video Lessons', icon: Video, roles: ['student'], module: 'videoManager' },
        { path: '/student-submissions', label: 'My Tasks', icon: CheckCircle, roles: ['student'], module: 'learningManagement' },
        { path: '/student-results', label: 'Check Results', icon: ClipboardList, roles: ['student'], module: 'continuousAssessment' },
        { path: '/student-history', label: 'Learning History', icon: Clock, roles: ['student'], module: 'attendanceTracking' },
        { path: '/student-profile', label: 'My Profile', icon: User, roles: ['student'] },
        { path: '/content-oversight', label: 'Content Oversight', icon: BookOpen, roles: ['school_admin'], module: 'learningManagement' },
        { path: '/learning-settings', label: 'Learning Settings', icon: CheckCircle, roles: ['school_admin'], module: 'learningManagement' }, // Changed icon to avoid confusion, CheckCircle as temp
        { path: '/analytics', label: 'Analytics', icon: BarChart2, roles: ['school_admin'], feature: 'advancedAnalytics', module: 'advancedAnalytics' },
        { path: '/academic', label: 'Academic Settings', icon: Settings, roles: ['school_admin'] },
        { path: '/assessment-config', label: 'Assessment Config', icon: ClipboardList, roles: ['school_admin'], feature: 'continuousAssessment', module: 'continuousAssessment' },
        { path: '/attendance/history', label: 'Attendance Report', icon: CheckCircle, roles: ['school_admin', 'super_admin'], module: 'attendanceTracking' },
        { path: '/settings', label: 'School Settings', icon: Building, roles: ['school_admin'] },
        { path: '/finance', label: 'Financial Management', icon: CreditCard, roles: ['school_admin', 'super_admin'], module: 'financials' },
        { path: '/admin/departments', label: 'Manage Departments', icon: Building, roles: ['school_admin'] },
        { path: '/department/review', label: 'Department Review', icon: FileText, roles: ['teacher'], module: 'learningMaterials' },
        { path: '/super-admin', label: 'Platform Verification', icon: ShieldCheck, roles: ['super_admin'] },
        { path: '/boarding', label: 'Boarding Management', icon: Home, roles: ['school_admin', 'super_admin', 'hostel_warden'], module: 'boarding' },
        
        // Boarding Fast-Track (Direct Access)
        { path: '/boarding/roll-call', label: 'Daily Roll Call', icon: CheckCircle, roles: ['house_parent'], module: 'boarding' },
        { path: '/boarding/leaves', label: 'Leave & Exits', icon: Clock, roles: ['house_parent'], module: 'boarding' },
        { path: '/boarding/meals', label: 'Meal Attendance', icon: Utensils, roles: ['house_parent'], module: 'boarding' },
        { path: '/boarding/medical', label: 'Medical Records', icon: Heart, roles: ['house_parent'], module: 'medicalRecords' },
        { path: '/boarding/discipline', label: 'Hostel Discipline', icon: ShieldAlert, roles: ['house_parent'], module: 'disciplineManagement' },
        { path: '/boarding/reports', label: 'Boarding Reports', icon: FileText, roles: ['house_parent'], module: 'boarding' },

        { path: '/staff/reports', label: 'Staff Reports', icon: FileText, roles: ['teacher'], feature: 'staffAdminComm', module: 'basicReports' },
        { path: '/staff/chat', label: 'Staff Chat', icon: MessageSquare, roles: ['school_admin', 'teacher', 'super_admin', 'house_parent', 'hostel_warden'], feature: 'staffAdminComm', module: 'staffAdminComm' },
        
        // Health Module
        

        { path: '/admin/reports', label: 'Report Management', icon: FileText, roles: ['school_admin'], feature: 'basicReports', module: 'basicReports' },
        { path: '/teacher/learning-materials', label: 'Learning Materials', icon: BookOpen, roles: ['teacher'], feature: 'learningMaterials', module: 'learningMaterials' },
        { path: '/student/learning-materials', label: 'Study Library', icon: BookOpen, roles: ['student'], feature: 'learningMaterials', module: 'learningMaterials' },
        
        // Parent Routes
        { path: '/parent-dashboard', label: 'My Child', icon: User, roles: ['parent'] },
        { path: '/parent/child-profile', label: 'Child Profile', icon: ClipboardList, roles: ['parent'] },
        { path: '/parent/videos', label: 'Video Lessons', icon: Video, roles: ['parent'], module: 'videoManager' },
        { path: '/parent/results', label: 'Results', icon: BarChart2, roles: ['parent'], module: 'continuousAssessment' },
        { path: '/parent/history', label: 'Learning History', icon: Clock, roles: ['parent'], module: 'attendanceTracking' },
        { path: '/parent/attendance', label: 'Attendance', icon: CheckCircle, roles: ['parent'], module: 'attendanceTracking' },
        { path: '/parent/materials', label: 'Materials', icon: BookOpen, roles: ['parent'], module: 'learningMaterials' },
        { path: '/parent/payments', label: 'Fees & Payments', icon: CreditCard, roles: ['parent'], module: 'financials' },

    ];

    const filteredNav = navItems.filter(item => {
        // Role check
        if (!item.roles.includes(user?.role)) return false;
        // Feature check handling
        if (item.feature && !checkAccess(item.feature)) return false;
        // Module Matrix check handling
        if (item.module && !checkFeature(item.module)) return false;
        
        // [STRICT OVERSIGHT] HOD check for Department Review
        if (item.path === '/department/review' && user?.role === 'teacher' && !user?.isHod) {
            return false;
        }

        return true;
    });

    return (
        <div className="h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-1 flex items-center justify-center border-b border-gray-200">
                <img 
                    src={schoolLogo || defaultLogo} 
                    alt={`${user?.schoolId?.name || 'School'} Logo`} 
                    className="h-24 w-auto object-contain"
                />
            </div>
            
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Main Navigation">
                {filteredNav.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        aria-current={isActive(item.path) ? 'page' : undefined}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive(item.path) 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        <item.icon size={20} aria-hidden="true" />
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
                     aria-label="Logout from account"
                     className="flex items-center space-x-3 px-4 py-2 w-full text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                 >
                     <LogOut size={20} aria-hidden="true" />
                     <span>Logout</span>
                 </button>
            </div>
        </div>
    );
};

export default Sidebar;
