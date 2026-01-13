import { useAuth } from '../context/AuthContext';

const LoadingSpinner = () => {
    const { user } = useAuth();
    // Use school logo if available (e.g. from local storage user), else default
    const logoUrl = user?.schoolId?.logoUrl || '/logo.png';

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="relative">
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                
                <img 
                    src={logoUrl} 
                    alt="Loading..." 
                    className="h-16 w-16 object-contain relative z-10 animate-pulse"
                />
            </div>
            <p className="mt-4 text-gray-500 text-sm font-medium animate-pulse">Loading...</p>
        </div>
    );
};

export default LoadingSpinner;
