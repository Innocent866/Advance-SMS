const mongoose = require('../server/node_modules/mongoose');

const API_URL = 'http://127.0.0.1:5001/api';
const adminCredentials = { email: "audit@test.com", password: "password123" };
const teacherCredentials = { email: "teacher_audit@test.com", password: "password123" };

let adminToken = '';
let teacherToken = '';
let departmentId = '';
let materialId = '';

const runFullAudit = async () => {
    try {
        console.log('--- Phase 1: Authentication & Setup ---');
        // Admin Login
        const adminLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(adminCredentials)
        });
        const adminData = await adminLogin.json();
        adminToken = adminData.token;
        const adminHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` };
        console.log('✅ Admin Logged In');

        // Teacher Login
        const teacherLogin = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(teacherCredentials)
        });
        const teacherData = await teacherLogin.json();
        teacherToken = teacherData.token;
        const teacherHeaders = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${teacherToken}` };
        console.log('✅ Teacher Logged In');

        console.log('\n--- Phase 2: Department & HOD Audit ---');
        // Create Department with Admin as HOD
        // Note: hodId in Department model is a User ID.
        const deptRes = await fetch(`${API_URL}/departments`, {
            method: 'POST',
            headers: adminHeaders,
            body: JSON.stringify({
                name: "Science Dept " + Date.now(),
                hodId: adminData._id,
                description: "Test Department"
            })
        });
        const deptData = await deptRes.json();
        departmentId = deptData.data._id;
        console.log('✅ Department created:', deptData.data.name);

        // Assign Teacher to Department
        // Find teacher profile id first
        const teacherProfileRes = await fetch(`${API_URL}/teachers/me`, { headers: teacherHeaders });
        const teacherProfile = await teacherProfileRes.json();
        
        const updateTeacherRes = await fetch(`${API_URL}/teachers/${teacherProfile._id}`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ departmentId })
        });
        if (updateTeacherRes.ok) {
            console.log('✅ Teacher assigned to department');
        } else {
            const err = await updateTeacherRes.json();
            console.error('❌ Teacher assignment failed:', err.message);
        }

        console.log('\n--- Phase 3: Learning Material Submission Audit ---');
        const mateRes = await fetch(`${API_URL}/learning-materials`, {
            method: 'POST',
            headers: teacherHeaders,
            body: JSON.stringify({
                title: "Intro to Physics",
                type: "Note",
                subject: "Physics",
                classLevel: "SSS1",
                term: "First Term",
                session: "2024/2025",
                fileUrl: "https://example.com/physics.pdf",
                status: "Pending HOD"
            })
        });
        const mateData = await mateRes.json();
        if (mateRes.ok) {
            materialId = mateData.material._id;
            console.log('✅ Material submitted to HOD. Status:', mateData.material.status);
        } else {
             console.error('❌ Material submission failed:', mateData.message);
             return;
        }

        console.log('\n--- Phase 4: HOD Review Audit ---');
        const hodReviewRes = await fetch(`${API_URL}/learning-materials/${materialId}/hod-review`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ action: "Approve", feedback: "Excellent content" })
        });
        const hodReviewData = await hodReviewRes.json();
        if (hodReviewRes.ok) {
            console.log('✅ HOD Approved. Material Status:', hodReviewData.material.status);
        } else {
            console.error('❌ HOD Review failed:', hodReviewData.message);
        }

        console.log('\n--- Phase 5: Admin Final Approval Audit ---');
        const adminApproveRes = await fetch(`${API_URL}/learning-materials/${materialId}/status`, {
            method: 'PUT',
            headers: adminHeaders,
            body: JSON.stringify({ status: "Approved", adminFeedback: "Final Approval" })
        });
        const adminApproveData = await adminApproveRes.json();
        if (adminApproveRes.ok) {
            console.log('✅ Admin Approved. Material Status:', adminApproveData.material.status);
        } else {
            console.error('❌ Admin Approval failed:', adminApproveData.message);
        }

        console.log('\n✅ ACADEMIC WORKFLOW AUDIT COMPLETE.');

    } catch (err) {
        console.error('Audit Error:', err.message);
    }
};

runFullAudit();
