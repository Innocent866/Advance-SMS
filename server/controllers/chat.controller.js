const Message = require('../models/Message');
const User = require('../models/User');
const ChatGroup = require('../models/ChatGroup');
const StaffProfile = require('../models/StaffProfile');
const Teacher = require('../models/Teacher');

// @desc    Send a message
// @route   POST /api/chat
// @access  Private (Staff only)
exports.sendMessage = async (req, res) => {
    try {
        const { content, category, messageType, attachment, recipientId, groupId } = req.body;

        const messageData = {
            sender: req.user._id,
            schoolId: req.user.schoolId,
            content,
            messageType: messageType || 'text',
            attachment
        };

        if (groupId) {
            messageData.groupId = groupId;
            messageData.category = 'group';
        } else if (recipientId) {
            messageData.recipient = recipientId;
            messageData.category = 'private';
        } else {
            messageData.category = category || 'official';
        }

        const message = await Message.create(messageData);

        // Populate sender and recipient/group info for the response
        const populatedMessage = await Message.findById(message._id)
            .populate('sender', 'name role profileImage')
            .populate('recipient', 'name role profileImage')
            .populate('groupId', 'name');

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({ message: 'Failed to send message', error: error.message });
    }
};

// @desc    Get message history
// @route   GET /api/chat
// @access  Private (Staff only)
exports.getMessages = async (req, res) => {
    try {
        const { category, recipientId, groupId } = req.query;
        
        let query = { schoolId: req.user.schoolId };

        if (groupId) {
            // Group chat
            // Verification: Ensure user is a member of the group
            const group = await ChatGroup.findById(groupId);
            if (!group || (!group.members.includes(req.user._id) && req.user.role !== 'school_admin' && req.user.role !== 'super_admin')) {
                return res.status(403).json({ message: 'Not authorized to view this group chat' });
            }
            query.groupId = groupId;
            query.category = 'group';
        } else if (recipientId) {
            // Private chat
            query = {
                schoolId: req.user.schoolId,
                $or: [
                    { sender: req.user._id, recipient: recipientId },
                    { sender: recipientId, recipient: req.user._id }
                ],
                category: 'private'
            };
        } else {
            // Channel chat
            query.category = category || 'official';
            query.recipient = null;
            query.groupId = null;
        }

        const messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('sender', 'name role profileImage');

        res.status(200).json(messages.reverse());
    } catch (error) {
        console.error('Get Messages Error:', error);
        res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
    }
};

// @desc    Get staff directory for chat
// @route   GET /api/chat/staff
// @access  Private (Staff only)
exports.getChatStaff = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;
        
        // 1. Fetch school admins for this school
        const admins = await User.find({ 
            schoolId, 
            role: 'school_admin',
            _id: { $ne: req.user._id }
        }).select('name role email profileImage createdAt');

        // 2. Fetch from StaffProfile (includes house_parent, etc.)
        const nonTeachingStaff = await StaffProfile.find({ schoolId, status: 'active' })
            .populate('userId', 'name role email createdAt');
        
        // 3. Fetch from Teacher collection
        const teachingStaff = await Teacher.find({ schoolId, status: 'active' })
            .populate('userId', 'name role email createdAt');
        
        // 4. Unify and deduplicate by userId
        const staffMap = new Map();

        // Add Admins first
        admins.forEach(admin => {
            staffMap.set(admin._id.toString(), {
                _id: admin._id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
                designation: 'School Administrator',
                profileImage: admin.profileImage,
                joinedAt: admin.createdAt
            });
        });

        // Add non-teaching staff
        nonTeachingStaff.forEach(s => {
            const uid = s.userId?._id || s.userId;
            if (!uid || uid.toString() === req.user._id.toString()) return;

            const role = s.userId?.role || 'staff';
            staffMap.set(uid.toString(), {
                _id: uid,
                name: s.userId?.name || `${s.firstName} ${s.lastName}`,
                email: s.userId?.email || s.email,
                role: role,
                designation: role === 'house_parent' ? 'House Parent' : (role === 'hostel_warden' ? 'Hostel Warden' : s.designation || 'Staff Member'),
                profileImage: s.profilePicture,
                gender: s.gender,
                phoneNumber: s.phoneNumber,
                bio: s.bio,
                joinedAt: s.userId?.createdAt || s.createdAt
            });
        });

        // Add teaching staff
        teachingStaff.forEach(t => {
            const uid = t.userId?._id || t.userId;
            if (!uid || uid.toString() === req.user._id.toString()) return;

            const role = t.userId?.role || 'teacher';
            staffMap.set(uid.toString(), {
                _id: uid,
                name: t.userId?.name || `${t.firstName} ${t.lastName}`,
                email: t.userId?.email || t.email,
                role: role,
                designation: role === 'teacher' ? 'Teaching Staff' : (role === 'house_parent' ? 'House Parent' : (role === 'hostel_warden' ? 'Hostel Warden' : t.designation || 'Teaching Staff')),
                profileImage: t.profilePicture,
                gender: t.gender,
                phoneNumber: t.phoneNumber,
                bio: t.bio,
                joinedAt: t.userId?.createdAt || t.createdAt
            });
        });

        res.status(200).json(Array.from(staffMap.values()));
    } catch (error) {
        console.error('Get Chat Staff Error:', error);
        res.status(500).json({ message: 'Failed to fetch staff directory' });
    }
};

