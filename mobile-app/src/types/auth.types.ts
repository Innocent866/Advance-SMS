export interface AuthUser {
    _id: string;
    name: string;
    email: string;
    role: 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';
    schoolId?: string;
    school?: {
        _id: string;
        name: string;
        logo?: string;
        subscriptionStatus?: string;
        features?: Record<string, boolean>;
    };
    avatar?: string;
    token: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface ForgotPasswordPayload {
    email: string;
}
