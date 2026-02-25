import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { loginApi, getProfileApi } from '@/api/auth.api';
import { storeToken, getToken, storeUser, getUser, clearAll } from '@/utils/storage';
import type { AuthUser, LoginPayload } from '@/types/auth.types';

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const [savedToken, savedUser] = await Promise.all([getToken(), getUser()]);
                if (savedToken && savedUser) {
                    setToken(savedToken);
                    setUser(savedUser);
                }
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    const login = async (payload: LoginPayload) => {
        const data = await loginApi(payload);
        const { token: t, ...userData } = data;
        await storeToken(t);
        await storeUser(userData);
        setToken(t);
        setUser(userData);
        // Role-based navigation
        const role = userData.role;
        if (role === 'super_admin') router.replace('/(superadmin)/dashboard');
        else if (role === 'school_admin') router.replace('/(admin)/dashboard');
        else if (role === 'teacher') router.replace('/(teacher)/dashboard');
        else if (role === 'student') router.replace('/(student)/dashboard');
        else if (role === 'parent') router.replace('/(parent)/dashboard');
        else router.replace('/(admin)/dashboard');
    };

    const logout = async () => {
        await clearAll();
        setUser(null);
        setToken(null);
        router.replace('/(auth)/login');
    };

    const refreshUser = async () => {
        try {
            const data = await getProfileApi();
            await storeUser(data);
            setUser(data);
        } catch (_) { }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
