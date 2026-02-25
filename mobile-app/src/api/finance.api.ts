import api from './axiosInstance';

export const getFinanceOverviewApi = async () => {
    const { data } = await api.get('/finance/overview');
    return data;
};

export const getPaymentsApi = async (params?: Record<string, string>) => {
    const { data } = await api.get('/finance/payments', { params });
    return data;
};

export const getStudentFeeApi = async (studentId: string) => {
    const { data } = await api.get(`/finance/fees/${studentId}`);
    return data;
};
