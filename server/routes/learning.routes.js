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
const { checkFeature } = require('../middleware/feature.middleware');

router.use(protect);
router.use(checkFeature('learningManagement'));

router.route('/videos')
    .post(createVideo)
    .get(getVideos);

router.post('/videos/:id/view', incrementView);

router.post('/quizzes', createQuiz);
router.get('/quizzes/:videoId', getQuizByVideoId);

router.route('/submissions')
    .post(submitQuiz)
    .get(getMySubmissions);

router.get('/subjects', getStudentSubjects);

// Progress & History
router.post('/progress/:videoId', markVideoComplete);
router.get('/history', getLearningHistory);

module.exports = router;
