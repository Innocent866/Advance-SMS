const FeePayment = require('../models/FeePayment');
const Parent = require('../models/Parent');
const School = require('../models/School'); // For accessing paystack keys if stored there, or env

// @desc    Initialize Payment (Return Paystack Config/Key)
// @route   POST /api/payments/initialize
// --- Teacher Assignment ---
const initializePayment = async (req, res) => {
    const { amount, type, term, session, plan } = req.body;

    try {
        if (req.user.role === 'parent') {
            const parent = await Parent.findOne({ user: req.user._id });
            if (!parent) return res.status(404).json({ message: 'Parent not found' });

            // Generate a unique reference
            const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            if (!process.env.PAYSTACK_PUBLIC_KEY) {
                return res.status(500).json({ message: 'Server Configuration Error: Paystack Public Key not set.' });
            }

            // Check for School Subaccount
            const school = await School.findById(parent.school);
            let subaccount = null;
            if (school && school.paystackSubaccountCode) {
                subaccount = school.paystackSubaccountCode;
            }

            return res.json({
                key: process.env.PAYSTACK_PUBLIC_KEY,
                email: req.user.email,
                amount: amount * 100, // Paystack expects kobo
                reference,
                subaccount,
                metadata: {
                    studentId: parent.student,
                    parentId: parent._id,
                    schoolId: parent.school,
                    type: type || 'tuition',
                    term,
                    session,
                    amount: amount * 100
                }
            });
        } else if (req.user.role === 'school_admin' || req.user.role === 'super_admin') {
            // School Subscription Flow
            const schoolId = req.user.schoolId?._id || req.user.schoolId;
            const school = await School.findById(schoolId);
            if (!school) return res.status(404).json({ message: 'School not found' });

            // Determine amount based on plan if not provided (though frontend should provide it)
            let subAmount = amount;
            if (!subAmount && plan) {
                const subscriptionPlans = require('../config/subscriptionPlans');
                subAmount = subscriptionPlans[plan]?.price;
            }

            if (!subAmount) return res.status(400).json({ message: 'Amount or valid Plan required for subscription' });

            // For redirect flow (standard checkout), we call Paystack API
            const axios = require('axios');
            const reference = `SUB-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const response = await axios.post('https://api.paystack.co/transaction/initialize', {
                email: req.user.email,
                amount: subAmount * 100,
                reference,
                callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard/settings?tab=billing`,
                metadata: {
                    schoolId: school._id,
                    type: 'subscription',
                    plan: plan || 'Basic'
                }
            }, {
                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
            });

            return res.json(response.data.data);
        } else {
            return res.status(403).json({ message: 'Unauthorized to initialize payment' });
        }

    } catch (error) {
        console.error('Initialize Payment Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private (Parent)
const verifyPayment = async (req, res) => {
    const reference = req.body.reference || req.params.reference || req.query.reference;

    if (!reference) {
        return res.status(400).json({ message: 'Missing transaction reference' });
    }

    try {
        // 1. Verify with Paystack Server-side
        const axios = require('axios');
        const paystackRes = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
            }
        });

        if (paystackRes.data.status !== true || paystackRes.data.data.status !== 'success') {
            return res.status(400).json({ message: 'Payment verification failed with Paystack' });
        }

        const data = paystackRes.data.data;
        const metadata = data.metadata;

        // --- Handle Subscription Payment ---
        if (metadata?.type === 'subscription') {
            const schoolId = metadata.schoolId;
            const planName = metadata.plan;
            
            const subscriptionPlans = require('../config/subscriptionPlans');
            const plan = subscriptionPlans[planName];

            if (!plan) return res.status(400).json({ message: 'Invalid subscription plan' });

            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + (plan.duration || 90)); // Default 90 days/term

            const updatedSchool = await School.findByIdAndUpdate(schoolId, {
                'subscription.plan': planName,
                'subscription.status': 'active',
                'subscription.startDate': new Date(),
                'subscription.expiryDate': expiryDate,
                'subscription.lastPaymentReference': reference
            }, { new: true });

            return res.status(200).json({ message: 'Subscription activated', school: updatedSchool });
        }

        // --- Handle Fee Payment (Parent) ---
        // 2. Check if payment already recorded in our DB
        let existingPayment = await FeePayment.findOne({ reference });
        if (existingPayment) {
            if (existingPayment.status === 'success') {
                return res.status(200).json(existingPayment);
            }
        }

        // 3. Update School & Generate Receipt
        // Fallback: Retrieve parent context from DB if metadata is missing/incomplete
        const parent = await Parent.findOne({ user: req.user._id });
        
        const schoolId = metadata?.schoolId || parent?.school;
        const studentId = metadata?.studentId || parent?.student;
        const parentId = metadata?.parentId || parent?._id;

        if (!schoolId) return res.status(400).json({ message: 'School context not found for payment' });
        if (!studentId || !parentId) return res.status(400).json({ message: 'Incomplete student/parent profile for payment' });

        const school = await School.findByIdAndUpdate(
            schoolId,
            { $inc: { receiptCounter: 1 } },
            { new: true }
        );

        if (!school) return res.status(404).json({ message: 'School not found' });

        const year = new Date().getFullYear();
        const receiptSeq = school.receiptCounter.toString().padStart(5, '0');
        const receiptNumber = `RCP-${year}-${receiptSeq}`;

        const paymentData = {
            school: schoolId,
            student: studentId,
            parent: parentId,
            amount: data.amount / 100, // Kobo to Naira
            reference,
            receiptNumber,
            status: 'success',
            type: metadata?.type || 'tuition',
            term: metadata?.term,
            session: metadata?.session,
            paidAt: new Date(data.paid_at)
        };

        if (existingPayment) {
            Object.assign(existingPayment, paymentData);
            await existingPayment.save();
            return res.status(200).json(existingPayment);
        }

        const payment = await FeePayment.create(paymentData);
        res.status(201).json(payment);

    } catch (error) {
        console.error('Payment Verification Error:', error.response?.data || error.message);
        res.status(500).json({ message: 'Server error during payment verification' });
    }
};

