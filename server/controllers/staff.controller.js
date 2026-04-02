const User = require('../models/User');
const StaffProfile = require('../models/StaffProfile');
const Teacher = require('../models/Teacher');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notification.controller');

// @desc    Create a new staff member (Admin or Houseparent)
// @route   POST /api/staff
// @access  Private (School Admin)
exports.createStaff = async (req, res) => {
    let { 
        firstName, lastName, email, password, role, gender, phoneNumber, 
        designation, permissions, emergencyContact, 
        departmentId, subjects, assignedHouse, dateAssigned 
    } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        const schoolId = req.user.schoolId._id || req.user.schoolId;
        const school = await School.findById(schoolId);
        
        const finalPassword = password || school.defaultTeacherPassword || 'staff123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role,
            permissions: permissions ? (typeof permissions === 'string' ? JSON.parse(permissions) : permissions) : [],
            emergencyContact: emergencyContact ? (typeof emergencyContact === 'string' ? JSON.parse(emergencyContact) : emergencyContact) : {}
        });

        let profile;
        if (role === 'teacher') {
            // 2a. Create Teacher Profile
            profile = await Teacher.create({
                schoolId,
                userId: user._id,
                firstName,
                lastName,
                email,
                phoneNumber,
                gender,
                profilePicture: req.file ? req.file.path : null,
                departmentId,
                subjects: subjects ? (typeof subjects === 'string' ? JSON.parse(subjects) : subjects) : [],
                emergencyContact: user.emergencyContact,
                status: 'active'
            });
        } else {
            // 2b. Create Staff Profile (Admin, Houseparent, etc.)
            profile = await StaffProfile.create({
                schoolId,
                userId: user._id,
                firstName,
                lastName,
                email,
                phoneNumber,
                gender,
                designation,
                assignedHouse,
                dateAssigned,
                emergencyContact: user.emergencyContact,
                profilePicture: req.file ? req.file.path : null
            });
        }

        // Update School Usage for media
        if (req.file) {
            await School.findByIdAndUpdate(schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        res.status(201).json({
            success: true,
            data: {
                _id: profile._id,
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: profile.email,
                role: user.role
            }
        });

        // Notify calling admin
        await createNotification(
            req.user._id,
            `New ${role} Added: ${firstName} ${lastName}`,
            'success'
        );

    } catch (error) {
        console.error('Create Staff Error:', error);
        res.status(500).json({ message: error.message || 'Server error creating staff' });
    }
};

// @desc    Get all staff (Unified: Admin, Teachers, Houseparents)
// @route   GET /api/staff/unified
// @access  Private (School Admin)
exports.getUnifiedStaff = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        
        // 1. Fetch from StaffProfile (includes school_admin, house_parent, etc.)
        const nonTeachingStaff = await StaffProfile.find({ schoolId })
            .populate('userId', 'role permissions emergencyContact')
            .populate('assignedHouse', 'name');
        
        // 2. Fetch from Teacher collection
        const teachingStaff = await Teacher.find({ schoolId })
            .populate('userId', 'role permissions emergencyContact')
            .populate('departmentId', 'name')
            .populate('subjects', 'name');
        
        // 3. Combine and Format
        const unified = [
            ...nonTeachingStaff.map(s => ({
                _id: s._id,
                userId: s.userId,
                firstName: s.firstName,
                lastName: s.lastName,
                email: s.email,
                phoneNumber: s.phoneNumber,
                gender: s.gender,
                designation: s.designation,
                assignedHouse: s.assignedHouse,
                dateAssigned: s.dateAssigned,
                emergencyContact: s.emergencyContact,
                profilePicture: s.profilePicture,
                type: 'staff'
            })),
            ...teachingStaff.map(t => ({
                _id: t._id,
                userId: t.userId,
                firstName: t.firstName,
                lastName: t.lastName,
                email: t.email,
                phoneNumber: t.phoneNumber,
                gender: t.gender,
                designation: 'Teacher',
                departmentId: t.departmentId,
                subjects: t.subjects,
                emergencyContact: t.emergencyContact,
                profilePicture: t.profilePicture,
                type: 'teacher'
            }))
        ];

        res.status(200).json({ success: true, data: unified });
    } catch (error) {
        console.error('Unified Staff Error:', error);
        res.status(500).json({ message: 'Server error fetching unified staff' });
    }
};

// @desc    Get all non-teacher staff
// @route   GET /api/staff
// @access  Private (School Admin)
exports.getStaff = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const staff = await StaffProfile.find({ schoolId }).populate('userId', 'role');
        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update staff profile
// @route   PUT /api/staff/:id
// @access  Private (School Admin)
exports.updateStaff = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        
        // 1. Find the profile (try StaffProfile then Teacher)
        let profile = await StaffProfile.findById(req.params.id);
        let isTeacher = false;
        
        if (!profile) {
            profile = await Teacher.findById(req.params.id);
            if (profile) isTeacher = true;
        }
        
        if (!profile) return res.status(404).json({ message: 'Staff member not found' });

        if (profile.schoolId.toString() !== schoolId.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // 2. Update profile fields
        const fieldsToUpdate = [
            'firstName', 'lastName', 'phoneNumber', 'gender', 'designation', 
            'status', 'email', 'departmentId', 'subjects', 'assignedHouse', 
            'dateAssigned', 'emergencyContact'
        ];
        fieldsToUpdate.forEach(field => {
            if (req.body[field] !== undefined) {
                if (['subjects', 'emergencyContact'].includes(field) && typeof req.body[field] === 'string') {
                    profile[field] = JSON.parse(req.body[field]);
                } else {
                    profile[field] = req.body[field];
                }
            }
        });

        if (req.file) {
            profile.profilePicture = req.file.path;
            await School.findByIdAndUpdate(schoolId, { $inc: { 'mediaUsage.storageBytes': req.file.size, 'mediaUsage.uploadCount': 1 } });
        }

        await profile.save();

        // 3. Update User if name/email/permissions changed
        const userUpdate = {};
        if (req.body.firstName || req.body.lastName) {
            userUpdate.name = `${profile.firstName} ${profile.lastName}`;
        }
        if (req.body.email) userUpdate.email = req.body.email;
        if (req.body.permissions) {
            userUpdate.permissions = typeof req.body.permissions === 'string' ? JSON.parse(req.body.permissions) : req.body.permissions;
        }
        if (req.body.emergencyContact) {
            userUpdate.emergencyContact = typeof req.body.emergencyContact === 'string' ? JSON.parse(req.body.emergencyContact) : req.body.emergencyContact;
        }
        
        if (Object.keys(userUpdate).length > 0) {
            await User.findByIdAndUpdate(profile.userId, userUpdate);
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error) {
        console.error('Update Staff Error:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete staff
// @route   DELETE /api/staff/:id
// @access  Private (Admin)
exports.deleteStaff = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        
        // Try StaffProfile first
        let profile = await StaffProfile.findById(req.params.id);
        let Model = StaffProfile;
        
        if (!profile) {
            profile = await Teacher.findById(req.params.id);
            Model = Teacher;
        }

        if (!profile) return res.status(404).json({ message: 'Staff member not found' });

        if (profile.schoolId.toString() !== schoolId.toString() && req.user.role !== 'super_admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Delete linked User account
        if (profile.userId) {
            await User.findByIdAndDelete(profile.userId);
        }

        await Model.deleteOne({ _id: profile._id });

        res.status(200).json({ success: true, message: 'Staff member removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
