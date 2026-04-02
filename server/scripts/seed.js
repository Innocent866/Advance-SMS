const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const School = require('./models/School');
const User = require('./models/User');
const ClassLevel = require('./models/ClassLevel');
const Subject = require('./models/Subject');
const VideoLesson = require('./models/VideoLesson');
const Quiz = require('./models/Quiz');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // Clear existing data
        await School.deleteMany({});
        await User.deleteMany({});
        await ClassLevel.deleteMany({});
        await Subject.deleteMany({});
        await VideoLesson.deleteMany({});
        await Quiz.deleteMany({});

        console.log('Data Cleared');

        // 1. Create School
        const school = await School.create({
            name: 'Excel High School',
            contactEmail: 'admin@excelhigh.edu.ng',
            address: 'Lagos, Nigeria',
            plan: 'Pro',
            isVerified: true
        });

        // 2. Create Admin
        const salt = await bcrypt.genSalt(10);
        const adminHash = await bcrypt.hash('password123', salt);
        const admin = await User.create({
            schoolId: school._id,
            name: 'Principal Okafor',
            email: 'admin@excelhigh.edu.ng',
            passwordHash: adminHash,
            role: 'school_admin'
        });

        // 3. Create Classes
        const jss1 = await ClassLevel.create({ schoolId: school._id, name: 'JSS 1', category: 'JSS' });
        const sss1 = await ClassLevel.create({ schoolId: school._id, name: 'SSS 1', category: 'SSS' });

        // 4. Create Subjects
        const math = await Subject.create({ schoolId: school._id, name: 'Mathematics', code: 'MTH' });
        const eng = await Subject.create({ schoolId: school._id, name: 'English Language', code: 'ENG' });

        // 5. Create Teacher
        const teacherHash = await bcrypt.hash('password123', salt);
        const teacher = await User.create({
            schoolId: school._id,
            name: 'Mr. Adebayo',
            email: 'adebayo@excelhigh.edu.ng',
            passwordHash: teacherHash,
            role: 'teacher',
            subjects: [math._id]
        });

        // 6. Create Student
        const studentHash = await bcrypt.hash('password123', salt);
        const student = await User.create({
            schoolId: school._id,
            name: 'Chinedu Obi',
            email: 'chinedu@student.com',
            passwordHash: studentHash,
            role: 'student',
            classId: sss1._id
        });

        // 7. Create Video Lesson
        const video = await VideoLesson.create({
            schoolId: school._id,
            teacherId: teacher._id,
            classLevelId: sss1._id,
            subjectId: math._id,
            title: 'Introduction to Sets',
            topic: 'Set Theory',
            description: 'Understanding the basic concepts of Set Theory.',
            videoUrl: 'https://www.youtube.com/watch?v=tyDKR4FG3Yw' // Placeholder
        });

        // 8. Create Quiz
        await Quiz.create({
            schoolId: school._id,
            teacherId: teacher._id,
            videoId: video._id,
            title: 'Sets Quiz',
            questions: [
                {
                    text: 'What is a Set?',
                    options: ['A collection of well-defined objects', 'A list of random numbers', 'A type of food', 'None of the above'],
                    correctAnswer: 'A collection of well-defined objects'
                },
                {
                    text: 'Which symbol represents the Universal Set?',
                    options: ['Ø', '∩', '∪', 'ξ'],
                    correctAnswer: 'ξ'
                }
            ]
        });

        console.log('Seed Data Imported Successfully!');
        console.log(`Admin Login: admin@excelhigh.edu.ng / password123`);
        console.log(`Teacher Login: adebayo@excelhigh.edu.ng / password123`);
        console.log(`Student Login: chinedu@student.com / password123`);
        
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

seedData();
