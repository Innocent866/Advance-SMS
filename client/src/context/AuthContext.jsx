import { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser); // Optimistic set
                
                // Verify and refresh from backend if token exists
                if (parsedUser.token) {
                    try {
                        const res = await api.get('/auth/me');
                        // Backend returns user object. Merge with token if not present in response, or assume token is still valid.
                        // Ideally we keep the token.
                        const fresherUser = { ...res.data, token: parsedUser.token };
                        setUser(fresherUser);
                        localStorage.setItem('user', JSON.stringify(fresherUser));
                    } catch (error) {
                        console.error("Session verification failed", error);
                        // Optional: logout if 401? For now, keep silent or let interceptor handle
                        if (error.response?.status === 401) {
                            localStorage.removeItem('user');
                            setUser(null);
                        }
                    }
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const registerSchool = async (schoolData) => {
        const response = await api.post('/auth/register-school', schoolData);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
            setUser(response.data);
        }
        return response.data;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const refreshUser = async () => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                if (parsedUser.token) {
                    const res = await api.get('/auth/me');
                    const fresherUser = { ...res.data, token: parsedUser.token };
                    setUser(fresherUser);
                    localStorage.setItem('user', JSON.stringify(fresherUser));
                }
            }
        } catch (error) {
            console.error("Refresh user failed", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, registerSchool, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
