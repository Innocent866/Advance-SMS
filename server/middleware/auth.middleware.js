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
                 return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            // Check School Verification (Skip for Super Admin)
            if (req.user.role !== 'super_admin') {
                if (!req.user.schoolId) {
                    return res.status(401).json({ message: 'User verification failed: No school associated.' });
                }
                if (req.user.schoolId.isVerified === false) {
                     return res.status(403).json({ 
                         message: 'School Pending Verification. Please contact support.',
                         code: 'SCHOOL_NOT_VERIFIED' 
                     });
                }
            }

            next();
        } catch (error) {
            console.error('Auth Error:', error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        if (role === 'admin' || role === 'super_admin' || role === 'school_admin' || role === 'assistant_admin') {
            return next();
        }
    }
    res.status(401).json({ message: 'Not authorized as an admin' });
};

const teacher = (req, res, next) => {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        if (role === 'teacher' || role === 'school_admin') {
            return next();
        }
    }
    res.status(401).json({ message: 'Not authorized as a teacher' });
};

const teacherStrict = (req, res, next) => {
    if (req.user && req.user.role) {
        const role = req.user.role.toLowerCase();
        if (role === 'teacher') {
            return next();
        }
    }
    res.status(401).json({ message: 'Not authorized. Teachers only.' });
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ 
                message: `User role ${req.user ? req.user.role : 'unknown'} is not authorized to access this route` 
            });
        }
        next();
    };
};

module.exports = { protect, admin, teacher, teacherStrict, authorize };
