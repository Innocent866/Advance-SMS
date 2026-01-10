const School = require('../models/School');
const Payment = require('../models/Payment');

// Plan Definitions
const PLANS = {
    'Basic': { price: 200000, duration: 30, maxStudents: 200, maxTeachers: 10 }, // 2k
    'Standard': { price: 500000, duration: 30, maxStudents: 500, maxTeachers: 25 }, // 5k
    'Premium': { price: 1500000, duration: 30, maxStudents: 2000, maxTeachers: 100 } // 15k
};

const activateSubscription = async (schoolId, planName, amount, reference) => {
    // 1. Validate Plan
    const planDetails = PLANS[planName];
    if (!planDetails) throw new Error('Invalid Plan');

    // 2. Fetch School to check current status
    console.log('Subscription Service received schoolId:', schoolId);
    const school = await School.findById(schoolId);
    if (!school) throw new Error('School not found in database. It might have been deleted.');

    // 3. Calculate New Dates
    const now = new Date();
    let newStartDate = now;
    let newExpiryDate = new Date();

    // Logic: If currently active and same plan, extend. Else, reset.
    if (school.subscription.status === 'active' && school.subscription.plan === planName && school.subscription.expiryDate > now) {
        // Extend
        newStartDate = school.subscription.startDate; // Keep original start
        newExpiryDate = new Date(school.subscription.expiryDate);
        newExpiryDate.setDate(newExpiryDate.getDate() + planDetails.duration);
    } else {
        // New / Renew from expired / Upgrade
        newStartDate = now;
        newExpiryDate.setDate(now.getDate() + planDetails.duration);
    }

    // 4. Update School
    school.subscription = {
        plan: planName,
        status: 'active',
        startDate: newStartDate,
        expiryDate: newExpiryDate,
        paymentRef: reference,
        maxStudents: planDetails.maxStudents,
        maxTeachers: planDetails.maxTeachers
    };
    await school.save();

    // 5. Update Payment
    await Payment.findOneAndUpdate(
        { reference },
        { 
            status: 'success', 
            paidAt: now,
            plan: planName,
            amount // Confirm amount stored
        }
    );

    return school.subscription;
};

module.exports = {
    activateSubscription,
    PLANS
};
