const School = require('../models/School');
const User = require('../models/User');

// @desc    Get school details (for dashboard)
// @route   GET /api/schools/my-school
// @access  Private (Admin)
const getMySchool = async (req, res) => {
    try {
        const school = await School.findById(req.user.schoolId);
        if (!school) {
            return res.status(404).json({ message: 'School not found' });
        }
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update school details
// @route   PUT /api/schools/my-school
// @access  Private (Admin)
const updateSchool = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Parse JSON fields if they come as strings (Multipart/form-data quirk)
        if (typeof updateData.branding === 'string') {
            try { updateData.branding = JSON.parse(updateData.branding); } catch (e) {}
        }
        if (typeof updateData.preferences === 'string') {
            try { updateData.preferences = JSON.parse(updateData.preferences); } catch (e) {}
        }
        if (typeof updateData.notificationPreferences === 'string') {
            try { updateData.notificationPreferences = JSON.parse(updateData.notificationPreferences); } catch (e) {}
        }
        if (typeof updateData.receiptSettings === 'string') {
            try { updateData.receiptSettings = JSON.parse(updateData.receiptSettings); } catch (e) {}
        }

        if (req.file) {
            updateData.logoUrl = req.file.path; // Cloudinary URL
            
            // Update School Usage
            await School.findByIdAndUpdate(req.user.schoolId, {
                $inc: { 
                    'mediaUsage.storageBytes': req.file.size,
                    'mediaUsage.uploadCount': 1
                }
            });
        }

        // Check if bank details are being updated
        if (req.body.bankDetails) {
            let bankDetails = req.body.bankDetails;
            if (typeof bankDetails === 'string') {
                try { bankDetails = JSON.parse(bankDetails); } catch (e) {}
            }
            // Ensure nested update works
             updateData.bankDetails = bankDetails;

            // If we have full bank details or partial details to resolve
            if ((bankDetails.bankCode || bankDetails.bankName) && bankDetails.accountNumber) {
                try {
                    const axios = require('axios');
                    const school = await School.findById(req.user.schoolId);
                    
                    // 1. Resolve Bank Code if missing
                    if (!bankDetails.bankCode && bankDetails.bankName) {
                        try {
                            const bankRes = await axios.get('https://api.paystack.co/bank', {
                                headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
                            });
                            
                            const banks = bankRes.data.data;
                            // Find closest match or exact match (case insensitive)
                            const matchedBank = banks.find(b => 
                                b.name.toLowerCase() === bankDetails.bankName.toLowerCase() ||
                                b.name.toLowerCase().includes(bankDetails.bankName.toLowerCase()) || 
                                bankDetails.bankName.toLowerCase().includes(b.name.toLowerCase())
                            );

                            if (matchedBank) {
                                bankDetails.bankCode = matchedBank.code;
                                // Update the stored bank name to the official one for consistency
                                bankDetails.bankName = matchedBank.name;
                                updateData.bankDetails = bankDetails; // Update with resolved code
                                console.log(`Resolved Bank Name "${req.body.bankDetails.bankName}" to Code: ${matchedBank.code} (${matchedBank.name})`);
                            } else {
                                console.warn(`Could not resolve bank code for name: ${bankDetails.bankName}`);
                            }
                        } catch (e) {
                            console.error("Error resolving bank list:", e.message);
                        }
                    }

                    // 2. Create Subaccount if we have code and account
                    if (bankDetails.bankCode && bankDetails.accountNumber) {
                        // Payload for Paystack Subaccount
                        const payload = {
                            business_name: updateData.name || school.name,
                            settlement_bank: bankDetails.bankCode,
                            account_number: bankDetails.accountNumber,
                            percentage_charge: 0, // 0 for now, full settlement to school
                            description: `Subaccount for ${school.name}`
                        };

                        console.log("Creating Paystack Subaccount:", payload);
                        
                        const response = await axios.post('https://api.paystack.co/subaccount', payload, {
                            headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` }
                        });

                        if (response.data.status) {
                             updateData.paystackSubaccountCode = response.data.data.subaccount_code;
                             console.log("Subaccount Created:", response.data.data.subaccount_code);
                        }
                    }
                } catch (paystackError) {
                    console.error("Paystack Subaccount Error:", paystackError.response?.data || paystackError.message);
                }
            }
        }

        const school = await School.findByIdAndUpdate(req.user.schoolId, updateData, { new: true });
        res.json(school);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getMySchool,
    updateSchool,
};
