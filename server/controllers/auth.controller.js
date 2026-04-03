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
            <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                        <img src="https://res.cloudinary.com/dponb9mg9/image/upload/v1775216580/GT_SchoolHub/general/logo_u3c2l8.png" alt="GT-SchoolHub Logo" style="width: 80px; height: 80px; border-radius: 20px; background: white; padding: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">GT-SchoolHub</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #111827;">Confirm your email address</h2>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">Hello <strong>${adminName}</strong>,</p>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">Thank you for joining <strong>GT-SchoolHub</strong>. We're excited to help you transform your school's management experience. To get started, please verify your email address by clicking the button below.</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${verifyUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 700; font-size: 16px; padding: 16px 40px; text-decoration: none; border-radius: 12px; transition: all 0.3s ease; box-shadow: 0 4px 14px 0 rgba(22, 163, 74, 0.39);">
                                Verify Email Address
                            </a>
                        </div>
                        
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #9ca3af; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:</p>
                        <div style="padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #16a34a; word-break: break-all; text-align: center;">
                            ${verifyUrl}
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #111827;">GT-SchoolHub Team</p>
                        <p style="margin: 0 0 20px 0; font-size: 12px; color: #9ca3af;">Empowering Education through Innovation</p>
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                                &copy; ${new Date().getFullYear()} GT-SchoolHub. All rights reserved.<br>
                                You received this email because you signed up for a GT-SchoolHub account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        /*
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
        */

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
                <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; line-height: 1.6;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                        <!-- Header -->
                        <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                            <img src="https://res.cloudinary.com/dponb9mg9/image/upload/v1775216580/GT_SchoolHub/general/logo_u3c2l8.png" alt="GT-SchoolHub Logo" style="width: 80px; height: 80px; border-radius: 20px; background: white; padding: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">GT-SchoolHub</h1>
                        </div>
                        
                        <!-- Content -->
                        <div style="padding: 40px;">
                            <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #111827; text-align: center;">Login Verification</h2>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; text-align: center;">Hello <strong>${user.name}</strong>,</p>
                            <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563; text-align: center;">You are attempting to sign in to your GT-SchoolHub account. Please use the verification code below to complete your login:</p>
                            
                            <div style="background: #f9fafb; padding: 30px; text-align: center; border-radius: 12px; border: 2px dashed #e5e7eb; margin: 30px 0;">
                                <div style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #16a34a; font-family: monospace;">
                                    ${otpCode}
                                </div>
                            </div>
                            
                            <p style="margin: 0; font-size: 14px; color: #9ca3af; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not attempt to sign in, please secure your account immediately.</p>
                        </div>
                        
                        <!-- Footer -->
                        <div style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #111827;">GT-SchoolHub Security</p>
                            <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                                &copy; ${new Date().getFullYear()} GT-SchoolHub. All rights reserved.<br>
                                This is a secure automated message. Please do not reply.
                            </p>
                        </div>
                    </div>
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
            <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                    <!-- Header -->
                    <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                        <img src="https://res.cloudinary.com/dponb9mg9/image/upload/v1775216580/GT_SchoolHub/general/logo_u3c2l8.png" alt="GT-SchoolHub Logo" style="width: 80px; height: 80px; border-radius: 20px; background: white; padding: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">GT-SchoolHub</h1>
                    </div>
                    
                    <!-- Content -->
                    <div style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #111827;">Password Reset Request</h2>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">Hello <strong>${user.name}</strong>,</p>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">You are receiving this email because we received a request to reset the password for your account. Please click the button below to set a new password:</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${resetUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 700; font-size: 16px; padding: 16px 40px; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 14px 0 rgba(22, 163, 74, 0.39);">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #9ca3af; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:</p>
                        <div style="padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #16a34a; word-break: break-all; text-align: center;">
                            ${resetUrl}
                        </div>
                        
                        <p style="margin: 30px 0 0 0; font-size: 14px; color: #6b7280; text-align: center;">If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
                    </div>
                    
                    <!-- Footer -->
                    <div style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #111827;">GT-SchoolHub Team</p>
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                                &copy; ${new Date().getFullYear()} GT-SchoolHub. All rights reserved.<br>
                                This is a secure automated message.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
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
