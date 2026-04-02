const mongoose = require('../server/node_modules/mongoose');

const API_URL = 'http://127.0.0.1:5001/api';
const adminCredentials = { email: "audit@test.com", password: "password123" };

const runLinkAudit = async () => {
    try {
        console.log('--- Phase 1: Link Generation ---');
        // Admin Login
        const adminLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminCredentials)
        });
        const adminData = await adminLogin.json();
        const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminData.token}` };
        console.log('✅ Admin Logged In');

        // Get a class ID
        const classRes = await fetch(`${API_URL}/academic/classes`, { headers: adminHeaders });
        const classes = await classRes.json();
        const classId = classes[0]._id;
        console.log('✅ Using Class:', classes[0].name);

        // Generate Link
        const linkRes = await fetch(`${API_URL}/students/generate-upload-link`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                classId,
                arm: "A"
            })
        });
        const linkData = await linkRes.json();
        const token = linkData.session.token;
        console.log('✅ Upload Link Generated. Token length:', token.length);

        console.log('\n--- Phase 2: Token Verification ---');
        const verifyRes = await fetch(`${API_URL}/students/verify-upload-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
        });
        const verifyData = await verifyRes.json();
        if (verifyRes.ok) {
            console.log('✅ Token verified. Context:', verifyData.context);
        } else {
            console.error('❌ Token verification failed:', verifyData.message);
            return;
        }

        console.log('\n--- Phase 3: Bulk Upload Verification ---');
        const studentsToUpload = [
            { firstName: "Portal", lastName: "Student 1", email: `portal1_${Date.now()}@test.com`, gender: "Male" },
            { firstName: "Portal", lastName: "Student 2", email: `portal2_${Date.now()}@test.com`, gender: "Female" }
        ];

        const uploadRes = await fetch(`${API_URL}/students/bulk-upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, students: studentsToUpload })
        });
        const uploadData = await uploadRes.json();
        if (uploadRes.ok) {
            console.log('✅ Bulk upload successful. Results:', uploadData.results);
        } else {
            console.error('❌ Bulk upload failed:', uploadData.message);
        }

        console.log('\n✅ STUDENT LINK AUDIT COMPLETE.');

    } catch (err) {
        console.error('Audit Error:', err.message);
    }
};

runLinkAudit();
