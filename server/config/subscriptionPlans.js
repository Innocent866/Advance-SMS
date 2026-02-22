const subscriptionPlans = {
    Free: {
        price: 0,
        maxStudents: 50,
        maxStaff: 10,
        aiTokenLimit: 0,
        features: [
            'studentManagement',
            'staffManagement',
            'studentAttendance',
            'basicDashboard'
        ]
    },
    Basic: {
        price: 50000,
        duration: 90,
        term: 'Quarterly',
        maxStudents: 300,
        maxStaff: 40,
        aiTokenLimit: 50000,
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
        price: 100000,
        duration: 90,
        term: 'Quarterly',
        maxStudents: 700,
        maxStaff: 70,
        aiTokenLimit: 200000,
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
        price: 200000,
        duration: 90,
        term: 'Quarterly',
        maxStudents: 1500,
        maxStaff: 200,
        aiTokenLimit: 1000000,
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
            'aiMarking',
            'afterSchool',
            'advancedAnalytics',
            'aiLessonPlanner',
            'videoLessons'
        ]
    }
};

module.exports = subscriptionPlans;
