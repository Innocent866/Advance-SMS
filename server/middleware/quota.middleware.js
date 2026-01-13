const School = require('../models/School');

// Limits in Bytes
const PLAN_LIMITS = {
    'Free': 100 * 1024 * 1024,      // 100 MB
    'Basic': 1 * 1024 * 1024 * 1024, // 1 GB
    'Standard': 5 * 1024 * 1024 * 1024, // 5 GB
    'Premium': 20 * 1024 * 1024 * 1024 // 20 GB
};

const checkQuota = async (req, res, next) => {
    try {
        // req.school is populated by checkSubscription middleware
        const school = req.school;

        if (!school) {
             return res.status(404).json({ message: 'School Context Missing' });
        }

        const plan = school.subscription.plan || 'Free';
        const limit = PLAN_LIMITS[plan];
        const currentUsage = school.mediaUsage.storageBytes || 0;

        // Check if limit exceeded (Pre-check, ideally we check +fileSize but we don't know it yet exactly)
        // Cloudinary upload happens via Multer BEFORE controller, but Middleware runs BEFORE Multer?
        // NO, Multer runs as middleware. We must run this BEFORE Multer.
        
        if (currentUsage >= limit) {
             return res.status(403).json({ 
                 message: `Storage Quota Exceeded for ${plan} Plan. (${(currentUsage/1024/1024).toFixed(2)}MB / ${(limit/1024/1024).toFixed(0)}MB)`,
                 reason: 'quota_exceeded'
             });
        }

        next();

    } catch (error) {
        console.error('Quota Check Error:', error);
        res.status(500).json({ message: 'Server Error during Quota Check' });
    }
};

module.exports = { checkQuota, PLAN_LIMITS };
