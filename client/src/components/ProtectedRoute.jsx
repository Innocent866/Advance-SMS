import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (!user) {
        return <Navigate to="/login" />;
    }

    // Super Admin can access everything
    if (user.role === 'super_admin') {
        return children ? children : <Outlet />;
    }

    if (role) {
        const allowedRoles = Array.isArray(role) ? role : [role];
        // Normalize: if school_admin is not in allowedRoles, but we want them to access teacher stuff, handle that.
        // For now, strict check based on what is passed.
        
        if (!allowedRoles.includes(user.role)) {
             // Allow school_admin to access teacher routes if needed, otherwise strict
             if (user.role === 'school_admin' && allowedRoles.includes('teacher')) {
                 // allow
             } else {
                 return <Navigate to="/dashboard" replace />;
             }
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
