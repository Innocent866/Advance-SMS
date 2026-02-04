import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const LoadingSpinner = () => {
    const { user } = useAuth();
    // Use school logo if available (e.g. from local storage user), else default
    const logoUrl = logo;

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <div className="relative">
                {/* Pulse Effect */}
                <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
                
                <img 
                    src={logoUrl} 
                    alt="Loading..." 
                    className="h-32 w-32 object-contain relative z-10 animate-pulse"
                />
            </div>
        </div>
    );
};

export default LoadingSpinner;
