const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const Position = require('../models/Position');

// Get all employees with filters
router.get('/', async (req, res) => {
  try {
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

// Create new employee
router.post('/', async (req, res) => {
  try {
    const employeeData = req.body;
    
    // Валидация обязательных полей
    const requiredFields = ['last_name', 'first_name', 'passport', 'phone', 'email', 'birth_date', 'department_id', 'position_id', 'hire_date', 'salary'];
    const missingFields = requiredFields.filter(field => !employeeData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}` 
      });
    }

    // Проверяем уникальность passport и email
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

module.exports = router;