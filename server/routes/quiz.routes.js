const express = require('express');
const router = express.Router();
const { 
    createQuiz, 
    getQuizzes, 
    deleteQuiz, 
    submitQuiz, 
    getSubmissions 
} = require('../controllers/quiz.controller');
const { protect, teacher } = require('../middleware/auth.middleware');

router.route('/')
    .post(protect, teacher, createQuiz)
    .get(protect, getQuizzes);

router.route('/:id')
    .delete(protect, teacher, deleteQuiz);

router.post('/:id/submit', protect, submitQuiz); // Student submits
router.get('/:id/submissions', protect, teacher, getSubmissions); // Teacher views

module.exports = router;
