const axios = require('axios');

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

const paystack = axios.create({
    baseURL: 'https://api.paystack.co',
    headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
    }
});

const initializeTransaction = async (data) => {
    try {
        const response = await paystack.post('/transaction/initialize', data);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const verifyTransaction = async (reference) => {
    try {
        const response = await paystack.get(`/transaction/verify/${reference}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    initializeTransaction,
    verifyTransaction
};
