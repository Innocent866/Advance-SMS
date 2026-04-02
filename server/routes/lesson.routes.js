const express = require('express');
const router = express.Router();
const { protect, teacher, teacherStrict } = require('../middleware/auth.middleware');
const { checkSubscription, checkFeatureAccess } = require('../middleware/subscription.middleware');
const { generateLesson, saveLesson, getLessons, getLessonById, updateLesson, deleteLesson } = require('../controllers/lesson.controller');

router.use(protect);
router.use(checkSubscription);

router.post('/generate', teacherStrict, checkFeatureAccess('aiLessonPlanner'), generateLesson);
router.post('/', teacherStrict, saveLesson);
router.get('/', getLessons);

router.route('/:id')
    .get(getLessonById)
    .put(updateLesson)
    .delete(deleteLesson);

module.exports = router;
