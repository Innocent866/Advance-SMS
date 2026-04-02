const StaffReport = require('../models/StaffReport');
const User = require('../models/User');
const Notification = require('../models/Notification');
const School = require('../models/School');

// Helper to Create Notification
const createNotification = async (recipientId, message, type = 'info', link = null, relatedId = null) => {
    try {
        await Notification.create({
            recipientId,
            message,
            type,
            link,
            relatedId
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// --- Create Report ---
exports.createReport = async (req, res) => {
    try {
        const {
            senderRole,
            reportType,
            date,
            relatedClassId,
            relatedStudentId,
            title,
            description,
            attachment,
            url,
            attachmentFileName,
            originalName,
            attachmentFileType,
            public_id,
            mimeType,
            resourceType,
            size
        } = req.body;

        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const userId = req.user.userId || req.user._id;

        // Find teacher to get department/HOD
        const Teacher = require('../models/Teacher');
        const teacher = await Teacher.findOne({ userId }).populate('departmentId');
        let departmentId = null;
        let hodId = null;
        let initialStatus = 'Submitted'; // Fallback if no department

        if (teacher && teacher.departmentId) {
            departmentId = teacher.departmentId._id;
            hodId = teacher.departmentId.hodId;
            initialStatus = 'Pending HOD';
        }

        const report = new StaffReport({
            schoolId,
            creatorId: userId,
            senderRole,
            reportType,
            date: date || new Date(),
            relatedClassId: relatedClassId || null,
            relatedStudentId: relatedStudentId || null,
            title,
            description,
            attachment: attachment || url,
            url: url || attachment,
            attachmentFileName: attachmentFileName || originalName,
            originalName: originalName || attachmentFileName,
            attachmentFileType: attachmentFileType || mimeType,
            public_id,
            mimeType,
            resourceType,
            size,
            uploadedBy: userId,
            departmentId,
            hodId,
            status: initialStatus
        });

        await report.save();

        if (initialStatus === 'Pending HOD' && hodId) {
            // Notify HOD
            const notificationMessage = `New ${reportType} Report for Review: ${title} from ${req.user.name}`;
            await createNotification(hodId, notificationMessage, 'info', `/department-review`, report._id);
        } else {
            // Notify Admins (Only if it bypassed HOD for some reason or HOD is not assigned)
            const admins = await User.find({
                schoolId,
                role: { $in: ['school_admin', 'super_admin'] }
            });

            const notificationMessage = `New ${reportType} Report from ${req.user.name} (${senderRole}): ${title}`;
            
            const notificationPromises = admins.map(admin => 
                createNotification(admin._id, notificationMessage, 'info', `/admin/reports`, report._id)
            );
            await Promise.all(notificationPromises);
        }

        res.status(201).json({ message: 'Report submitted successfully', report });
    } catch (error) {
        console.error('Error creating report:', error);
        res.status(500).json({ message: 'Error submitting report', error: error.message });
    }
};

// --- HOD Review (HOD) ---
exports.hodReview = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, feedback } = req.body;
        const userId = req.user.userId || req.user._id;

        const report = await StaffReport.findOne({ _id: id, hodId: userId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found or access denied' });
        }

        if (action === 'Approve') {
            report.status = 'Submitted'; 
        } else if (action === 'Reject') {
            report.status = 'HOD Rejected';
        }
        
        if (feedback) {
            report.adminComments.push({
                comment: `HOD Feedback: ${feedback}`,
                adminId: userId,
                createdAt: new Date()
            });
        }

        await report.save();

        // Notify Creator
        await createNotification(
            report.creatorId,
            `Your report "${report.title}" has been ${report.status} by the HOD.`,
            action === 'Approve' ? 'success' : 'error',
            `/staff/reports`,
            report._id
        );

        // If Approved, notify Admins
        if (action === 'Approve') {
            const admins = await User.find({
                schoolId: report.schoolId,
                role: { $in: ['school_admin', 'super_admin'] }
            });
            const adminMsg = `New HOD-Approved Report: ${report.title} from ${report.senderRole}`;
            const adminNotifs = admins.map(admin => 
                createNotification(admin._id, adminMsg, 'info', `/admin/reports`, report._id)
            );
            await Promise.all(adminNotifs);
        }

        res.status(200).json({ success: true, report });
    } catch (error) {
        console.error('Error in HOD review:', error);
        res.status(500).json({ message: 'Error in HOD review', error: error.message });
    }
};

// --- Get All Reports (Admin) ---
exports.getAllReports = async (req, res) => {
    try {
        const { role, type, status, startDate, endDate } = req.query;
        
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const userRole = req.user.role;

        let query = { schoolId };

        // [STRICT OVERSIGHT] Admin only sees passed-HOD reports
        if (['school_admin', 'super_admin'].includes(userRole)) {
            query.status = { $nin: ['Pending HOD', 'HOD Rejected'] };
        }

        // HOD Review View
        if (req.query.reviewOnly === 'true') {
            query.hodId = req.user.userId || req.user._id;
        }

        if (role) query.senderRole = role;
        if (type) query.reportType = type;
        if (status) query.status = status;
        
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        const reports = await StaffReport.find(query)
            .populate('creatorId', 'name email')
            .populate('relatedClassId', 'name')
            .populate('relatedStudentId', 'firstName lastName')
            .populate('adminComments.adminId', 'name role')
            .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ message: 'Error fetching reports', error: error.message });
    }
};

