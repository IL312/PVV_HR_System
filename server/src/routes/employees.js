const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Apply auth to all employee routes
router.use(authMiddleware);

// Get all employees with filters
router.get('/', async (req, res) => {
  try {
    // common users can only see their own profile
    if (req.user.role === 'common') {
      const employee = await Employee.findById(req.user.employee_id);
      return res.json(employee ? [employee] : []);
    }

    const filters = {
      department_id: req.query.department_id,
      position_id: req.query.position_id,
      status: req.query.status,
      min_salary: req.query.min_salary,
      min_experience: req.query.min_experience,
      search: req.query.search
    };

    const employees = await Employee.findAll(filters);
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get employee by ID
router.get('/:id', async (req, res) => {
  try {
    // common users can only view their own profile
    if (req.user.role === 'common' && req.params.id !== String(req.user.employee_id)) {
      return res.status(403).json({ error: 'Недостаточно прав для просмотра' });
    }

    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Get all departments
router.get('/meta/departments', async (req, res) => {
  try {
    const departments = await Department.findAll();
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

// Get all positions
router.get('/meta/positions', async (req, res) => {
  try {
    const positions = await Position.findAll();
    res.json(positions);
  } catch (error) {
    console.error('Error fetching positions:', error);
    res.status(500).json({ error: 'Failed to fetch positions' });
  }
});

// Create new employee — admin and hr only
router.post('/', roleMiddleware(['admin', 'hr']), async (req, res) => {
  try {
    const employeeData = req.body;
    
    const requiredFields = ['last_name', 'first_name', 'passport', 'phone', 'email', 'birth_date', 'department_id', 'position_id', 'hire_date', 'salary'];
    const missingFields = requiredFields.filter(field => !employeeData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}` 
      });
    }

    const existingPassport = await pool.query(
      'SELECT id FROM employees WHERE passport = $1',
      [employeeData.passport]
    );
    
    if (existingPassport.rows.length > 0) {
      return res.status(400).json({ error: 'Сотрудник с таким паспортом уже существует' });
    }

    const existingEmail = await pool.query(
      'SELECT id FROM employees WHERE email = $1',
      [employeeData.email]
    );
    
    if (existingEmail.rows.length > 0) {
      return res.status(400).json({ error: 'Сотрудник с таким email уже существует' });
    }

    const newEmployee = await Employee.create(employeeData);
    res.status(201).json(newEmployee);
    console.log('✅ Employee added successfully');
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Update employee — admin only
router.put('/:id', roleMiddleware(['admin']), async (req, res) => {
  try {
    const employeeData = req.body;

    const existingEmployee = await Employee.findById(req.params.id);
    if (!existingEmployee) {
      return res.status(404).json({ error: 'Сотрудник не найден' });
    }

    const updatedEmployee = await Employee.update(req.params.id, employeeData);
    res.json(updatedEmployee);
    console.log('✅ Employee updated successfully');
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

module.exports = router;
