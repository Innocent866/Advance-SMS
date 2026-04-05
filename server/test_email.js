require('dotenv').config();
const sendEmail = require('./utils/emailService');

async function testConnection() {
    console.log('--- Email Connection Test ---');
    console.log(`Using Host: ${process.env.SMTP_HOST}`);
    console.log(`Using Port: ${process.env.SMTP_PORT}`);
    console.log(`Using User: ${process.env.SMTP_USER}`);
    
    try {
        await sendEmail({
            email: 'igoldima@gmail.com',
            subject: 'System Test - IPv4 Connection',
            message: 'If you receive this, the IPv4-only DNS fix is working!',
            html: '<h1>Connection Success!</h1><p>The IPv4-only DNS override has resolved the ENETUNREACH issue.</p>'
        });
        console.log('✅ Success! Check your inbox.');
    } catch (error) {
        console.error('❌ Failed!');
        console.error(error);
    }
}

testConnection();
