const School = require('../models/School');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all schools (filtering by verified status)
// @route   GET /api/superadmin/schools
// @access  Private (Super Admin)
const getSchools = async (req, res) => {
    try {
        const { verified } = req.query;
        let query = {};
        
        if (verified !== undefined) {
             query.isVerified = verified === 'true';
        }

        const schools = await School.find(query).sort({ createdAt: -1 });
        res.json(schools);
    } catch (error) {
        console.error('[getSchools Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Verify a school
// @route   PUT /api/superadmin/verify-school/:id
// @access  Private (Super Admin)
const verifySchool = async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        if (!school) return res.status(404).json({ message: 'School not found' });

        school.isVerified = true;
        await school.save();

        // Auto-verify the school admin's email when the school is approved
        await User.updateMany(
            { schoolId: school._id, role: 'school_admin' },
            { isEmailVerified: true }
        );

        // Fetch School Admin details for personalization
        const adminUser = await User.findOne({ schoolId: school._id, role: 'school_admin' });
        const adminName = adminUser ? adminUser.name : 'School Administrator';

        // Send confirmation email to school admin
        const sendEmail = require('../utils/emailService');
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const loginUrl = `${frontendUrl}/login`;

        const message = `Congratulations! Your school account for ${school.name} has been verified. You can now log in and start managing your school.`;
        const html = `
            <div style="background-color: #f3f4f6; padding: 40px 20px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #374151; line-height: 1.6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">
                    <!-- Header with Gradient -->
                    <div style="padding: 40px 20px; text-align: center; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);">
                        <img src="https://res.cloudinary.com/dponb9mg9/image/upload/v1775216580/GT_SchoolHub/general/logo_u3c2l8.png" alt="GT-SchoolHub Logo" style="width: 80px; height: 80px; border-radius: 20px; background: white; padding: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h1 style="margin: 20px 0 0 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.025em;">GT-SchoolHub</h1>
                    </div>
                    
                    <!-- Content Body -->
                    <div style="padding: 40px;">
                        <h2 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; color: #111827;">School Account Verified!</h2>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">Hello <strong>${adminName}</strong>,</p>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">We are pleased to inform you that your school account for <strong>${school.name}</strong> has been successfully verified by our team.</p>
                        <p style="margin: 0 0 24px 0; font-size: 16px; color: #4b5563;">You can now access your dashboard to begin setting up your staff, students, and academic configurations. Welcome to our community!</p>
                        
                        <div style="text-align: center; margin: 40px 0;">
                            <a href="${loginUrl}" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 700; font-size: 16px; padding: 16px 40px; text-decoration: none; border-radius: 12px; transition: all 0.3s ease; box-shadow: 0 4px 14px 0 rgba(22, 163, 74, 0.39);">
                                Sign In to Dashboard
                            </a>
                        </div>
                        
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #9ca3af; text-align: center;">If the button above doesn't work, copy and paste this link into your browser:</p>
                        <div style="padding: 12px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; font-size: 12px; color: #16a34a; word-break: break-all; text-align: center;">
                            ${loginUrl}
                        </div>
                    </div>
                    
                    <!-- Footer Section -->
                    <div style="padding: 30px 40px; background-color: #f9fafb; border-top: 1px solid #f3f4f6; text-align: center;">
                        <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #111827;">GT-SchoolHub Team</p>
                        <p style="margin: 0 0 20px 0; font-size: 12px; color: #9ca3af;">Innovating Education Management</p>
                        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px;">
                            <p style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.5;">
                                &copy; ${new Date().getFullYear()} GT-SchoolHub. All rights reserved.<br>
                                This is an automated message regarding your institution account.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Determine recipient (Admin account email preferred, fallback to school contactEmail)
        const recipientEmail = adminUser?.email || school.contactEmail;

        try {
            await sendEmail({
                email: recipientEmail,
                subject: 'School Account Verified - GT-SchoolHub',
                message,
                html
            });
            console.log(`[Email Service]: Verification email dispatched to ${recipientEmail}`);
        } catch (err) {
            console.error(`[Email Service Error]: Failed to send verification email to ${recipientEmail}:`, err.message);
        }

        res.json({ message: 'School verified successfully and notification sent.', school });
    } catch (error) {
        console.error('[verifySchool Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create Super Admin (Seed/Manual)
// @route   POST /api/superadmin/create
// @access  Public (Should be protected or removed in prod)
// Helper to bootstrap the first super admin if needed
const createSuperAdmin = async (req, res) => {
    // Implementation skipped for now, assuming manual seed or existing mechanism
    res.status(501).json({ message: 'Not implemented' });
};

const Payment = require('../models/Payment');

// @desc    Get Platform Stats
// @route   GET /api/superadmin/stats
// @access  Private (Super Admin)
const getPlatformStats = async (req, res) => {
    try {
        const totalSchools = await School.countDocuments();
        const totalUsers = await User.countDocuments();
        
        // Revenue
        const successfulPayments = await Payment.find({ status: 'success' });
        const totalRevenue = successfulPayments.reduce((acc, curr) => acc + (curr.amount || 0), 0);

        const verifiedSchools = await School.countDocuments({ isVerified: true });
        const pendingSchools = await School.countDocuments({ isVerified: false });

        res.json({
            totalSchools,
            totalUsers,
            totalRevenue,
            verifiedSchools,
            pendingSchools
        });
    } catch (error) {
        console.error('[getPlatformStats Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get All Payments
// @route   GET /api/superadmin/payments
// @access  Private (Super Admin)
const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('schoolId', 'name contactEmail')
            .sort({ createdAt: -1 })
            .limit(100); // Limit to last 100 for now
        res.json(payments);
    } catch (error) {
        console.error('[getAllPayments Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a school (and all associated data)
// @route   DELETE /api/superadmin/schools/:id
// @access  Private (Super Admin)
const deleteSchool = async (req, res) => {
    try {
        const schoolId = req.params.id;
        const school = await School.findById(schoolId);
        
        if (!school) return res.status(404).json({ message: 'School not found' });

        // Check for Super Admin presence
        const superAdmins = await User.find({ schoolId, role: 'super_admin' });
        if (superAdmins.length > 0) {
            return res.status(403).json({ 
                message: 'CRITICAL: Cannot delete this school because it contains Super Admin accounts. This is the System School.' 
            });
        }

        // Delete all users associated with school
        await User.deleteMany({ schoolId });
        
        // Delete school
        await School.findByIdAndDelete(schoolId);

        res.json({ message: 'School and associated data deleted successfully' });
    } catch (error) {
        console.error('[deleteSchool Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update School Plan manually
// @route   PUT /api/superadmin/schools/:id/subscription
// @access  Private (Super Admin)
const updateSchoolSubscription = async (req, res) => {
    try {
        const { plan, status, expiryDate } = req.body;
        const school = await School.findById(req.params.id);
        
        if (!school) return res.status(404).json({ message: 'School not found' });

        // Update Plan & Sync Limits
        if (plan) {
            if (!school.subscription) school.subscription = {};
            school.subscription.plan = plan;
            
            // Sync Limits from Config
            const plans = require('../config/subscriptionPlans'); // Or import at top
            const planConfig = plans[plan];
            
            if (planConfig) {
                school.subscription.maxStudents = planConfig.maxStudents;
                school.subscription.maxTeachers = planConfig.maxStaff; // Note: config uses 'maxStaff', schema uses 'maxTeachers'
            }
        }

        if (status) school.subscription.status = status;
        if (expiryDate) school.subscription.expiryDate = expiryDate;

        await school.save();

        res.json({ message: 'Subscription updated', school });
    } catch (error) {
        console.error('[updateSchoolSubscription Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create School Manually (Auto-verified)
// @route   POST /api/superadmin/schools
// @access  Private (Super Admin)
const createSchool = async (req, res) => {
    const { schoolName, schoolEmail, adminName, adminEmail, password } = req.body;
    
    // Simple verification
    if (!schoolName || !schoolEmail || !adminName || !adminEmail || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    try {
        // Check if school exists
        const schoolExists = await School.findOne({ contactEmail: schoolEmail });
        if (schoolExists) return res.status(400).json({ message: 'School already exists' });

        // Check if user exists
        const userExists = await User.findOne({ email: adminEmail });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Create School (Verified)
        const school = await School.create({
            name: schoolName,
            contactEmail: schoolEmail,
            isVerified: true // Auto-verify since SupAdmin created it
        });

        // Hash Password
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
            message: 'School and Admin created successfully',
            school,
            user: { _id: user.id, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error('[createSchool Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update School Details (Name, Contact)
// @route   PUT /api/superadmin/schools/:id/details
// @access  Private (Super Admin)
const updateSchoolDetails = async (req, res) => {
    try {
        const { name, contactEmail } = req.body;
        const schoolId = req.params.id;

        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ message: 'School not found' });

        if (name) school.name = name;
        if (contactEmail) school.contactEmail = contactEmail;

        await school.save();

        res.json({ message: 'School details updated successfully', school });
    } catch (error) {
        console.error('[updateSchoolDetails Error]:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getSchools,
    verifySchool,
    getPlatformStats,
    getAllPayments,
    deleteSchool,
    updateSchoolSubscription,
    createSchool,
    updateSchoolDetails
};
