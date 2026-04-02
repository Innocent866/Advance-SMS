import React from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ShieldAlert, Mail, ArrowRight } from 'lucide-react';

const SetupGuard = () => {
    const { user, refreshUser, logout } = useAuth();
    const [isChecking, setIsChecking] = React.useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleCheckStatus = async () => {
        setIsChecking(true);
        const freshUser = await refreshUser();
        setIsChecking(false);
        
        // Explicitly navigate if they just became verified
        if (freshUser?.isEmailVerified) {
            if (freshUser.isProfileSetup) {
                navigate('/dashboard');
            } else {
                navigate('/setup-school');
            }
        }
    };

    if (!user) return <Navigate to="/login" replace />;

    // 1. Email Verification Stage
    if (user.role === 'school_admin' && !user.isEmailVerified) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border max-w-md w-full text-center"
                >
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail size={40} />
                    </div>
                    <h2 className="text-3xl font-black text-gray-800 mb-4">Verify Your Email</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        To access your school dashboard, you must first verify your email address. 
                        We sent a link to <strong>{user.email}</strong>.
                    </p>
                    <div className="flex flex-col gap-4">
                        <button 
                            onClick={handleCheckStatus}
                            disabled={isChecking}
                            className="w-full py-4 bg-primary text-white rounded-2xl font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {isChecking ? "CHECKING..." : "I'VE VERIFIED MY EMAIL"}
                        </button>
                        <button 
                            onClick={logout}
                            className="inline-flex items-center justify-center gap-2 text-gray-400 font-bold hover:text-primary transition-all"
                        >
                            LOGOUT & WAIT <ArrowRight size={20} />
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    // 2. School Profile Stage
    if (user.role === 'school_admin' && !user.isProfileSetup) {
        // Redirect to setup page if not already there
        if (window.location.pathname !== '/setup-school') {
            return <Navigate to="/setup-school" replace />;
        }
    }

    // Block setup page if profile is already done
    if (user.role === 'school_admin' && user.isProfileSetup && window.location.pathname === '/setup-school') {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default SetupGuard;
