const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new school (and super admin)
// @route   POST /api/auth/register-school
// @access  Public
const registerSchool = async (req, res) => {
    const { schoolName, schoolEmail, adminName, adminEmail, password } = req.body;

    if (!schoolName || !schoolEmail || !adminName || !adminEmail || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if school exists
        const schoolExists = await School.findOne({ contactEmail: schoolEmail });
        if (schoolExists) {
            return res.status(400).json({ message: 'School already exists' });
        }

        // Create school
        const school = await School.create({
            name: schoolName,
            contactEmail: schoolEmail,
        });

        // Check if user exists
        const userExists = await User.findOne({ email: adminEmail });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create Admin User
        const user = await User.create({
            schoolId: school._id,
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'school_admin' 
        });

        res.status(201).json({
            message: 'Registration successful! Your school is pending verification by the specific admin.',
            isVerified: false
            // No token returned - user must wait for verification to login
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check for user email
        const user = await User.findOne({ email });

        if (user && (await bcrypt.compare(password, user.passwordHash))) {
            
            // Check School Verification
            if (user.schoolId) {
                const school = await School.findById(user.schoolId);
                if (school && !school.isVerified) {
                    return res.status(403).json({ 
                        message: 'School account is pending verification. Please contact support.' 
                    });
                }
            }

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                schoolId: user.schoolId,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
// @desc    Update user profile (Name)
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (req.body.name) user.name = req.body.name;
        
        const updatedUser = await user.save();

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            schoolId: updatedUser.schoolId,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Change Password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
            return res.status(400).json({ message: 'Invalid current password' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    let user = req.user;
    // If student, populate class name for UI display
    if (user.role === 'student' && user.classId) {
        // We need to re-fetch to populate because req.user from middleware is not populated
        user = await User.findById(user._id)
            .select('-passwordHash')
            .populate('classId', 'name')
            .populate('schoolId'); // Re-populate schoolId for logoUrl
    }
    res.status(200).json(user);
};

module.exports = {
    registerSchool,
    loginUser,
    getMe,
    updateProfile,
    changePassword
};
