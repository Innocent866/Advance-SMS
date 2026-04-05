const axios = require('axios');

const baseURL = 'http://localhost:5001/api';

const endpoints = [
    { path: '/auth/login', method: 'POST' },
    { path: '/schools/my-school', method: 'GET' },
    { path: '/teachers', method: 'GET' },
    { path: '/teachers/me', method: 'GET' },
    { path: '/students', method: 'GET' },
    { path: '/students/active-upload-links', method: 'GET' },
    { path: '/academic/sessions', method: 'GET' },
    { path: '/academic/classes', method: 'GET' },
    { path: '/academic/subjects', method: 'GET' },
    { path: '/staff/unified', method: 'GET' }, // Known missing bridge
    { path: '/departments', method: 'GET' },
    { path: '/chat/staff', method: 'GET' },
    { path: '/hostels', method: 'GET' },
    { path: '/boarding/discipline', method: 'GET' }
];

async function testEndpoints() {
    console.log('--- Testing Refined API Endpoints on localhost:5001 ---');
    
    for (const endpoint of endpoints) {
        try {
            const response = await axios({
                method: endpoint.method,
                url: `${baseURL}${endpoint.path}`,
                timeout: 2000,
                validateStatus: () => true
            });
            
            const status = response.status;
            const icon = status === 404 ? '❌' : (status === 401 ? '🔒' : '✅');
            const note = status === 401 ? '(Exists & Protected)' : (status === 404 ? 'NOT FOUND' : `Status ${status}`);
            
            console.log(`${icon} ${endpoint.method} ${endpoint.path}: ${note}`);
        } catch (error) {
            console.log(`❌ ${endpoint.method} ${endpoint.path}: FAILED (${error.message})`);
        }
    }
}

testEndpoints();
