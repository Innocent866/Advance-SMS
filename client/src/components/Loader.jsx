import { useAuth } from '../context/AuthContext';
import defaultLogo from '../assets/logo.png';

const Loader = ({ fullScreen = true, logoUrl, type = 'logo' }) => {
    let user;
    try {
        const auth = useAuth();
        user = auth?.user;
    } catch (e) {
        // useAuth might throw if used outside provider, or return undefined
        console.warn("Loader used outside AuthContext", e);
    }
    
    // Try to get school logo if available
    const logo = logoUrl || user?.schoolId?.logoUrl || defaultLogo;

    if (type === 'spinner') {
        return (
            <div className={`${fullScreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : 'w-full h-full min-h-[200px]'} flex flex-col items-center justify-center`}>
                <div className="w-12 h-12 border-4 border-gray-200 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className={`${fullScreen ? 'fixed inset-0 z-50 bg-white/80 backdrop-blur-sm' : 'w-full h-full min-h-[200px]'} flex flex-col items-center justify-center`}>
            <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-primary rounded-full animate-spin absolute inset-0"></div>
                <div className="w-16 h-16 flex items-center justify-center p-2">
                    <img 
                        src={logo} 
                        alt="Loading..." 
                        className="w-full h-full object-contain animate-pulse" 
                    />
                </div>
            </div>
            <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading...</p>
        </div>
    );
};

export default Loader;
