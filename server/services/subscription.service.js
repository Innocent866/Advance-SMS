const School = require('../models/School');
const Payment = require('../models/Payment');

// Plan Definitions
const PLANS = {
    'Basic': { price: 50000, duration: 90, maxStudents: 300, maxTeachers: 40 }, // 50k / Term (3 Months)
    'Standard': { price: 100000, duration: 90, maxStudents: 700, maxTeachers: 70 }, // 100k / Term
    'Premium': { price: 200000, duration: 90, maxStudents: 1500, maxTeachers: 200 } // 200k / Term
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
    // Use findByIdAndUpdate to ensure atomic update and avoid potential schema validation issues with replacing object
    const updatedSchool = await School.findByIdAndUpdate(schoolId, {
        $set: {
            'subscription.plan': planName,
            'subscription.status': 'active',
            'subscription.startDate': newStartDate,
            'subscription.expiryDate': newExpiryDate,
            'subscription.paymentRef': reference,
            'subscription.maxStudents': planDetails.maxStudents,
            'subscription.maxTeachers': planDetails.maxTeachers
        }
    }, { new: true, runValidators: true });

    if (!updatedSchool) throw new Error('School update failed');

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

    return updatedSchool.subscription;
};

module.exports = {
    activateSubscription,
    PLANS
};
