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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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

        res.json({ message: 'School verified successfully', school });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
