const nodemailer = require('nodemailer');
const dns = require('dns');

/**
 * Send an email using SMTP
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Plain text message
 * @param {string} options.html - HTML message content
 */
const sendEmail = async (options) => {
    // Create a transporter
    // For local dev without env vars, logging fallback
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.log('--- MOCK EMAIL SENT ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Body: ${options.message}`);
        console.log('-----------------------');
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        // Performance & Stability
        connectionTimeout: 5000, // 5 seconds
        greetingTimeout: 5000,   // 5 seconds
        socketTimeout: 10000,    // 10 seconds
        // Force IPv4 to resolve 'ENETUNREACH' errors on systems without IPv6 routing
        // This custom lookup handles cases where the host default-resolves to IPv6 first.
        lookup: (hostname, options, callback) => {
            dns.lookup(hostname, { family: 4 }, (err, address, family) => {
                callback(err, address, family);
            });
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'GT-SchoolHub'} <${process.env.FROM_EMAIL || 'goldima@gt-schoolhub.com.ng'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    const info = await transporter.sendMail(message);

    console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
