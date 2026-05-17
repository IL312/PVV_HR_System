const pool = require('../config/db');

class Employee {
  // Найти всех сотрудников
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        e.id,
        e.last_name,
        e.first_name,
        e.middle_name,
        e.passport,
        e.phone,
        e.email,
        e.birth_date,
        e.registration_address,
        e.hire_date,
        e.salary,
        e.status,
        d.name as department_name,
        d.id as department_id,
        p.title as position_title,
        p.id as position_id,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) as experience_years
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      params.push(filters.department_id);
      paramIndex++;
    }

    if (filters.position_id) {
      query += ` AND e.position_id = $${paramIndex}`;
      params.push(filters.position_id);
      paramIndex++;
    }

    if (filters.status && filters.status !== 'all') {
      query += ` AND e.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.min_salary) {
      query += ` AND e.salary >= $${paramIndex}`;
      params.push(filters.min_salary);
      paramIndex++;
    }

    if (filters.min_experience) {
      query += ` AND EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) >= $${paramIndex}`;
      params.push(filters.min_experience);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (e.last_name ILIKE $${paramIndex} OR e.first_name ILIKE $${paramIndex} OR e.middle_name ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    query += ' ORDER BY e.last_name, e.first_name';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Найти сотрудника по ID
  static async findById(id) {
    const query = `
      SELECT 
        e.*,
        d.name as department_name,
        d.id as department_id,
        p.title as position_title,
        p.id as position_id,
        p.base_salary,
        EXTRACT(YEAR FROM AGE(CURRENT_DATE, e.hire_date)) as experience_years
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN positions p ON e.position_id = p.id
      WHERE e.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Создать сотрудника
  static async create(employeeData) {
    const query = `
      INSERT INTO employees (
        last_name, first_name, middle_name, passport, snils, phone, email,
        birth_date, registration_address, department_id, position_id,
        hire_date, salary, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    
    const values = [
      employeeData.last_name,
      employeeData.first_name,
      employeeData.middle_name,
      employeeData.passport,
      employeeData.snils || null,
      employeeData.phone,
      employeeData.email,
      employeeData.birth_date,
      employeeData.registration_address || null,
      employeeData.department_id,
      employeeData.position_id,
      employeeData.hire_date,
      employeeData.salary,
      employeeData.status || 'active'
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Обновить сотрудника
  static async update(id, employeeData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    const updatableFields = [
      'last_name', 'first_name', 'middle_name', 'passport', 'snils',
      'phone', 'email', 'birth_date', 'registration_address',
      'department_id', 'position_id', 'hire_date', 'salary', 'status'
    ];

    for (const field of updatableFields) {
      if (employeeData[field] !== undefined) {
        fields.push(`${field} = $${paramIndex}`);
        values.push(employeeData[field]);
        paramIndex++;
      }
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE employees 
      SET ${fields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }
}

module.exports = Employee;