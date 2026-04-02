const Student = require('../models/Student');
const Room = require('../models/Room');
const Hostel = require('../models/Hostel');
const HostelAttendance = require('../models/HostelAttendance');
const LeaveRequest = require('../models/LeaveRequest');
const MealTracking = require('../models/MealTracking');
const MedicalRecord = require('../models/MedicalRecord');
const DisciplineRecord = require('../models/DisciplineRecord');
const BoardingReport = require('../models/BoardingReport');
const HostelNotification = require("../models/HostelNotification");
const School = require('../models/School');

// --- Room & Bed Allocation ---

// --- Room & Bed Allocation ---

exports.allocateRoom = async (req, res) => {
    try {
        const { studentId, hostelId, roomId, bedNumber } = req.body;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        // Check if bed is already taken
        const isBedTaken = room.bedDetails.some(b => b.bedNumber === bedNumber && b.isOccupied);
        if (isBedTaken) {
            return res.status(400).json({ success: false, message: `Bed ${bedNumber} is already occupied` });
        }

        if (room.occupancy >= room.capacity) {
            return res.status(400).json({ success: false, message: 'Room is at full capacity' });
        }

        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        // HANDLE RE-ALLOCATION: If student was already in a room, free up the old spot
        if (student.isBoarder && student.roomId) {
            const oldRoom = await Room.findById(student.roomId);
            if (oldRoom) {
                oldRoom.occupancy = Math.max(0, oldRoom.occupancy - 1);
                // Remove student from old room bedDetails
                oldRoom.bedDetails = oldRoom.bedDetails.filter(b => b.studentId?.toString() !== studentId.toString());
                await oldRoom.save();
            }
        }

        // Update student
        student.isBoarder = true;
        student.hostelId = hostelId;
        student.roomId = roomId;
        student.bedNumber = bedNumber;
        student.boardingCheckInDate = student.boardingCheckInDate || new Date();
        await student.save();

        // Update new room occupancy and bedDetails
        room.occupancy += 1;
        room.bedDetails.push({
            bedNumber,
            isOccupied: true,
            studentId
        });
        await room.save();

        res.status(200).json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deallocateRoom = async (req, res) => {
    try {
        const { studentId } = req.body;
        const student = await Student.findById(studentId);
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        if (student.roomId) {
            const room = await Room.findById(student.roomId);
            if (room) {
                room.occupancy = Math.max(0, room.occupancy - 1);
                room.bedDetails = room.bedDetails.filter(b => b.studentId?.toString() !== studentId.toString());
                await room.save();
            }
        }

        student.isBoarder = false;
        student.hostelId = undefined;
        student.roomId = undefined;
        student.bedNumber = undefined;
        // Keep check-in date for history or clear it? Usually clear to indicate currently checked out.
        student.boardingCheckInDate = undefined;
        await student.save();

        res.status(200).json({ success: true, message: 'Student de-allocated successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Hostel Attendance ---

exports.markHostelAttendance = async (req, res) => {
    try {
        const { hostelId, date, type, records } = req.body;
        const schoolId = req.user.schoolId;

        const attendance = new HostelAttendance({
            schoolId,
            hostelId,
            date,
            type,
            markedBy: req.user._id,
            records
        });

        await attendance.save();
        res.status(201).json({ success: true, data: attendance });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.recordMealAttendance = async (req, res) => {
    try {
        const { date, mealType, records } = req.body;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const results = await Promise.all(records.map(async (record) => {
            return await MealTracking.findOneAndUpdate(
                { 
                    studentId: record.studentId, 
                    date: new Date(new Date(date).setHours(0,0,0,0)), 
                    mealType 
                },
                {
                    schoolId,
                    studentId: record.studentId,
                    date: new Date(new Date(date).setHours(0,0,0,0)),
                    mealType,
                    attended: record.consumed,
                    markedBy: req.user._id
                },
                { upsert: true, new: true }
            );
        }));

        res.status(200).json({ success: true, data: results });

        // PERSISTENT NOTIFICATION: Create a system notification for the House Parent
        if (req.user.role === 'house_parent') {
            const Notification = require('../models/Notification');
            try {
                await Notification.create({
                    recipientId: req.user._id,
                    message: `You have successfully recorded meal attendance for ${mealType} on ${new Date(date).toDateString()}.`,
                    type: 'success'
                });
            } catch (notifyError) {
                console.error('Failed to create system notification:', notifyError);
            }
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getMealAttendance = async (req, res) => {
    try {
        const { date, mealType, hostelId } = req.query;
        const schoolId = req.user.schoolId._id || req.user.schoolId;

        const query = {
            schoolId,
            date: new Date(new Date(date).setHours(0,0,0,0)),
            mealType
        };

        if (hostelId) {
            const students = await Student.find({ hostelId, schoolId }).select('_id');
            const studentIds = students.map(s => s._id);
            query.studentId = { $in: studentIds };
        }

        const records = await MealTracking.find(query).populate('markedBy', 'firstName lastName role');
        
        // Admin Filter: "Admin should only be able to see post made by the house parent"
        if (['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            const filteredRecords = records.filter(r => r.markedBy?.role === 'house_parent');
            return res.status(200).json({ success: true, data: filteredRecords });
        }

        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Leave Management ---

exports.requestLeave = async (req, res) => {
    try {
        const { reason, leaveType, startDate, endDate } = req.body;
        let studentObjectId;

        if (req.user.role === 'student') {
            // Find student record associated with this user
            const student = await Student.findOne({ userId: req.user._id });
            if (!student) return res.status(404).json({ success: false, message: 'Student profile not found' });
            studentObjectId = student._id;
        } else {
            // Find student by their human-readable ID
            const inputId = req.body.studentId;
            if (!inputId) return res.status(400).json({ success: false, message: 'Student ID is required' });
            
            const student = await Student.findOne({ 
                studentId: inputId, 
                schoolId: req.user.schoolId._id || req.user.schoolId 
            });
            
            if (!student) return res.status(404).json({ success: false, message: `Student not found with ID: ${inputId}` });
            studentObjectId = student._id;
        }

        const leaveRequest = new LeaveRequest({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            studentId: studentObjectId,
            reason,
            leaveType,
            startDate,
            endDate
        });

        await leaveRequest.save();
        res.status(201).json({ success: true, data: leaveRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveLeave = async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const leaveRequest = await LeaveRequest.findByIdAndUpdate(req.params.id, {
            status,
            remarks,
            approvedBy: req.user._id
        }, { new: true });

        if (!leaveRequest) return res.status(404).json({ success: false, message: 'Leave request not found' });

        res.status(200).json({ success: true, data: leaveRequest });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllLeaveRequests = async (req, res) => {
    try {
        const query = { schoolId: req.user.schoolId };
        if (req.user.role === 'student') {
            query.studentId = req.user.studentProfileId;
        }
        const requests = await LeaveRequest.find(query)
            .populate('studentId', 'firstName lastName studentId')
            .populate('approvedBy', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: requests });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Medical Records ---

exports.addMedicalRecord = async (req, res) => {
    try {
        if (['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Admins cannot add medical records.' });
        }

        const record = new MedicalRecord({
            ...req.body,
            schoolId: req.user.schoolId,
            attendedBy: req.user._id,
            status: 'Pending'
        });

        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateMedicalRecord = async (req, res) => {
    try {
        if (req.user.role !== 'house_parent') {
            return res.status(403).json({ success: false, message: 'Only House Parents can edit medical records.' });
        }

        const record = await MedicalRecord.findByIdAndUpdate(req.params.id, {
            ...req.body,
            status: 'Pending' // Reset to pending if edited? Usually safe.
        }, { new: true });

        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveMedicalRecord = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Only Admins can approve records.' });
        }

        const { status } = req.body; // Approved or UnApproved
        const record = await MedicalRecord.findByIdAndUpdate(req.params.id, {
            status,
            approvedBy: req.user._id
        }, { new: true });

        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllMedicalRecords = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const records = await MedicalRecord.find({ schoolId })
            .populate('studentId', 'firstName lastName studentId profilePicture')
            .populate('attendedBy', 'firstName lastName')
            .sort({ date: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteMedicalRecord = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin', 'house_parent'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete medical records.' });
        }
        const record = await MedicalRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Discipline Management ---

exports.addDisciplineRecord = async (req, res) => {
    try {
        if (['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Admins cannot log disciplinary incidents.' });
        }

        const record = new DisciplineRecord({
            ...req.body,
            schoolId: req.user.schoolId,
            reportedBy: req.user._id,
            status: 'Pending'
        });

        await record.save();
        res.status(201).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateDisciplineRecord = async (req, res) => {
    try {
        if (req.user.role !== 'house_parent') {
            return res.status(403).json({ success: false, message: 'Only House Parents can edit discipline records.' });
        }

        const record = await DisciplineRecord.findByIdAndUpdate(req.params.id, {
            ...req.body,
            status: 'Pending'
        }, { new: true });

        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveDisciplineRecord = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Only Admins can approve records.' });
        }

        const { status } = req.body;
        const record = await DisciplineRecord.findByIdAndUpdate(req.params.id, {
            status,
            approvedBy: req.user._id
        }, { new: true });

        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllDisciplineRecords = async (req, res) => {
    try {
        const records = await DisciplineRecord.find({ schoolId: req.user.schoolId })
            .populate('studentId', 'firstName lastName studentId')
            .populate('reportedBy', 'firstName lastName')
            .sort({ incidentDate: -1 });
        res.status(200).json({ success: true, data: records });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteDisciplineRecord = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin', 'house_parent'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete discipline records.' });
        }
        const record = await DisciplineRecord.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
        res.status(200).json({ success: true, message: 'Record deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Analytics & Reports ---

exports.getBoardingAnalytics = async (req, res) => {
    try {
        const schoolId = req.user.schoolId?._id || req.user.schoolId;
        const isHouseParent = req.user.role === 'house_parent';

        // 1. SCHOOL-WIDE STATS (Always needed for context)
        const allHostels = await Hostel.find({ schoolId });
        const allHostelIds = allHostels.map(h => h._id);
        const allRooms = await Room.find({ hostelId: { $in: allHostelIds } });
        
        const schoolCapacity = allHostels.reduce((acc, h) => acc + h.capacity, 0);
        const schoolOccupancy = allRooms.reduce((acc, r) => acc + r.occupancy, 0);

        // 2. ROLE-BASED SCOPING (For Managed Hostel)
        let managedHostel = null;
        let hostelStudents = [];
        let hostelFilter = { schoolId };

        if (isHouseParent) {
            managedHostel = await Hostel.findOne({ schoolId, houseParentId: req.user._id });
            if (managedHostel) {
                hostelFilter._id = managedHostel._id;
                hostelStudents = await Student.find({ schoolId, hostelId: managedHostel._id }).select('_id');
            } else {
                return res.status(200).json({ 
                    success: true, 
                    data: { 
                        noHostel: true,
                        message: "You are not currently assigned to any hostel. Please contact the administrator for facility assignment."
                    } 
                });
            }
        }

        // Hostels & Rooms for breakdown/managed stats
        const relevantHostels = await Hostel.find(hostelFilter);
        const relevantHostelIds = relevantHostels.map(h => h._id);
        const relevantRooms = await Room.find({ hostelId: { $in: relevantHostelIds } });
        
        const currentCapacity = relevantHostels.reduce((acc, h) => acc + h.capacity, 0);
        const currentOccupancy = relevantRooms.reduce((acc, r) => acc + r.occupancy, 0);
        
        // Students Count
        let studentFilter = { schoolId, isBoarder: true };
        if (isHouseParent && managedHostel) {
            studentFilter.hostelId = managedHostel._id;
        }
        const totalBoarders = await Student.countDocuments(studentFilter);
        
        // Attendance Scoping
        const today = new Date().toISOString().split('T')[0];
        let attendanceFilter = { schoolId, date: today };
        if (isHouseParent && managedHostel) {
            attendanceFilter.hostelId = managedHostel._id;
        } else {
            attendanceFilter.hostelId = { $in: allHostelIds };
        }
        const attendance = await HostelAttendance.find(attendanceFilter);
        
        // Activity & Records Scoping (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        let activityFilter = { schoolId };
        if (isHouseParent && managedHostel) {
            activityFilter.studentId = { $in: hostelStudents.map(s => s._id) };
        }

        // Medical
        const medicalFilter = { ...activityFilter, date: { $gte: thirtyDaysAgo } };
        const medicalCount = await MedicalRecord.countDocuments(medicalFilter);
        const pendingMedical = await MedicalRecord.countDocuments({ ...medicalFilter, status: 'Pending' });
        const approvedMedical = await MedicalRecord.countDocuments({ ...medicalFilter, status: 'Approved' });

        // Discipline
        const disciplineFilter = { ...activityFilter, incidentDate: { $gte: thirtyDaysAgo } };
        const pendingDiscipline = await DisciplineRecord.countDocuments({ ...disciplineFilter, status: 'Pending' });

        // Leaves
        const leaveFilter = { ...activityFilter };
        const pendingLeaves = await LeaveRequest.countDocuments({ ...leaveFilter, status: 'Pending' });
        const approvedLeaves = await LeaveRequest.countDocuments({ ...leaveFilter, status: 'Approved' });
        const outLeaves = await LeaveRequest.countDocuments({ ...leaveFilter, status: 'Out' });

        res.status(200).json({
            success: true,
            data: {
                hostelInfo: managedHostel ? {
                    name: managedHostel.name,
                    id: managedHostel._id,
                    type: managedHostel.type
                } : null,
                schoolOccupancy: {
                    total: schoolCapacity,
                    occupied: schoolOccupancy,
                    percentage: schoolCapacity > 0 ? ((schoolOccupancy / schoolCapacity) * 100).toFixed(1) : 0
                },
                occupancy: {
                    total: currentCapacity,
                    occupied: currentOccupancy,
                    presentTonight: attendance.filter(a => a.status === 'Present').length,
                    percentage: currentCapacity > 0 ? ((currentOccupancy / currentCapacity) * 100).toFixed(1) : 0
                },
                boarders: totalBoarders,
                health: {
                    recentVisits: medicalCount,
                    pending: pendingMedical,
                    approved: approvedMedical
                },
                leaves: {
                    pending: pendingLeaves,
                    approved: approvedLeaves,
                    out: outLeaves
                },
                discipline: {
                    pending: pendingDiscipline
                },
                hostelBreakdown: !isHouseParent ? allHostels.map(h => ({
                    name: h.name,
                    type: h.type,
                    capacity: h.capacity,
                    occupancy: allRooms.filter(r => r.hostelId && r.hostelId.toString() === h._id.toString()).reduce((acc, r) => acc + r.occupancy, 0)
                })) : []
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Notifications ---

exports.addHostelNotification = async (req, res) => {
    try {
        const notification = new HostelNotification({
            ...req.body,
            schoolId: req.user.schoolId,
            senderId: req.user._id
        });
        await notification.save();
        res.status(201).json({ success: true, data: notification });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getHostelNotifications = async (req, res) => {
    try {
        const query = { schoolId: req.user.schoolId, status: 'Active' };
        if (req.query.hostelId) {
            query.$or = [{ hostelId: req.query.hostelId }, { hostelId: null }];
        }
        const notifications = await HostelNotification.find(query)
            .populate('senderId', 'firstName lastName')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: notifications });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Boarding Reports ---

exports.addBoardingReport = async (req, res) => {
    try {
        if (req.user.role !== 'house_parent') {
            return res.status(403).json({ success: false, message: 'Only House Parents can send reports.' });
        }

        const attachments = req.files ? req.files.map(file => file.path) : [];
        const schoolId = req.user.schoolId?._id || req.user.schoolId;

        const report = new BoardingReport({
            ...req.body,
            schoolId,
            createdBy: req.user._id,
            attachments,
            status: 'Sent'
        });

        await report.save();

        // Update school media usage if files were attached
        if (req.files && req.files.length > 0) {
            const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
            await School.findByIdAndUpdate(schoolId, {
                $inc: {
                    'mediaUsage.storageBytes': totalSize,
                    'mediaUsage.uploadCount': req.files.length
                }
            });
        }

        res.status(201).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.approveBoardingReport = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Only Administrators can approve reports.' });
        }

        const report = await BoardingReport.findByIdAndUpdate(
            req.params.id,
            { status: 'Approved' },
            { new: true }
        ).populate('createdBy', 'firstName lastName role')
         .populate('hostelId', 'name')
         .populate('comments.senderId', 'name');

        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.unapproveBoardingReport = async (req, res) => {
    try {
        if (!['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Only Administrators can unapprove reports.' });
        }

        const report = await BoardingReport.findByIdAndUpdate(
            req.params.id,
            { status: 'Sent' },
            { new: true }
        ).populate('createdBy', 'firstName lastName role')
         .populate('hostelId', 'name')
         .populate('comments.senderId', 'name');

        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateBoardingReport = async (req, res) => {
    try {
        const report = await BoardingReport.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        if (report.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Only the creator can edit this report.' });
        }

        if (report.status === 'Approved') {
            return res.status(400).json({ success: false, message: 'Cannot edit an approved report.' });
        }

        const schoolId = req.user.schoolId?._id || req.user.schoolId;

        // Handle new attachments if any
        if (req.files && req.files.length > 0) {
            const newAttachments = req.files.map(file => file.path);
            report.attachments = [...(report.attachments || []), ...newAttachments];
            
            // Update school media usage
            const totalSize = req.files.reduce((acc, file) => acc + file.size, 0);
            await School.findByIdAndUpdate(schoolId, {
                $inc: {
                    'mediaUsage.storageBytes': totalSize,
                    'mediaUsage.uploadCount': req.files.length
                }
            });
        }

        report.title = req.body.title || report.title;
        report.content = req.body.content || report.content;
        report.type = req.body.type || report.type;
        report.hostelId = req.body.hostelId || report.hostelId;
        
        await report.save();
        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAllBoardingReports = async (req, res) => {
    try {
        const query = { schoolId: req.user.schoolId };
        
        // If House Parent, only see their own reports (or all in their hostel if we add that)
        if (req.user.role === 'house_parent') {
            query.createdBy = req.user._id;
        }

        const reports = await BoardingReport.find(query)
            .populate('createdBy', 'firstName lastName role')
            .populate('hostelId', 'name')
            .populate('comments.senderId', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: reports });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addBoardingReportComment = async (req, res) => {
    try {
        const { text } = req.body;
        const report = await BoardingReport.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        report.comments.push({
            text,
            senderId: req.user._id,
            senderRole: req.user.role,
            createdAt: new Date()
        });

        await report.save();
        
        const updatedReport = await BoardingReport.findById(req.params.id)
            .populate('createdBy', 'firstName lastName role')
            .populate('hostelId', 'name')
            .populate('comments.senderId', 'name');

        res.status(200).json({ success: true, data: updatedReport });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteBoardingReport = async (req, res) => {
    try {
        const report = await BoardingReport.findById(req.params.id);
        if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

        // Authorization: Only creator or Admin
        const isAdmin = ['school_admin', 'assistant_admin', 'super_admin'].includes(req.user.role);
        if (report.createdBy.toString() !== req.user._id.toString() && !isAdmin) {
            return res.status(403).json({ success: false, message: 'Not authorized to delete this report.' });
        }

        await BoardingReport.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Report deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const StaffProfile = require('../models/StaffProfile');
const User = require('../models/User');

exports.getHouseParents = async (req, res) => {
    try {
        const schoolId = req.user.schoolId._id || req.user.schoolId;
        
        // Find all users who are house parents for this school
        const users = await User.find({ schoolId, role: 'house_parent' }).select('_id name');
        
        // Find corresponding staff profiles for more details (first/last name)
        const profiles = await StaffProfile.find({ schoolId, userId: { $in: users.map(u => u._id) } });
        
        // Join them to ensure we return everyone
        const result = users.map(u => {
            const profile = profiles.find(p => p.userId.toString() === u._id.toString());
            return {
                _id: u._id, // User ID for the select value
                name: profile ? `${profile.firstName} ${profile.lastName}` : u.name,
                profileId: profile?._id
            };
        });
        
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
