export const formatDate = (iso: string): string => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatCurrency = (amount: number): string => {
    return '₦' + amount.toLocaleString('en-NG');
};

export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .slice(0, 2)
        .map((n) => n[0])
        .join('')
        .toUpperCase();
};

export const capitalize = (str: string): string =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

export const getGradeColor = (grade: string): string => {
    const map: Record<string, string> = {
        A: '#16a34a',
        B: '#2563eb',
        C: '#f59e0b',
        D: '#ea580c',
        E: '#dc2626',
        F: '#ef4444',
    };
    return map[grade?.toUpperCase()] ?? '#6b7280';
};

export const getAttendanceColor = (percentage: number): string => {
    if (percentage >= 80) return '#16a34a';
    if (percentage >= 60) return '#f59e0b';
    return '#ef4444';
};
