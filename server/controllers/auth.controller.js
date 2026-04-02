const User = require('../models/User');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/emailService');

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

        // Create verification token
        const verificationToken = crypto.randomBytes(20).toString('hex');

        // Create Admin User
        const user = await User.create({
            schoolId: school._id,
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'school_admin',
            verificationToken
        });

        // Send verification email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendUrl}/verify-email/${verificationToken}`;
        const message = `Welcome to GT-SchoolHub! Please verify your email by clicking the link: \n\n ${verifyUrl}`;
        const html = `
            <h1>Welcome to GT-SchoolHub!</h1>
            <p>Please verify your email to get started with your school management portal.</p>
            <a href="${verifyUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; borderRadius: 5px;">VERIFY EMAIL</a>
        `;

        try {
            await sendEmail({
                email: adminEmail,
                subject: 'Email Verification - GT-SchoolHub',
                message,
                html
            });
        } catch (err) {
            console.error('Email could not be sent', err);
        }

        res.status(201).json({
            message: 'Registration successful! Please check your email to verify your account.',
            isVerified: false,
            isEmailVerified: false
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
            // NEW: Two-Factor Authentication (Verification Token on Login)
            const otpCode = process.env.NODE_ENV === 'development' 
                ? '123456' 
                : Math.floor(100000 + Math.random() * 900000).toString();
            user.twoFactorCode = crypto.createHash('sha256').update(otpCode).digest('hex');
            user.twoFactorExpire = Date.now() + 10 * 60 * 1000; // 10 minutes session
            await user.save();

            // LOG OTP FOR TESTING
            console.log('-------------------------------------------');
            console.log(`[TESTING] OTP for ${email}: ${otpCode}`);
            console.log('-------------------------------------------');

            // Send OTP Email
            const message = `Your login verification code is: ${otpCode}. It expires in 10 minutes.`;
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #16a34a; text-align: center;">Login Verification</h2>
                    <p>Hello ${user.name},</p>
                    <p>You are attempting to sign in to GT-SchoolHub. Please use the verification code below to complete your login:</p>
                    <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; border-radius: 5px; margin: 20px 0;">
                        ${otpCode}
                    </div>
                    <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes. If you did not attempt to sign in, please secure your account.</p>
                </div>
            `;

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Login Verification Code - GT-SchoolHub',
                    message,
                    html
                });
            } catch (err) {
                console.error('2FA Email could not be sent', err);
            }

            return res.json({
                message: process.env.NODE_ENV === 'development' 
                    ? 'Verification code sent to email (DEV MODE: Use 123456)' 
                    : 'Verification code sent to email',
                requires2FA: true,
                userId: user._id
            });

        } else {
            res.status(400).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify 2FA Token and complete login
// @route   POST /api/auth/verify-2fa
// @access  Public
const verify2FA = async (req, res) => {
    const { userId, otpCode } = req.body;

    if (!userId || !otpCode) {
        return res.status(400).json({ message: 'User ID and Code are required' });
    }

    try {
        const hashedCode = crypto.createHash('sha256').update(otpCode).digest('hex');
        const user = await User.findOne({
            _id: userId,
            twoFactorCode: hashedCode,
            twoFactorExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification code' });
        }

        // Clear 2FA data
        user.twoFactorCode = undefined;
        user.twoFactorExpire = undefined;
        await user.save();

        // Check School Verification
        if (user.schoolId) {
            const school = await School.findById(user.schoolId);
            if (school && !school.isVerified) {
                return res.status(403).json({ 
                    message: 'School account is pending verification. Please contact support.' 
                });
            }
        }

        // Populate school details and subjects
        if (user.schoolId) {
            await user.populate('schoolId');
        }
        await user.populate('subjects.subjectId subjects.classId');

        // Check if HOD
        const Department = require('../models/Department');
        const departmentsManaged = await Department.find({ hodId: user._id });

        const responseData = {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isEmailVerified: !!user.isEmailVerified,
            isProfileSetup: user.schoolId?.isProfileSetup || false,
            schoolId: user.schoolId,
            token: generateToken(user._id),
            isHod: departmentsManaged.length > 0,
            managedDepartments: departmentsManaged.map(d => ({ _id: d._id, name: d.name })),
            subjects: user.subjects
        };
        
        // Enrichment for teachers: dynamic merge from Teacher model
        if (user.role === 'teacher') {
            const Teacher = require('../models/Teacher');
            const teacher = await Teacher.findOne({ userId: user._id })
                .populate('teachingAssignments.subjectId teachingAssignments.classId');
            
            if (teacher) {
                responseData.subjects = teacher.teachingAssignments;
                responseData.phoneNumber = teacher.phoneNumber;
                responseData.address = teacher.address;
                responseData.profilePicture = teacher.profilePicture;
                responseData.dateOfJoining = teacher.dateOfJoining;
            }
        }

        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ userId: user._id });
            if (student) {
                responseData.studentProfileId = student._id;
                responseData.studentId = student.studentId;
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('2FA Verification Error:', error);
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

        const { name, email, phoneNumber, address } = req.body;

        if (name) user.name = name;
        if (email) user.email = email;
        
        const updatedUser = await user.save();

        // Sync with Teacher profile if applicable
        if (user.role === 'teacher') {
            const Teacher = require('../models/Teacher');
            const teacher = await Teacher.findOne({ userId: user.id });
            if (teacher) {
                if (name) {
                    const names = name.split(' ');
                    teacher.firstName = names[0];
                    teacher.lastName = names.slice(1).join(' ') || names[0];
                }
                if (email) teacher.email = email;
                if (phoneNumber) teacher.phoneNumber = phoneNumber;
                if (address) teacher.address = address;
                await teacher.save();
            }
        }

        res.json({
            _id: updatedUser.id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            schoolId: updatedUser.schoolId,
            token: generateToken(updatedUser._id),
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
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

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        // Generate Token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 Hour

        await user.save();

        // Send Email
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a put request to: \n\n ${resetUrl}`;
        const html = `
            <h3>Password Reset Request</h3>
            <p>You requested a password reset. Please click the button below to set a new password:</p>
            <a href="${resetUrl}" style="background: #16a34a; color: white; padding: 10px 20px; text-decoration: none; borderRadius: 5px;">RESET PASSWORD</a>
        `;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset - GT-SchoolHub',
                message,
                html
            });
            res.status(200).json({ message: 'Reset instructions sent to email' });
        } catch (err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            return res.status(500).json({ message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const resetPassword = async (req, res) => {
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const user = await User.findOne({ verificationToken: req.params.token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verified successfully!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const getMe = async (req, res) => {
    try {
        let user = await User.findById(req.user._id)
            .select('-passwordHash')
            .populate('classId', 'name')
            .populate('schoolId')
            .populate('subjects.subjectId subjects.classId');

        if (!user) return res.status(404).json({ message: 'User found' });

        const userData = user.toObject();
        userData.isProfileSetup = user.schoolId?.isProfileSetup || false;
        userData.isEmailVerified = !!user.isEmailVerified;

        // Check if user is an HOD
        const Department = require('../models/Department');
        const departmentsManaged = await Department.find({ hodId: user._id });
        userData.isHod = departmentsManaged.length > 0;
        userData.managedDepartments = departmentsManaged.map(d => ({ _id: d._id, name: d.name }));

        // Enrichment for teachers: Merge from Teacher model
        if (user.role === 'teacher') {
            const Teacher = require('../models/Teacher');
            const teacher = await Teacher.findOne({ userId: user._id })
                .populate('teachingAssignments.subjectId teachingAssignments.classId');
            
            if (teacher) {
                userData.subjects = teacher.teachingAssignments;
                userData.phoneNumber = teacher.phoneNumber;
                userData.address = teacher.address;
                userData.profilePicture = teacher.profilePicture;
                userData.dateOfJoining = teacher.dateOfJoining;
                userData.qualification = teacher.qualification;
                userData.employmentType = teacher.employmentType;
                userData.yearsOfExperience = teacher.yearsOfExperience;
            }
        }

        if (user.role === 'student') {
            const Student = require('../models/Student');
            const student = await Student.findOne({ userId: user._id });
            if (student) {
                userData.studentProfileId = student._id;
                userData.studentId = student.studentId;
            }
        }

        res.status(200).json(userData);
    } catch (error) {
        console.error('Error in getMe:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerSchool,
    loginUser,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    verify2FA
};
