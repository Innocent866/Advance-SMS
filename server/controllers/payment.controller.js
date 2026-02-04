const FeePayment = require('../models/FeePayment');
const Parent = require('../models/Parent');
const School = require('../models/School'); // For accessing paystack keys if stored there, or env

// @desc    Initialize Payment (Return Paystack Config/Key)
// @route   POST /api/payments/initialize
// @access  Private (Parent)
const initializePayment = async (req, res) => {
    const { amount, type, term, session } = req.body;

    try {
        const parent = await Parent.findOne({ user: req.user._id });
        if (!parent) return res.status(404).json({ message: 'Parent not found' });

        // Generate a unique reference
        const reference = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // Provide Paystack public key (from Env)
        // In a real flow, you might initialize transaction via server-side Paystack API to get auth_url.
        // For simpler integration, we'll return config for the frontend Inline Popup.
        
        if (!process.env.PAYSTACK_PUBLIC_KEY) {
            return res.status(500).json({ message: 'Server Configuration Error: Paystack Public Key not set.' });
        }

        // Check for School Subaccount
        const school = await School.findById(parent.school);
        let subaccount = null;
        if (school && school.paystackSubaccountCode) {
            subaccount = school.paystackSubaccountCode;
        }

        res.json({
            key: process.env.PAYSTACK_PUBLIC_KEY,
            email: req.user.email,
            amount: amount * 100, // Paystack expects kobo
            reference,
            subaccount, // Pass subaccount code to frontend config
            metadata: {
                studentId: parent.student,
                parentId: parent._id,
                schoolId: parent.school,
                type,
                term,
                session,
                amount: amount * 100
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify Payment
// @route   POST /api/payments/verify
// @access  Private (Parent)
const verifyPayment = async (req, res) => {
    const { reference, status, metadata } = req.body;
    
    // Start session for transaction if replica set available, else simple update
    // For this environment, we'll assume simple atomic updates or use findByIdAndUpdate where possible.
    
    try {
        if (status === 'success') {
            const parent = await Parent.findOne({ user: req.user._id });
            if (!parent) return res.status(404).json({ message: 'Parent not found' });
            
            // Check if payment already exists
            let existingPayment = await FeePayment.findOne({ reference });
            if (existingPayment) {
                 if (existingPayment.status === 'success') {
                     return res.status(200).json(existingPayment);
                 }
                // If it was pending, we update it
            }

            // Get School to increment counter
            const school = await School.findByIdAndUpdate(
                parent.school, 
                { $inc: { receiptCounter: 1 } }, 
                { new: true }
            );
            
            if (!school) return res.status(404).json({ message: 'School not found' });
            
            // Generate Receipt Number
            const year = new Date().getFullYear();
            // Format: REF-{YEAR}-{0000}
            const receiptSeq = school.receiptCounter.toString().padStart(5, '0');
            const receiptNumber = `RCP-${year}-${receiptSeq}`;

            const paidAmount = req.body.amount || (metadata && metadata.amount) || 0;

            const paymentData = {
                school: parent.school,
                student: parent.student,
                parent: parent._id,
                amount: paidAmount / 100, // Kobo to Naira
                reference,
                receiptNumber,
                status: 'success',
                type: metadata?.type || 'tuition',
                term: metadata?.term,
                session: metadata?.session,
                paidAt: new Date()
            };

            // If existing payment (pending), update it, else create new
            if (existingPayment) {
                existingPayment.status = 'success';
                existingPayment.paidAt = new Date();
                existingPayment.receiptNumber = receiptNumber;
                await existingPayment.save();
                return res.status(200).json(existingPayment);
            }

            const payment = await FeePayment.create(paymentData);
            return res.status(201).json(payment);

        } else {
             // Handle failed/cancelled
             return res.status(400).json({ message: 'Payment not successful' });
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
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
    paystackWebhook,
    getAllPayments,
    getFinancialStats,
    getBanks
};
