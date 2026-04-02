const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect);

router.post('/', admin, departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.put('/:id', admin, departmentController.updateDepartment);
router.delete('/:id', admin, departmentController.deleteDepartment);

module.exports = router;
