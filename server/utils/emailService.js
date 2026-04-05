const nodemailer = require('nodemailer');
const dns = require('dns');

// Private Transporter Singleton (Lazy)
let _transporter = null;

/**
 * Initialize the SMTP Transporter lazily
 * This ensures dotenv.config() has been called before the transporter is created.
 */
const getTransporter = () => {
    if (_transporter) return _transporter;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
        console.error('CRITICAL: Email credentials missing in process.env!');
        return null;
    }

    try {
        _transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 465,
            secure: Number(process.env.SMTP_PORT) === 465,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            pool: true,
            maxConnections: 5,
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
            lookup: (hostname, options, callback) => {
                // Strict IPv4 filter to prevent Render's Node.js from using a non-functional IPv6 route
                dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
                    callback(err, address, family);
                });
            }
        });
        console.log('✅ Real SMTP Transporter Created Successfully');
        return _transporter;
    } catch (err) {
        console.error('Failed to create SMTP transporter:', err.message);
        return null;
    }
};

/**
 * Send an email using SMTP (Lazy Singleton)
 */
const sendEmail = async (options) => {
    const transporter = getTransporter();

    // Fallback if Transporter initialization failed
    if (!transporter) {
        console.error('--- MOCK EMAIL FALLBACK ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log('---------------------------');
        return;
    }

    const message = {
        from: `"${process.env.FROM_NAME || 'GT-SchoolHub'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent successfully: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('CRITICAL: Email Delivery Failed!', error.message);
        throw error;
    }
};

module.exports = sendEmail;