// --- Group Management ---

// @desc    Create a new chat group
// @route   POST /api/chat/groups
// @access  Private (Admin only)
exports.createGroup = async (req, res) => {
    try {
        const { name, groupType, members, departmentId } = req.body;
        const schoolId = req.user.schoolId?._id || req.user.schoolId;

        const group = await ChatGroup.create({
            name,
            schoolId,
            groupType: groupType || 'custom',
            department: departmentId || null,
            members: members || [req.user._id],
            createdBy: req.user._id
        });

        res.status(201).json(group);
    } catch (error) {
        console.error('Create Group Error:', error);
        res.status(500).json({ message: 'Failed to create group' });
    }
};

// @desc    Get all groups for a user
// @route   GET /api/chat/groups
// @access  Private (Staff only)
exports.getUserGroups = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        
        let groups;
        if (req.user.role === 'school_admin' || req.user.role === 'super_admin') {
            // Admins can see all groups in the school
            groups = await ChatGroup.find({ schoolId });
        } else {
            // Regular staff only see groups they belong to
            groups = await ChatGroup.find({ 
                schoolId,
                members: req.user._id
            });
        }

        res.status(200).json(groups);
    } catch (error) {
        console.error('Get User Groups Error:', error);
        res.status(500).json({ message: 'Failed to fetch groups' });
    }
};

// @desc    Update group (Members/Name)
// @route   PUT /api/chat/groups/:id
// @access  Private (Admin only)
exports.updateGroup = async (req, res) => {
    try {
        const { name, members } = req.body;
        const group = await ChatGroup.findById(req.params.id);

        if (!group) return res.status(404).json({ message: 'Group not found' });
        
        // Authorization: Only creator or admin
        if (group.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to update this group' });
        }

        if (name) group.name = name;
        if (members) group.members = members;

        await group.save();
        res.status(200).json(group);
    } catch (error) {
        console.error('Update Group Error:', error);
        res.status(500).json({ message: 'Failed to update group' });
    }
};

// @desc    Delete group
// @route   DELETE /api/chat/groups/:id
// @access  Private (Admin only)
exports.deleteGroup = async (req, res) => {
    try {
        const group = await ChatGroup.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (group.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'school_admin' && req.user.role !== 'super_admin') {
            return res.status(403).json({ message: 'Not authorized to delete this group' });
        }

        await ChatGroup.deleteOne({ _id: group._id });
        // Optionally delete all messages in this group
        await Message.deleteMany({ groupId: group._id });

        res.status(200).json({ message: 'Group deleted successfully' });
    } catch (error) {
        console.error('Delete Group Error:', error);
        res.status(500).json({ message: 'Failed to delete group' });
    }
};
