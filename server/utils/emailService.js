const { Resend } = require('resend');

// Private Resend Singleton (Lazy)
let _resend = null;

/**
 * Initialize Resend lazily to ensure environment variables are ready.
 */
const getResend = () => {
    if (_resend) return _resend;

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        console.error('CRITICAL: RESEND_API_KEY missing in process.env!');
        return null;
    }

    try {
        _resend = new Resend(apiKey);
        console.log('✅ Resend API Client Initialized Successfully');
        return _resend;
    } catch (err) {
        console.error('Failed to initialize Resend:', err.message);
        return null;
    }
};

/**
 * Send an email using Resend HTTP API (Bypasses SMTP port blocks)
 * @param {Object} options - Email options
 */
const sendEmail = async (options) => {
    const resend = getResend();

    if (!resend) {
        console.warn('--- MOCK EMAIL FALLBACK ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('---------------------------');
        return;
    }

    try {
        // NOTE: Resend's free tier requires 'from' to be 'onboarding@resend.dev' 
        // until you verify your own domain.
        const { data, error } = await resend.emails.send({
            from: 'GT-SchoolHub <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html,
        });

        if (error) {
            console.error('CRITICAL: Resend Delivery Failed!', error.message);
            throw new Error(error.message);
        }

        console.log('Message sent successfully via Resend API: %s', data.id);
        return data;
    } catch (err) {
        console.error('CRITICAL: Email Delivery Error!', err.message);
        throw err;
    }
};

module.exports = sendEmail;
