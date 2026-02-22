export const planConfig = {
    Free: {
        maxStudents: 50,
        maxStaff: 10,
        features: [
            'studentManagement',
            'staffManagement',
            'studentAttendance',
            'basicDashboard'
        ]
    },
    Basic: {
        maxStudents: 300,
        maxStaff: 40,
        features: [
            'studentManagement',
            'staffManagement',
            'studentAttendance',
            'teacherAttendance',
            'learningMaterials',
            'basicReports'
        ]
    },
    Standard: {
        maxStudents: 700,
        maxStaff: 70,
        features: [
            'studentManagement',
            'staffManagement',
            'studentAttendance',
            'teacherAttendance',
            'learningMaterials',
            'basicReports',
            'continuousAssessment',
            'examManagement',
            'classArmManagement',
            'staffAdminComm',
            'aiLessonPlanner',
            'videoLessons'
        ]
    },
    Premium: {
        maxStudents: 1500,
        maxStaff: 200,
        features: [
            'studentManagement',
            'staffManagement',
            'studentAttendance',
            'teacherAttendance',
            'learningMaterials',
            'basicReports',
            'continuousAssessment',
            'examManagement',
            'classArmManagement',
            'staffAdminComm',
            'aiLessonPlanner',
            'videoLessons',
            'aiMarking',
            'afterSchool',
            'advancedAnalytics',
            'branding'
        ]
    }
};

export const checkAccess = (user, feature) => {
    if (!user || !user.schoolId) return false;
    const plan = user.schoolId.subscription?.plan || 'Free';
    const config = planConfig[plan];
    return config && config.features.includes(feature);
};

export const checkLimit = (user, resource, currentCount) => {
    if (!user || !user.schoolId) return false;
    const plan = user.schoolId.subscription?.plan || 'Free';
    const config = planConfig[plan];
    
    // Check if school has a custom override in subscription (rare but possible backend logic sync)
    // For frontend simplicity, we rely on planConfig or user.schoolId.subscription.max... if available
    const maxLimit = user.schoolId.subscription?.[resource === 'Student' ? 'maxStudents' : 'maxTeachers'] || config?.[resource === 'Student' ? 'maxStudents' : 'maxStaff'];
    
    return currentCount < maxLimit;
};
