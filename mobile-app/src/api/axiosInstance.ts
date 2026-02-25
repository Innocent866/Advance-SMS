import axios from 'axios';
import { getToken } from '@/utils/storage';

// Replace with your actual API base URL
// e.g. https://api.gt-schoolhub.com.ng/api
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'https://gt-schoolhub.onrender.com/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: { 'Content-Type': 'application/json' },
});

// Attach token to every request
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Global response error handler
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const message = error.response.data?.message ?? 'An error occurred';
            return Promise.reject(new Error(message));
        }
        if (error.request) {
            return Promise.reject(new Error('Network error — please check your connection'));
        }
        return Promise.reject(error);
    }
);

export default api;
