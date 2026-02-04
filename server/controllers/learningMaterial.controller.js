const LearningMaterial = require('../models/LearningMaterial');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Assuming Notification model exists

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

// --- Create Material (Teacher) ---
exports.createMaterial = async (req, res) => {
    try {
        const {
            title,
            type,
            subject,
            classLevel,
            arm,
            term,
            session,
            description,
            fileUrl,
            status // Optional, default is Draft. Teachers can set to 'Pending Approval' immediately.
        } = req.body;

        const material = new LearningMaterial({
            schoolId: req.user.schoolId,
            teacherId: req.user.userId || req.user._id,
            title,
            type,
            subject,
            classLevel,
            arm,
            term,
            session,
            description,
            fileUrl,
            status: status || 'Draft'
        });

        await material.save();

        // If submitted for approval immediately
        if (material.status === 'Pending Approval') {
            // Notify Admins
            const admins = await User.find({
                schoolId: req.user.schoolId,
                role: { $in: ['school_admin', 'super_admin'] }
            });
            const notificationMessage = `New Learning Material Submitted: ${title} by ${req.user.name}`;
            const notificationPromises = admins.map(admin => 
                createNotification(admin._id, notificationMessage, 'info', `/admin/learning-materials`, material._id)
            );
            await Promise.all(notificationPromises);
        }

        res.status(201).json({ message: 'Material created successfully', material });
    } catch (error) {
        console.error('Error creating material:', error);
        res.status(500).json({ message: 'Error creating material', error: error.message });
    }
};

// --- Get Materials (Flexible Filter) ---
exports.getMaterials = async (req, res) => {
    try {
        const { status, classLevel, subject, type, term, session } = req.query;
        let query = { schoolId: req.user.schoolId };

        // Role-based restrictions
        if (req.user.role === 'Student') {
            query.status = 'Approved'; // Students only see approved
            // Optionally restrict strict to their class if we had that data handy in req.user, 
            // but for now we trust the frontend to query correctly or just show all approved for the school.
        } else if (req.user.role === 'Teacher') {
             // Teachers generally see their own via getMyMaterials, but this could be used to see a public library?
             // For now, let's keep this generic or restrict if needed.
        }

        if (status) query.status = status;
        if (classLevel) query.classLevel = classLevel;
        if (subject) query.subject = subject;
        if (type) query.type = type;
        if (term) query.term = term;
        if (session) query.session = session;

        const materials = await LearningMaterial.find(query)
            .populate('teacherId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching materials:', error);
        res.status(500).json({ message: 'Error fetching materials', error: error.message });
    }
};

// --- Get My Materials (Teacher) ---
exports.getMyMaterials = async (req, res) => {
    try {
        const materials = await LearningMaterial.find({
            schoolId: req.user.schoolId,
            teacherId: req.user.userId || req.user._id
        }).sort({ createdAt: -1 });

        res.status(200).json(materials);
    } catch (error) {
        console.error('Error fetching your materials:', error);
        res.status(500).json({ message: 'Error fetching your materials', error: error.message });
    }
};

// --- Update Status (Admin) ---
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminFeedback } = req.body;

        const material = await LearningMaterial.findOne({ _id: id, schoolId: req.user.schoolId });
        if (!material) {
            return res.status(404).json({ message: 'Material not found' });
        }

        material.status = status;
        if (adminFeedback) {
            material.adminFeedback = adminFeedback;
        }

        await material.save();

        // Notify Teacher
        const message = `Your learning material "${material.title}" has been ${status}`;
        await createNotification(
            material.teacherId,
            message,
            status === 'Approved' ? 'success' : 'error',
            `/teacher/learning-materials`,
            material._id
        );

        // If Approved, optionally notify Students (this can be high volume, so maybe just a generic feed update)
        // Leaving out mass student notification for now to avoid spam.

        res.status(200).json({ message: `Material ${status}`, material });
    } catch (error) {
        console.error('Error updating status:', error);
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
};

// --- Update Material (Teacher - Edit Draft/Pending) ---
exports.updateMaterial = async (req, res) => {
     try {
        const { id } = req.params;
        const updates = req.body;
        
        const material = await LearningMaterial.findOne({ _id: id, schoolId: req.user.schoolId });
        if (!material) return res.status(404).json({ message: 'Material not found' });
        
        if (material.teacherId.toString() !== (req.user.userId || req.user._id).toString()) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Apply updates
        Object.keys(updates).forEach(key => {
            // Prevent changing schoolId or teacherId
            if (key !== 'schoolId' && key !== 'teacherId' && key !== 'downloadCount') {
                material[key] = updates[key];
            }
        });
        
        // If editing an approved/rejected material, maybe reset to Draft? 
        // Let's assume teacher manually sets status to 'Draft' or 'Pending' via the form if they want re-review.

        await material.save();
        res.status(200).json({ message: 'Updated successfully', material });
     } catch (error) {
         res.status(500).json({ message: 'Error updating material', error: error.message });
     }
};

// --- Increment Download Count (Student) ---
exports.incrementDownload = async (req, res) => {
    try {
        const { id } = req.params;
        await LearningMaterial.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } });
        res.status(200).json({ message: 'Count updated' });
    } catch (error) {
        res.status(500).json({ message: 'Error', error: error.message });
    }
};

// --- Delete Material ---
exports.deleteMaterial = async (req, res) => {
    try {
        const { id } = req.params;
        const material = await LearningMaterial.findById(id);
        
        if (!material) return res.status(404).json({ message: 'Not found' });
        
        // Check permissions: Admin or Owner
        const isOwner = material.teacherId.toString() === (req.user.userId || req.user._id).toString();
        const isAdmin = ['school_admin', 'super_admin'].includes(req.user.role);
        
        if (!isOwner && !isAdmin) {
             return res.status(403).json({ message: 'Not authorized' });
        }
        
        await LearningMaterial.findByIdAndDelete(id);
        res.status(200).json({ message: 'Material deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting', error: error.message });
    }
};
