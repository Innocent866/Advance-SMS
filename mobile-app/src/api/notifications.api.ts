import api from './axiosInstance';

export const getNotificationsApi = async () => {
    const { data } = await api.get('/notifications');
    return data;
};

export const markNotificationReadApi = async (id: string) => {
    const { data } = await api.put(`/notifications/${id}/read`);
    return data;
};

export const getMessagesApi = async (params?: Record<string, string>) => {
    const { data } = await api.get('/messages', { params });
    return data;
};

export const sendMessageApi = async (payload: { recipientId: string; message: string; subject?: string }) => {
    const { data } = await api.post('/messages', payload);
    return data;
};
