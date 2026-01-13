const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-passwordHash').populate('schoolId');

            // Enforce tenancy: ensure user belongs to the requested school (if derived from domain) or simply trusting the token's schoolId.
            // For MVP, the user object contains schoolId.
            
            if (!req.user) {
                 console.log('Protect Middleware: User not found');
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check School Verification (Skip for Super Admin)
            if (req.user.role !== 'super_admin') {
                if (!req.user.schoolId) {
                    console.log('Protect Middleware: No school ID');
                    return res.status(401).json({ message: 'User verification failed: No school associated.' });
                }
                if (req.user.schoolId.isVerified === false) {
                     console.log('Protect Middleware: School not verified');
                     return res.status(403).json({ 
                         message: 'School Pending Verification. Please contact support.',
                         code: 'SCHOOL_NOT_VERIFIED' 
                     });
                }
            }

            next();
        } catch (error) {
            console.error('Protect Middleware error:', error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        console.log('Protect Middleware: No token');
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin' || req.user.role === 'school_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

const teacher = (req, res, next) => {
    if (req.user && (req.user.role === 'teacher' || req.user.role === 'school_admin')) {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as a teacher' });
    }
};

const teacherStrict = (req, res, next) => {
    if (req.user && req.user.role === 'teacher') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized. Teachers only.' });
    }
};

module.exports = { protect, admin, teacher, teacherStrict };
