import api from './axiosInstance';

export const getAttendanceApi = async (params: Record<string, string>) => {
    const { data } = await api.get('/attendance', { params });
    return data;
};

export const markAttendanceApi = async (payload: {
    classId: string;
    date: string;
    records: Array<{ studentId: string; status: 'present' | 'absent' | 'late' }>;
}) => {
    const { data } = await api.post('/attendance/mark', payload);
    return data;
};

export const getAttendanceSummaryApi = async (studentId: string, params?: Record<string, string>) => {
    const { data } = await api.get(`/attendance/student/${studentId}`, { params });
    return data;
};
