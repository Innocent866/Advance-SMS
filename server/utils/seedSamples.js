const mongoose = require('mongoose');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

/**
 * SAMPLE SEED DATA
 * 
 * Usage: 
 * 1. Ensure User (Auth) exists first.
 * 2. Link userId to these profiles.
 */

const seedTeachers = [
    {
        _id: new mongoose.Types.ObjectId(),
        schoolId: new mongoose.Types.ObjectId('650000000000000000000001'), // Example School ID
        userId: new mongoose.Types.ObjectId('650000000000000000000101'),   // Example User ID
        firstName: "Emeka",
        lastName: "Okonkwo",
        email: "emeka.okonkwo@school.com",
        phoneNumber: "08012345678",
        gender: "Male",
        employeeId: "TCH-001",
        qualification: "B.Ed Mathematics",
        yearsOfExperience: 5,
        level: ["SSS"],
        subjects: [
            new mongoose.Types.ObjectId('650000000000000000000201'), // Mathematics
            new mongoose.Types.ObjectId('650000000000000000000202')  // Further Math
        ],
        classes: [
            new mongoose.Types.ObjectId('650000000000000000000301'), // SSS 1
            new mongoose.Types.ObjectId('650000000000000000000302')  // SSS 2
        ],
        status: "active",
        aiUsageCount: 12,
        lastAiGeneratedAt: new Date(),
        lessonCount: 8,
        videoLessonCount: 3
    },
    {
         _id: new mongoose.Types.ObjectId(),
         schoolId: new mongoose.Types.ObjectId('650000000000000000000001'),
         userId: new mongoose.Types.ObjectId('650000000000000000000102'),
         firstName: "Chioma",
         lastName: "Adeyemi",
         email: "chioma.adeyemi@school.com",
         phoneNumber: "08087654321",
         gender: "Female",
         employeeId: "TCH-002",
         qualification: "MSc English",
         yearsOfExperience: 8,
         level: ["JSS", "SSS"],
         subjects: [
             new mongoose.Types.ObjectId('650000000000000000000203') // English Language
         ],
         classes: [
             new mongoose.Types.ObjectId('650000000000000000000303') // JSS 1
         ],
         status: "active"
    }
];

const seedStudents = [
    {
        _id: new mongoose.Types.ObjectId(),
        schoolId: new mongoose.Types.ObjectId('650000000000000000000001'),
        userId: new mongoose.Types.ObjectId('650000000000000000000103'),
        firstName: "Ibrahim",
        lastName: "Musa",
        email: "ibrahim.musa@student.school.com",
        gender: "Male",
        studentId: "STD-2024-001",
        classId: new mongoose.Types.ObjectId('650000000000000000000301'), // SSS 1
        level: "SSS",
        subjects: [
            new mongoose.Types.ObjectId('650000000000000000000201'), // Maths
            new mongoose.Types.ObjectId('650000000000000000000203')  // English
        ],
        status: "active",
        videosWatched: [
            {
                videoId: new mongoose.Types.ObjectId(),
                watchedAt: new Date(Date.now() - 86400000), // yesterday
                watchDuration: 120
            }
        ],
        tasksCompleted: [
            {
                taskId: new mongoose.Types.ObjectId(),
                score: 85,
                submittedAt: new Date()
            }
        ],
        parentName: "Alhaji Musa",
        parentPhone: "08099887766"
    }
];

module.exports = { seedTeachers, seedStudents };
