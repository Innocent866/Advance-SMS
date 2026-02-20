const Nurse = require('../models/Nurse');
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notification.controller');

// @desc    Create a new nurse
// @route   POST /api/nurses
// @access  Private (School Admin)
const createNurse = async (req, res) => {
    const { firstName, lastName, email, password, gender, qualification, phoneNumber } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        
        const finalPassword = password || 'nurse123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'nurse'
        });

        // 2. Create Nurse Profile
        const nurse = await Nurse.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            userId: user._id,
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            profilePicture: req.file ? req.file.path : null,
            qualification,
            status: 'active'
        });

        res.status(201).json(nurse);

        // Notify Admin
        await createNotification(
            req.user._id,
            `New Nurse Added: ${firstName} ${lastName}`,
            'success'
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getNurses = async (req, res) => {
    try {
        const nurses = await Nurse.find({ schoolId: req.user.schoolId._id || req.user.schoolId });
        res.json(nurses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getNurseById = async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.params.id);
        if (!nurse) return res.status(404).json({ message: 'Nurse not found' });
        res.json(nurse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const nurse = await Nurse.findOne({ userId: req.user._id });
        if (!nurse) return res.status(404).json({ message: 'Profile not found' });
        res.json(nurse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateNurse = async (req, res) => {
    try {
        let nurse = await Nurse.findById(req.params.id);
        if (!nurse) return res.status(404).json({ message: 'Nurse not found' });

        if (req.file) nurse.profilePicture = req.file.path;
        if (req.body.firstName) nurse.firstName = req.body.firstName;
        if (req.body.lastName) nurse.lastName = req.body.lastName;
        if (req.body.phoneNumber) nurse.phoneNumber = req.body.phoneNumber;
        if (req.body.qualification) nurse.qualification = req.body.qualification;

        await nurse.save();
        res.json(nurse);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteNurse = async (req, res) => {
    try {
        const nurse = await Nurse.findById(req.params.id);
        if (!nurse) return res.status(404).json({ message: 'Nurse not found' });

        await User.findByIdAndDelete(nurse.userId);
        await Nurse.deleteOne({ _id: nurse._id });

        res.json({ message: 'Nurse removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createNurse,
    getNurses,
    getNurseById,
    getMyProfile,
    updateNurse,
    deleteNurse
};
