const express = require('express');
const router = express.Router();
const { 
    createVideo, 
    getVideos, 
    createQuiz, 
    getQuizByVideoId, 
    submitQuiz,
    getMySubmissions,
    getStudentSubjects,
    markVideoComplete,
    getLearningHistory,
    incrementView
} = require('../controllers/learning.controller');
const { protect } = require('../middleware/auth.middleware');

router.route('/videos')
    .post(protect, createVideo)
    .get(protect, getVideos);

router.post('/videos/:id/view', protect, incrementView);

router.post('/quizzes', protect, createQuiz);
router.get('/quizzes/:videoId', protect, getQuizByVideoId);

router.route('/submissions')
    .post(protect, submitQuiz)
    .get(protect, getMySubmissions);

router.get('/subjects', protect, getStudentSubjects);

// Progress & History
router.post('/progress/:videoId', protect, markVideoComplete);
router.get('/history', protect, getLearningHistory);

module.exports = router;
