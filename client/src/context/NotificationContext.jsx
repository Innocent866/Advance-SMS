import { createContext, useContext, useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    // Add a new notification
    // type: 'success' | 'error' | 'warning' | 'info'
    const showNotification = (message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, message, type }]);

        // Auto remove
        setTimeout(() => {
            removeNotification(id);
        }, duration);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    // Listen for global events (triggered by api.js or non-react code)
    useEffect(() => {
        const handleEvent = (event) => {
             const { message, type } = event.detail;
             showNotification(message, type);
        };
        
        window.addEventListener('notification', handleEvent);
        return () => window.removeEventListener('notification', handleEvent);
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed top-5 right-5 z-50 flex flex-col gap-2">
                {notifications.map(n => (
                    <div 
                        key={n.id} 
                        className={`
                            flex items-start gap-3 p-4 rounded-lg shadow-lg border min-w-[300px] max-w-sm animate-fade-in-down transition-all
                            ${n.type === 'success' ? 'bg-white border-green-200 text-gray-800' : ''}
                            ${n.type === 'error' ? 'bg-white border-red-200 text-gray-800' : ''}
                            ${n.type === 'warning' ? 'bg-white border-orange-200 text-gray-800' : ''}
                            ${n.type === 'info' ? 'bg-white border-blue-200 text-gray-800' : ''}
                        `}
                    >
                        <div className="mt-0.5">
                            {n.type === 'success' && <CheckCircle className="text-green-500" size={20} />}
                            {n.type === 'error' && <AlertCircle className="text-red-500" size={20} />}
                            {n.type === 'warning' && <AlertTriangle className="text-orange-500" size={20} />}
                            {n.type === 'info' && <Info className="text-blue-500" size={20} />}
                        </div>
                        <div className="flex-1">
                             <p className="text-sm font-medium">{n.message}</p>
                        </div>
                        <button 
                            onClick={() => removeNotification(n.id)}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
