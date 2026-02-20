const Doctor = require('../models/Doctor');
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcryptjs');
const { createNotification } = require('./notification.controller');

// @desc    Create a new doctor
// @route   POST /api/doctors
// @access  Private (School Admin)
const createDoctor = async (req, res) => {
    const { firstName, lastName, email, password, gender, qualification, phoneNumber, licenseNumber, specialization, consultationHours } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const school = await School.findById(req.user.schoolId._id || req.user.schoolId);
        
        const finalPassword = password || 'doctor123';
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(finalPassword, salt);

        // 1. Create User (Auth)
        const user = await User.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            name: `${firstName} ${lastName}`,
            email,
            passwordHash,
            role: 'doctor'
        });

        // 2. Create Doctor Profile
        const doctor = await Doctor.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            userId: user._id,
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            profilePicture: req.file ? req.file.path : null,
            qualification,
            licenseNumber,
            specialization,
            consultationHours,
            status: 'active'
        });

        res.status(201).json(doctor);

        // Notify Admin
        await createNotification(
            req.user._id,
            `New Doctor Added: ${firstName} ${lastName}`,
            'success'
        );

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctors = async (req, res) => {
    try {
        const doctors = await Doctor.find({ schoolId: req.user.schoolId._id || req.user.schoolId });
        res.json(doctors);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getDoctorById = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const doctor = await Doctor.findOne({ userId: req.user._id });
        if (!doctor) return res.status(404).json({ message: 'Profile not found' });
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const updateDoctor = async (req, res) => {
    try {
        let doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        if (req.file) doctor.profilePicture = req.file.path;
        if (req.body.firstName) doctor.firstName = req.body.firstName;
        if (req.body.lastName) doctor.lastName = req.body.lastName;
        if (req.body.phoneNumber) doctor.phoneNumber = req.body.phoneNumber;
        if (req.body.qualification) doctor.qualification = req.body.qualification;
        if (req.body.specialization) doctor.specialization = req.body.specialization;
        if (req.body.consultationHours) doctor.consultationHours = req.body.consultationHours;

        await doctor.save();
        res.json(doctor);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        await User.findByIdAndDelete(doctor.userId);
        await Doctor.deleteOne({ _id: doctor._id });

        res.json({ message: 'Doctor removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createDoctor,
    getDoctors,
    getDoctorById,
    getMyProfile,
    updateDoctor,
    deleteDoctor
};
