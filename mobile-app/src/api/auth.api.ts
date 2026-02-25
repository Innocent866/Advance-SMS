import api from './axiosInstance';
import type { LoginPayload, ForgotPasswordPayload } from '@/types/auth.types';

export const loginApi = async (payload: LoginPayload) => {
    const { data } = await api.post('/auth/login', payload);
    return data; // { user, token }
};

export const forgotPasswordApi = async (payload: ForgotPasswordPayload) => {
    const { data } = await api.post('/auth/forgot-password', payload);
    return data;
};

export const getProfileApi = async () => {
    const { data } = await api.get('/auth/profile');
    return data;
};

export const changePasswordApi = async (payload: { currentPassword: string; newPassword: string }) => {
    const { data } = await api.put('/auth/change-password', payload);
    return data;
};
