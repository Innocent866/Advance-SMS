const axios = require('axios');

async function testLogin() {
    try {
        const response = await axios.post('http://localhost:5001/api/auth/login', {
            email: 'admin@gmail.com', // Assuming this might exist or just trigger the logic
            password: 'password123'
        });
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error Status:', error.response?.status);
        console.error('Error Data:', error.response?.data);
    }
}

testLogin();
