import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://gt-schoolhub.onrender.com/api';

interface RequestOptions extends RequestInit {
    params?: Record<string, string>;
}

export const api = async (endpoint: string, options: RequestOptions = {}) => {
    const { params, headers, ...rest } = options;

    // Construct URL with query params
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
        const searchParams = new URLSearchParams(params);
        url += `?${searchParams.toString()}`;
    }

    // Get token from storage
    let token = null;
    try {
        const authDataSerialized = await AsyncStorage.getItem('@AuthData');
        if (authDataSerialized) {
            const authData = JSON.parse(authDataSerialized);
            token = authData.token;
        }
    } catch (e) {
        console.error('Error fetching token', e);
    }

    const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...rest,
        headers: {
            ...defaultHeaders,
            ...headers,
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
    }

    return data;
};

export const endpoints = {
    auth: {
        login: '/auth/login',
        profile: '/auth/me',
    },
    students: {
        list: '/students',
        details: (id: string) => `/students/${id}`,
    },
    teachers: {
        list: '/teachers',
    },
    fees: {
        list: '/payments/admin/all',
        summary: '/payments/admin/stats',
    },
    results: {
        list: '/results',
    },
    notifications: {
        list: '/notifications',
    },
    school: {
        get: '/schools/my-school',
        update: '/schools/my-school',
    },
    academic: {
        sessions: '/academic/sessions',
        activateSession: '/academic/sessions/activate',
        classes: '/academic/classes',
        arms: '/academic/classes/arms',
        subjects: '/academic/subjects',
    },
    users: {
        students: {
            base: '/students',
            detail: (id: string) => `/students/${id}`,
            promote: '/students/promote',
            history: (id: string) => `/students/${id}/history`,
            documents: (id: string) => `/students/${id}/documents`,
        },
        teachers: {
            base: '/teachers',
            detail: (id: string) => `/teachers/${id}`,
        },
        assignTeacher: '/academic/assignments/teacher',
    },
    assessment: {
        config: '/assessment-config',
    },
};
