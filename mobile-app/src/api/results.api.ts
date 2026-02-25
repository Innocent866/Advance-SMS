import api from './axiosInstance';

export const getResultsApi = async (params: Record<string, string>) => {
    const { data } = await api.get('/results', { params });
    return data;
};

export const getStudentResultsApi = async (studentId: string, params?: Record<string, string>) => {
    const { data } = await api.get(`/results/student/${studentId}`, { params });
    return data;
};

export const submitResultsApi = async (payload: any) => {
    const { data } = await api.post('/results', payload);
    return data;
};