// --- Get My Reports (Staff) ---
exports.getMyReports = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const reports = await StaffReport.find({
            schoolId,
            creatorId: req.user.userId || req.user._id
        })
        .populate('relatedClassId', 'name')
        .populate('relatedStudentId', 'firstName lastName')
        .populate('adminComments.adminId', 'name role')
        .sort({ createdAt: -1 });

        res.status(200).json(reports);
    } catch (error) {
        console.error('Error fetching your reports:', error);
        res.status(500).json({ message: 'Error fetching your reports', error: error.message });
    }
};

// --- Add Reply (Staff/Admin) ---
exports.addReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const report = await StaffReport.findOne({ _id: id, schoolId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Verify user is either creator OR admin
        const isCreator = report.creatorId.toString() === (req.user.userId || req.user._id).toString();
        const isAdmin = ['school_admin', 'super_admin'].includes(req.user.role);

        if (!isCreator && !isAdmin) {
            return res.status(403).json({ message: 'Not authorized to reply to this report' });
        }

        report.adminComments.push({
            comment,
            adminId: req.user.userId || req.user._id, // Storing author ID here
            createdAt: new Date()
        });

        await report.save();

        // Re-fetch to populate comments
        const popReport = await StaffReport.findById(id).populate('adminComments.adminId', 'name role');

        // Notify the 'other' party
        if (isCreator) {
            // Notify Admins
            const admins = await User.find({
                schoolId,
                role: { $in: ['school_admin', 'super_admin'] }
            });
            const notificationMessage = `New reply on report "${report.title}" from ${req.user.name}`;
            const notificationPromises = admins.map(admin => 
                createNotification(admin._id, notificationMessage, 'info', `/admin/reports`, report._id)
            );
            await Promise.all(notificationPromises);
        } else {
            // Notify Creator (Admin replied via this route, though usually they use updateStatus)
            await createNotification(
                report.creatorId,
                `New reply on report "${report.title}"`,
                'info',
                `/staff/reports`,
                report._id
            );
        }

        res.status(200).json({ message: 'Reply added', report: popReport });
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ message: 'Error adding reply', error: error.message });
    }
};

// --- Update Report Status (Admin) ---
exports.updateReportStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const report = await StaffReport.findOne({ _id: id, schoolId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (status) {
            report.status = status;
        }

        if (comment) {
            report.adminComments.push({
                comment,
                adminId: req.user.userId || req.user._id,
                createdAt: new Date()
            });
        }

        await report.save();

        // Re-fetch to populate comments
        const popReport = await StaffReport.findById(id).populate('adminComments.adminId', 'name role');

        // Notify the Creator
        await createNotification(
            report.creatorId,
            `Your report "${report.title}" has been updated to: ${report.status}`,
            'info',
            `/staff/reports`, // Assuming this will be the staff route
            report._id
        );

        res.status(200).json({ message: 'Report updated successfully', report: popReport });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
};

// --- Update Report Content (Staff - Edit) ---
exports.updateReport = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            senderRole,
            reportType,
            date,
            title,
            description,
            attachment,
            url,
            attachmentFileName,
            originalName,
            attachmentFileType,
            public_id,
            mimeType,
            resourceType,
            size
        } = req.body;

        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const report = await StaffReport.findOne({ _id: id, schoolId });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Verify creator
        if (report.creatorId.toString() !== (req.user.userId || req.user._id).toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this report' });
        }

        // Optional: Restrict edit if status is Resolved?
        // if (report.status === 'Resolved') return res.status(400).json({ message: 'Cannot edit resolved reports' });

        report.senderRole = senderRole || report.senderRole;
        report.reportType = reportType || report.reportType;
        report.date = date || report.date;
        report.title = title || report.title;
        report.description = description || report.description;
        report.attachment = attachment !== undefined ? attachment : (url !== undefined ? url : report.attachment);
        report.url = url !== undefined ? url : (attachment !== undefined ? attachment : report.url);
        report.attachmentFileName = attachmentFileName !== undefined ? attachmentFileName : (originalName !== undefined ? originalName : report.attachmentFileName);
        report.originalName = originalName !== undefined ? originalName : (attachmentFileName !== undefined ? attachmentFileName : report.originalName);
        report.attachmentFileType = attachmentFileType !== undefined ? attachmentFileType : (mimeType !== undefined ? mimeType : report.attachmentFileType);
        report.public_id = public_id !== undefined ? public_id : report.public_id;
        report.mimeType = mimeType !== undefined ? mimeType : report.mimeType;
        report.resourceType = resourceType !== undefined ? resourceType : report.resourceType;
        report.size = size !== undefined ? size : report.size;

        await report.save();

        res.status(200).json({ message: 'Report updated successfully', report });
    } catch (error) {
        console.error('Error updating report:', error);
        res.status(500).json({ message: 'Error updating report', error: error.message });
    }
};

// --- Delete Report (Admin/Creator - Optional) ---
exports.deleteReport = async (req, res) => {
// ... existing delete code
    try {
         const { id } = req.params;
         // Allow admin or creator to delete? Usually just admin or nobody for audit logs.
         // Let's check permissions.
         const schoolId = req.user.schoolId?._id || req.user.schoolId;
         const report = await StaffReport.findOne({ _id: id, schoolId });
         
         if (!report) {
             return res.status(404).json({ message: 'Report not found' });
         }
         
         // Only allow Admin to delete for now
         /* 
         const userRole = req.user.role; 
         if (userRole !== 'school_admin' && userRole !== 'super_admin') {
             return res.status(403).json({ message: 'Not authorized to delete reports' });
         }
         */
         
         await StaffReport.findByIdAndDelete(id);
         res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
         res.status(500).json({ message: 'Error deleting report', error: error.message });
    }
};
