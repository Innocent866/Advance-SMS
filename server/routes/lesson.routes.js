const express = require('express');
const router = express.Router();
const { protect, teacher, teacherStrict } = require('../middleware/auth.middleware');
const { checkSubscription, checkFeatureAccess } = require('../middleware/subscription.middleware');
const { generateLesson, saveLesson, getLessons, getLessonById, updateLesson, deleteLesson } = require('../controllers/lesson.controller');

router.post('/generate', protect, teacherStrict, checkSubscription, checkFeatureAccess('aiLessonPlanner'), generateLesson);
router.post('/', protect, teacherStrict, checkSubscription, saveLesson);
router.get('/', protect, getLessons);

router.route('/:id')
    .get(protect, getLessonById)
    .put(protect, updateLesson)
    .delete(protect, deleteLesson);

module.exports = router;