// @desc    Get Payment History (Parent)
// @route   GET /api/payments/history
// @access  Private (Parent)
const getMyPaymentHistory = async (req, res) => {
    try {
        const parent = await Parent.findOne({ user: req.user._id });
        if (!parent) return res.status(404).json({ message: 'Parent not found' });

        const history = await FeePayment.find({ parent: parent._id }).sort({ createdAt: -1 });
        res.json(history);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Paystack Webhook
// @route   POST /api/webhooks/paystack
// @access  Public
const paystackWebhook = async (req, res) => {
    try {
        const crypto = require('crypto');
        const secret = process.env.PAYSTACK_SECRET_KEY || '';
        
        // If no secret, we can't verify, but don't crash.
        if (!secret) {
            console.warn('PAYSTACK_SECRET_KEY not set, skipping webhook verification');
            return res.status(200).send('Webhook received but not verified');
        }

        const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');

        if (hash === req.headers['x-paystack-signature']) {
            const event = req.body;
            if (event.event === 'charge.success') {
                console.log('Payment successful webhook:', event.data.reference);
                
                // Update payment status in DB if exists check
                const FeePayment = require('../models/FeePayment');
                const payment = await FeePayment.findOne({ reference: event.data.reference });
                if (payment) {
                    payment.status = 'success';
                    payment.paidAt = new Date();
                    await payment.save();
                }
            }
            res.status(200).send('OK');
        } else {
            res.status(400).send('Invalid Signature');
        }
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Server Error');
    }
};

// @desc    Get All Payments (Admin)
// @route   GET /api/payments/admin/all
// @access  Private (Admin)
const getAllPayments = async (req, res) => {
    try {
        const { session, term, status, search } = req.query;
        let query = {};
        
        // If school admin, filter by school
        if (req.user.role === 'school_admin' && req.user.schoolId) {
             query.school = req.user.schoolId._id || req.user.schoolId;
        }

        if (session) query.session = session;
        if (term) query.term = term;
        if (status && status !== 'All') query.status = status;

        // Search by reference or parent name (requires lookup) - for MVP just ref
        if (search) {
             query.reference = { $regex: search, $options: 'i' };
        }

        const payments = await FeePayment.find(query)
            .populate({
                path: 'student',
                select: 'firstName lastName studentId classId',
                populate: { path: 'classId', select: 'name' }
            })
            .populate({ 
                path: 'parent', 
                select: 'phone user',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ createdAt: -1 });

        res.json(payments);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Financial Stats (Admin)
// @route   GET /api/payments/admin/stats
// @access  Private (Admin)
const getFinancialStats = async (req, res) => {
    try {
        let matchStage = {};
         // If school admin, filter by school
         if (req.user.role === 'school_admin' && req.user.schoolId) {
            matchStage.school = req.user.schoolId._id || req.user.schoolId; // Ensure we use the ID, not the populated object
       }

       const stats = await FeePayment.aggregate([
           { $match: matchStage },
           {
               $group: {
                   _id: null,
                   totalRevenue: { 
                       $sum: { $cond: [{ $eq: ["$status", "success"] }, "$amount", 0] } 
                   },
                   totalTransactions: { $sum: 1 },
                   successfulTransactions: { 
                       $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] } 
                   },
                   pendingTransactions: { 
                    $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } 
                }
               }
           }
       ]);

       // Daily Income (Last 7 days)
       const last7Days = new Date();
       last7Days.setDate(last7Days.getDate() - 7);

       const dailyIncome = await FeePayment.aggregate([
        { 
            $match: { 
                ...matchStage, 
                status: 'success',
                paidAt: { $gte: last7Days }
            } 
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
                amount: { $sum: "$amount" }
            }
        },
        { $sort: { _id: 1 } }
       ]);

       res.json({
           overview: stats[0] || { totalRevenue: 0, totalTransactions: 0, successfulTransactions: 0, pendingTransactions: 0 },
           dailyIncome
       });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get List of Banks (Paystack)
// @route   GET /api/payments/banks
// @access  Private (Admin)
const getBanks = async (req, res) => {
    try {
        const axios = require('axios');
        const response = await axios.get('https://api.paystack.co/bank', {
            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
        });
        res.json(response.data.data);
    } catch (error) {
        console.error('Error fetching banks:', error.message);
        res.status(500).json({ message: 'Error fetching bank list' });
    }
};


module.exports = {
    initializePayment,
    verifyPayment,
    getMyPaymentHistory,
    paystackWebhook,
    getAllPayments,
    getFinancialStats,
    getBanks
};
