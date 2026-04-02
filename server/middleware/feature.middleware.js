/**
 * Feature Control Middleware
 * Blocks access to specific modules if they are disabled for the school
 */

const checkFeature = (featureName) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, no user data' });
        }

        // Super admins bypass all feature checks (case-insensitive)
        if (req.user.role && req.user.role.toLowerCase() === 'super_admin') {
            return next();
        }

        const schoolFeatures = req.user.schoolId?.features;

        // Only block if the feature is explicitly disabled (set to false).
        // If the features object is missing or the key doesn't exist, default to ALLOW.
        // This handles schools set up before the feature toggle system was introduced.
        if (schoolFeatures && schoolFeatures[featureName] === false) {
            return res.status(403).json({
                message: `The ${featureName.replace(/([A-Z])/g, ' $1').toLowerCase()} feature is currently disabled for your school.`,
                code: 'FEATURE_DISABLED',
                feature: featureName
            });
        }

        next();
    };
};

module.exports = { checkFeature };
