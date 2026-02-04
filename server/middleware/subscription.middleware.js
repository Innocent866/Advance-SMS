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
            // Use stored limit in DB (preferred) or fallback to config
            const maxLimit = school.subscription[`max${resourceType === 'Teacher' ? 'Teachers' : 'Students'}`] 
                             || subscriptionPlans[currentPlan][`max${resourceType === 'Teacher' ? 'Staff' : 'Students'}`];

            let currentCount = 0;
            if (resourceType === 'Student') {
                currentCount = await Student.countDocuments({ schoolId: userSchoolId });
            } else if (resourceType === 'Teacher') {
                currentCount = await Teacher.countDocuments({ schoolId: userSchoolId });
            }

            if (currentCount >= maxLimit) {
                 return res.status(403).json({ 
                    message: `Limit Reached: You have reached the maximum number of ${resourceType}s (${maxLimit}) for your ${currentPlan} plan. Please upgrade to add more.` 
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
