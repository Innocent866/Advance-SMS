const School = require('../models/School');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const subscriptionPlans = require('../config/subscriptionPlans');

// Check if school has access to a specific feature
const checkFeatureAccess = (featureName) => {
    return async (req, res, next) => {
        try {
            const userSchoolId = req.user.schoolId._id || req.user.schoolId;
            const school = await School.findById(userSchoolId);

            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }

            const currentPlan = school.subscription.plan || 'Free';
            const planConfig = subscriptionPlans[currentPlan];

            if (!planConfig || !planConfig.features.includes(featureName)) {
                return res.status(403).json({ 
                    message: `Upgrade Required: The '${featureName}' feature is not available on your current (${currentPlan}) plan.` 
                });
            }

            next();
        } catch (error) {
            console.error('Subscription Check Error:', error);
            res.status(500).json({ message: 'Server error checking subscription' });
        }
    };
};

// Check if school has reached its resource limit (Students/Teachers)
const checkResourceLimit = (resourceType) => {
    return async (req, res, next) => {
        try {
            const userSchoolId = req.user.schoolId._id || req.user.schoolId;
            const school = await School.findById(userSchoolId);

            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }

            const currentPlan = school.subscription.plan || 'Free';
            
            let maxLimit = 0;
            let currentCount = 0;
            
            // Normalize resourceType to lowercase plural for key lookup (Student -> students, Teacher -> teachers)
            const typeKey = resourceType.toLowerCase() + 's';
            
            // Check School defined limit (mediaUsage/resourceLimits) first, then Plan default
            if (school.mediaUsage && school.mediaUsage[typeKey]) {
                maxLimit = school.mediaUsage[typeKey];
            } else if (school.subscription && school.subscription['max' + resourceType + 's']) {
                // Fallback to old subscription fields if present
                maxLimit = school.subscription['max' + resourceType + 's'];
            } else {
                 // Fallback to Plan Config
                 const map = { 'Student': 'maxStudents', 'Teacher': 'maxStaff', 'Nurse': 'maxStaff', 'Doctor': 'maxStaff' };
                 maxLimit = subscriptionPlans[currentPlan][map[resourceType]] || 5; 
            }

            if (resourceType === 'Student') {
                currentCount = await Student.countDocuments({ schoolId: userSchoolId });
            } else if (resourceType === 'Teacher') {
                currentCount = await Teacher.countDocuments({ schoolId: userSchoolId });
            } else if (resourceType === 'Nurse') {
                const Nurse = require('../models/Nurse');
                currentCount = await Nurse.countDocuments({ schoolId: userSchoolId });
            } else if (resourceType === 'Doctor') {
                const Doctor = require('../models/Doctor');
                currentCount = await Doctor.countDocuments({ schoolId: userSchoolId });
            }

            if (currentCount >= maxLimit) {
                 return res.status(403).json({ 
                    message: `Limit Reached: You have reached the maximum number of ${resourceType}s (${maxLimit}) for your usage tier. Please upgrade.` 
                });
            }

            next();
        } catch (error) {
             console.error('Limit Check Error:', error);
            res.status(500).json({ message: 'Server error checking limits' });
        }
    };
};

const checkSubscription = async (req, res, next) => {
    try {
        const userSchoolId = req.user.schoolId._id || req.user.schoolId;
        const school = await School.findById(userSchoolId);

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Check if subscription is active or within grace period
        // For now, we assume if a plan exists, it's valid, unless status is strictly 'cancelled' or 'expired'
        // You might want to add more strict checks here based on your 'status' field in subscription
        if (school.subscription.status === 'expired' || school.subscription.status === 'cancelled') {
             return res.status(403).json({ message: 'Subscription is not active. Please renew your plan.' });
        }

        req.school = school;
        next();
    } catch (error) {
        console.error('Subscription Check Error:', error);
        res.status(500).json({ message: 'Server error checking subscription' });
    }
};

module.exports = {
    checkFeatureAccess,
    checkResourceLimit,
    checkSubscription
};
