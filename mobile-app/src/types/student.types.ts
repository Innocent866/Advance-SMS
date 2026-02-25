export interface Student {
    _id: string;
    name: string;
    studentId: string;
    class: string;
    arm: string;
    gender: 'male' | 'female';
    dateOfBirth?: string;
    parentName?: string;
    parentPhone?: string;
    address?: string;
    status: 'active' | 'inactive';
    avatar?: string;
    schoolId: string;
}

export interface StudentResult {
    _id: string;
    studentId: string;
    term: 'First' | 'Second' | 'Third';
    session: string;
    subjects: SubjectResult[];
    totalScore: number;
    average: number;
    grade: string;
    position: number;
    remark: string;
}

export interface SubjectResult {
    subject: string;
    ca1: number;
    ca2: number;
    exam: number;
    total: number;
    grade: string;
    remark: string;
}
