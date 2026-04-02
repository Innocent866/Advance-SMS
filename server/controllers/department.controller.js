const Department = require('../models/Department');
const Teacher = require('../models/Teacher');
const User = require('../models/User');

// Create Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, hodId, description } = req.body;
        const schoolId = req.user.schoolId;

        const department = await Department.create({
            schoolId,
            name,
            hodId,
            description
        });

        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all departments for a school
exports.getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find({ schoolId: req.user.schoolId })
            .populate('hodId', 'name email');

        res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update Department
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findOneAndUpdate(
            { _id: req.params.id, schoolId: req.user.schoolId },
            req.body,
            { new: true, runValidators: true }
        );

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findOneAndDelete({
            _id: req.params.id,
            schoolId: req.user.schoolId
        });

        if (!department) {
            return res.status(404).json({ success: false, message: 'Department not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Department removed'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
