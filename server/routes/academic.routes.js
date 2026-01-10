const express = require('express');
const router = express.Router();
const { 
    createSubject, 
    getSubjects, 
    createClassLevel, 
    getClassLevels,
    updateClassArms,
    assignSubjectToClass,
    createSession,
    getSessions,
    activateSession,
    assignTeacherToSubject,
    updateClassSettings
} = require('../controllers/academic.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.route('/subjects')
    .post(protect, admin, createSubject)
    .get(protect, getSubjects);

router.route('/classes')
    .post(protect, admin, createClassLevel)
    .get(protect, getClassLevels);

router.post('/classes/arms', protect, admin, updateClassArms); // POST { classId, armName }
router.post('/classes/subjects', protect, admin, assignSubjectToClass); // POST { classId, subjectId }
router.post('/classes/settings', protect, admin, updateClassSettings); // POST { classId, hasAfterSchoolLearning, videoSubjects }

router.route('/sessions')
    .post(protect, admin, createSession)
    .get(protect, getSessions);

router.post('/sessions/activate', protect, admin, activateSession);

router.post('/assignments/teacher', protect, admin, assignTeacherToSubject); // Assign teacher to subject

module.exports = router;
