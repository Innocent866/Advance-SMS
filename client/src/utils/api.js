import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://gt-schoolhub.onrender.com/api',
    // Uses env var or fallback
    // Do NOT set Content-Type here; let Axios set it automatically (json or multipart)
});

// Add a request interceptor to inject the token
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const token = JSON.parse(user).token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        const message = error.response?.data?.message || 'Something went wrong';
        
        // Dispatch global event for NotificationContext to pick up
        const event = new CustomEvent('notification', { 
            detail: { message, type: 'error' } 
        });
        window.dispatchEvent(event);

        return Promise.reject(error);
    }
);

export default api;
