import api from './axiosInstance';

export const getTeachersApi = async (params?: Record<string, string>) => {
    const { data } = await api.get('/teachers', { params });
    return data;
};

export const getTeacherByIdApi = async (id: string) => {
    const { data } = await api.get(`/teachers/${id}`);
    return data;
};
