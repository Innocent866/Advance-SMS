const School = require('../models/School');

const checkSubscription = async (req, res, next) => {
    try {
        // Assume req.user is set by auth middleware
        if (!req.user || !req.user.schoolId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Allow Admins to bypass? No, strict check for features.
        // But Admins need to access Settings/Billing even if expired.
        // This middleware should be applied to specific routes (AI, Videos, etc.), not Global.

        const school = await School.findById(req.user.schoolId);

        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }

        // Check Status
        const sub = school.subscription || { status: 'active', plan: 'Free' }; // Fallback for legacy/free
        
        if (sub.status !== 'active') {
             return res.status(403).json({ 
                 message: 'Subscription Inactive. Please contact your school administrator to renew.',
                 reason: 'inactive_subscription'
             });
        }

        // Check Expiry (if not 'Free' perhaps, but Free logic is handled by status='active' usually)
        // If Plan is NOT Free and date is passed
        if (sub.plan !== 'Free' && sub.expiryDate) {
            const now = new Date();
            if (now > sub.expiryDate) {
                 return res.status(403).json({ 
                     message: 'Subscription Expired. Please renew to access this feature.',
                     reason: 'expired_subscription' 
                 });
            }
        }

        req.school = school; // Pass school down
        next();

    } catch (error) {
        console.error('Subscription Check Error:', error);
        res.status(500).json({ message: 'Server Error during Subscription Check' });
    }
};

module.exports = { checkSubscription };
