import api from './axiosInstance';

export const getStudentsApi = async (schoolId: string, params?: Record<string, string>) => {
    const { data } = await api.get(`/students`, { params: { schoolId, ...params } });
    return data;
};

export const getStudentByIdApi = async (id: string) => {
    const { data } = await api.get(`/students/${id}`);
    return data;
};

export const addStudentApi = async (payload: FormData) => {
    const { data } = await api.post('/students', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
};

export const updateStudentApi = async (id: string, payload: any) => {
    const { data } = await api.put(`/students/${id}`, payload);
    return data;
};

export const deleteStudentApi = async (id: string) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
};
