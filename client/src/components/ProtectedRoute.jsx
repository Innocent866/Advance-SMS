import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ role, feature, children }) => {
    const { user, loading, checkAccess } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Super Admin Bypass (optional, usually good for support)
    if (user.role === 'super_admin') {
         return children ? children : <Outlet />;
    }

    // Role Check
    if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];
        if (!allowedRoles.includes(user.role)) {
            return <Navigate to="/dashboard" replace />;
        }
    }
    
    // Feature Check
    if (feature && !checkAccess(feature)) {
         return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors duration-200">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-100 dark:border-gray-700">
                    <div className="bg-red-50 dark:bg-red-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Feature Not Available</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                        This feature is not included in your school's current subscription plan. 
                    </p>
                    <button 
                        onClick={() => window.history.back()} 
                        className="w-full px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
                    >
                        Go Back
                    </button>
                </div>
            </div>
         );
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
