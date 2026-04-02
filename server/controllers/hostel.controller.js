const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Student = require('../models/Student');

// --- Hostel Management ---

// Create a new hostel
exports.createHostel = async (req, res) => {
    try {
        const { name, type, capacity, wardenId, houseParentId, location, description } = req.body;
        const schoolId = req.user.schoolId;

        const hostel = new Hostel({
            name,
            type,
            capacity,
            wardenId,
            houseParentId,
            location,
            description,
            schoolId
        });

        await hostel.save();
        res.status(201).json({ success: true, data: hostel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all hostels for a school
exports.getAllHostels = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        const hostels = await Hostel.find({ schoolId })
            .populate('wardenId', 'firstName lastName')
            .populate('houseParentId', 'firstName lastName name');
        res.status(200).json({ success: true, data: hostels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update hostel details
exports.updateHostel = async (req, res) => {
    try {
        const { name, type, capacity, wardenId, houseParentId, location, description } = req.body;
        const hostel = await Hostel.findByIdAndUpdate(
            req.params.id, 
            { name, type, capacity, wardenId, houseParentId, location, description }, 
            { new: true }
        ).populate('wardenId', 'firstName lastName')
         .populate('houseParentId', 'firstName lastName name');
         
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        res.status(200).json({ success: true, data: hostel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete hostel
exports.deleteHostel = async (req, res) => {
    try {
        const hostel = await Hostel.findByIdAndDelete(req.params.id);
        if (!hostel) return res.status(404).json({ success: false, message: 'Hostel not found' });
        
        // Also delete associated rooms? 
        // For safety, let's just delete the hostel and warn if rooms exist, or delete all.
        await Room.deleteMany({ hostelId: req.params.id });
        
        res.status(200).json({ success: true, message: 'Hostel and associated rooms deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// --- Room Management ---

// Add a room to a hostel
exports.addRoom = async (req, res) => {
    try {
        const { hostelId, roomNumber, capacity } = req.body;
        
        const room = new Room({
            hostelId,
            roomNumber,
            capacity
        });

        await room.save();
        res.status(201).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get rooms in a specific hostel
exports.getHostelRooms = async (req, res) => {
    try {
        const rooms = await Room.find({ hostelId: req.params.hostelId });
        res.status(200).json({ success: true, data: rooms });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update room details
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.status(200).json({ success: true, data: room });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete room
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
        res.status(200).json({ success: true, message: 'Room deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all students in a hostel
exports.getHostelStudents = async (req, res) => {
    try {
        const students = await Student.find({ hostelId: req.params.hostelId })
            .populate('roomId', 'roomNumber');
        res.status(200).json({ success: true, data: students });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
