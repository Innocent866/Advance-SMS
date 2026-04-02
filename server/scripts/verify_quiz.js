const axios = require('axios');
const api = axios.create({ baseURL: 'http://localhost:5001/api' });

async function verifyQuiz() {
    try {
        // 1. Login Teacher
        // Assuming we have a teacher and student from seed
        // We might need to register them if seed differs, but let's try standard credentials from earlier context or assumptions
        // If login fails, I'll know.
        let teacherToken;
        try {
            const res = await api.post('/auth/login', { email: 'adebayo@excelhigh.edu.ng', password: 'password123' });
            teacherToken = res.data.token;
        } catch (e) {
            console.log('Teacher login failed, trying register...');
            // Try register? Or just fail? Let's assume login works as per usual context.
            console.error(e.response?.data);
            return;
        }

        // 2. Fetch Existing Video (Skip creation to avoid file upload complexity)
        // const videoRes = await api.post('/videos', ...);
        
        const videos = await api.get('/videos?teacherId=me', { headers: { Authorization: `Bearer ${teacherToken}` }});
        let videoId;
        if (videos.data.length > 0) {
            videoId = videos.data[0]._id;
        } else {
             console.log('No videos found for teacher. Cannot create quiz.');
             return;
        }

        // 3. Create Quiz
        console.log('Creating Quiz for video:', videoId);
        const quizRes = await api.post('/learning/quizzes', {
            videoId,
            title: 'Test Quiz',
            questions: [{
                text: 'What is 2+2?',
                options: ['3', '4', '5', '6'],
                correctAnswer: '4' 
            }],
            duration: 10,
            isPublished: true
        }, { headers: { Authorization: `Bearer ${teacherToken}` }});
        const quizId = quizRes.data._id;
        console.log('Quiz Created:', quizId);

        // 4. Login Student
        const sRes = await api.post('/auth/login', { email: 'chinedu@student.com', password: 'password123' });
        const studentToken = sRes.data.token;

        // 5. Submit Quiz
        console.log('Submitting Quiz...');
        const submitRes = await api.post('/learning/submissions', {
            quizId,
            answers: [{
                questionIndex: 0,
                selectedOptionIndex: 1, // Index 1 is '4'
                answerText: '4' // Redundant for objective but logic might use it? logic uses options[index]
            }]
        }, { headers: { Authorization: `Bearer ${studentToken}` }});

        console.log('Submission Result:', submitRes.data);
        if (submitRes.data.score === 100) {
            console.log('SUCCESS: Score is 100');
        } else {
            console.log('FAILURE: Score is', submitRes.data.score);
        }

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

verifyQuiz();
