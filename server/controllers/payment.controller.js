const Payment = require('../models/Payment');
const { initializeTransaction, verifyTransaction } = require('../services/paystack.service');
const { activateSubscription, PLANS } = require('../services/subscription.service');
const crypto = require('crypto');

// @desc    Initialize Payment
// @route   POST /api/payments/initialize
// @access  Private (School Admin)
const initializePayment = async (req, res) => {
    const { plan } = req.body;
    const schoolId = req.user.schoolId;
    const email = req.user.email;

    if (!PLANS[plan]) {
        return res.status(400).json({ message: 'Invalid Plan' });
    }

    const amount = PLANS[plan].price;

    try {
        const paymentData = {
            email,
            amount: amount, 
            callback_url: 'http://localhost:5173/settings', // Adjust for prod
            metadata: {
                schoolId,
                plan
            }
        };

        const paystackResponse = await initializeTransaction(paymentData);

        // Store Pending Payment
        await Payment.create({
            schoolId,
            amount,
            reference: paystackResponse.data.reference,
            status: 'pending',
            plan,
            currency: 'NGN'
        });

        res.json({
            authorization_url: paystackResponse.data.authorization_url,
            reference: paystackResponse.data.reference
        });

    } catch (error) {
        console.error('Paystack Init Error:', error.response?.data || error.message);
        res.status(500).json({ 
            message: error.response?.data?.message || 'Payment initialization failed',
            details: error.message 
        });
    }
};

// @desc    Verify Payment
// @route   GET /api/payments/verify/:reference
// @access  Private
const verifyPayment = async (req, res) => {
    const { reference } = req.params;

    try {
        // 1. Verify with Paystack
        const response = await verifyTransaction(reference);
        const data = response.data;

        // 2. Strict Checks
        if (data.status !== 'success') {
            await Payment.findOneAndUpdate({ reference }, { status: 'failed' });
            return res.status(400).json({ message: 'Transaction failed or incomplete' });
        }

        const payment = await Payment.findOne({ reference });
        if (!payment) return res.status(404).json({ message: 'Payment record not found' });

        if (payment.status === 'success') {
            return res.json({ message: 'Payment already verified', status: 'success' });
        }

        // Strict Amount Check
        if (data.amount !== payment.amount) {
            return res.status(400).json({ message: 'Amount mismatch', expected: payment.amount, paid: data.amount });
        }
        if (data.currency !== 'NGN') {
            return res.status(400).json({ message: 'Invalid currency' });
        }

        // 3. Activate Subscription
        console.log('Activating Subscription for:', { 
            schoolId: payment.schoolId, 
            plan: payment.plan, 
            ref: reference 
        });

        await activateSubscription(
            payment.schoolId,
            payment.plan,
            data.amount,
            reference
        );

        res.json({ status: 'success', message: 'Subscription activated successfully' });

    } catch (error) {
        console.error('Verification Error:', error);
        if (error.message.includes('School not found')) {
             return res.status(404).json({ message: 'School record no longer exists. Cannot verify.', details: error.message });
        }
        res.status(500).json({ message: 'Verification failed', details: error.message });
    }
};

// @desc    Paystack Webhook
// @route   POST /api/webhooks/paystack
// @access  Public
const paystackWebhook = async (req, res) => {
    try {
        const secret = process.env.PAYSTACK_SECRET_KEY;
        // Validate Signature
        const hash = crypto.createHmac('sha512', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== req.headers['x-paystack-signature']) {
             return res.status(400).send('Invalid Signature');
        }

        const event = req.body;

        if (event.event === 'charge.success') {
            const { reference, metadata, amount } = event.data;
            const { schoolId, plan } = metadata;

            // Idempotency
            const existingPayment = await Payment.findOne({ reference });
            if (existingPayment && existingPayment.status === 'success') {
                return res.status(200).send('Event already processed');
            }

            // Activate
            if (schoolId && plan) {
                await activateSubscription(schoolId, plan, amount, reference);
            }
        }

        res.status(200).send('Webhook Received');
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    initializePayment,
    verifyPayment,
    paystackWebhook
};
