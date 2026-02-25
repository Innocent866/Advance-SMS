export type UserRole = 'super_admin' | 'school_admin' | 'teacher' | 'student' | 'parent';

export const RoleLabels: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    school_admin: 'Admin',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
};

export const RoleColors: Record<UserRole, string> = {
    super_admin: '#7c3aed',
    school_admin: '#16a34a',
    teacher: '#2563eb',
    student: '#0891b2',
    parent: '#d97706',
};
