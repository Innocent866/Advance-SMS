const express = require('express');
const router = express.Router();
const { 
    sendMessage, 
    getMessages, 
    getChatStaff,
    createGroup,
    getUserGroups,
    updateGroup,
    deleteGroup
} = require('../controllers/chat.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// All staff roles can use the chat
const staffRoles = ['super_admin', 'school_admin', 'teacher', 'hostel_warden', 'house_parent'];

router.use(protect);
router.use(authorize(...staffRoles));

router.get('/staff', getChatStaff);

// Group management
router.route('/groups')
    .get(getUserGroups)
    .post(createGroup);

router.route('/groups/:id')
    .put(updateGroup)
    .delete(deleteGroup);

router.route('/')
    .get(getMessages)
    .post(sendMessage);

module.exports = router;
