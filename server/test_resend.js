require('dotenv').config();
const sendEmail = require('./utils/emailService');

async function testResend() {
    console.log('--- Resend API Connection Test ---');
    console.log(`Using API Key (Prefix): ${process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.substring(0, 7) + '...' : 'MISSING'}`);
    
    try {
        await sendEmail({
            email: 'igoldima@gmail.com', // MUST be your verified Resend email
            subject: 'Resend API Test - GT-SchoolHub',
            message: 'Congratulations! Your Resend API integration is working. This email was sent via HTTP, bypassing all SMTP firewall blocks.',
            html: '<h1>Resend API Success!</h1><p>Your 2FA emails will now work reliably on <strong>Render Production</strong>.</p>'
        });
        
        console.log('\n✅ Success! Check your igoldima@gmail.com inbox.');
    } catch (err) {
        console.error('\n❌ Test Failed!');
        console.error(err.message);
    }
}

testResend();
