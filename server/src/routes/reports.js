const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['admin', 'head', 'hr', 'acc']));

// 1. Общее количество сотрудников по департаментам
router.get('/employee-count', async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT 
        d.name, 
        COUNT(e.id) as value,
        COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN e.status IN ('vacation', 'sick') THEN 1 END) as absent
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      WHERE 1=1
    `;
    const params = [];
    if (department_id) {
      query += ` AND d.id = $1`;
      params.push(department_id);
    }
    query += ` GROUP BY d.id, d.name ORDER BY value DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 2. Карьерный рост
router.get('/career-growth', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    let query = `
      SELECT 
        e.last_name || ' ' || e.first_name as employee,
        d.name as department,
        ct.name as type_name,
        c.order_date,
        c.basis
      FROM careers c
      JOIN employees e ON c.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      JOIN career_types ct ON c.type_id = ct.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (department_id) {
      query += ` AND e.department_id = $${idx}`;
      params.push(department_id);
      idx++;
    }

    if (start_date && end_date) {
      query += ` AND c.order_date BETWEEN $${idx} AND $${idx + 1}`;
      params.push(start_date, end_date);
    }

    query += ` ORDER BY c.order_date DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Текучесть кадров
router.get('/turnover', async (req, res) => {
  try {
    const query = `
      SELECT 
        d.name as department,
        COUNT(e.id) as total_employees,
        COUNT(CASE WHEN e.status = 'dismissed' THEN 1 END) as dismissed_count,
        ROUND(
          COUNT(CASE WHEN e.status = 'dismissed' THEN 1 END)::numeric / 
          NULLIF(COUNT(e.id), 0) * 100, 2
        ) as turnover_percent
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      GROUP BY d.id, d.name
      ORDER BY turnover_percent DESC NULLS LAST
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Фонд заработной платы
router.get('/payroll', async (req, res) => {
  try {
    const query = `
      SELECT 
        COALESCE(d.name, 'ИТОГО') as department,
        COUNT(e.id) as employee_count,
        SUM(e.salary) as total_salary,
        ROUND(AVG(e.salary), 2) as avg_salary
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
      GROUP BY GROUPING SETS ((d.name), ())
      ORDER BY department NULLS LAST
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. График отпусков (из vacation_requests со статусом approved/ordered)
router.get('/vacations', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    let query = `
      SELECT 
        e.last_name || ' ' || e.first_name as employee,
        d.name as department,
        vr.start_date,
        vr.end_date,
        vr.type,
        vr.status
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE vr.status IN ('approved', 'ordered')
    `;
    
    const params = [];
    let paramIndex = 1;

    if (department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }

    if (start_date && end_date) {
      query += ` AND vr.start_date <= $${paramIndex} AND vr.end_date >= $${paramIndex + 1}`;
      params.push(end_date, start_date);
    } else if (start_date) {
      query += ` AND vr.end_date >= $${paramIndex}`;
      params.push(start_date);
    } else if (end_date) {
      query += ` AND vr.start_date <= $${paramIndex}`;
      params.push(end_date);
    }

    query += ` ORDER BY vr.start_date ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Отсутствие сотрудников
router.get('/absences', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.last_name || ' ' || e.first_name as employee,
        d.name as department,
        e.status,
        e.hire_date as since_date
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      WHERE e.status IN ('vacation', 'sick')
      ORDER BY employee
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Данные для графика: сотрудники по отделам (Pie Chart)
router.get('/chart/employees-by-dept', async (req, res) => {
  const query = `
    SELECT d.name, 
           COUNT(e.id) as value,
           COUNT(CASE WHEN e.status = 'active' THEN 1 END) as active
    FROM departments d
    LEFT JOIN employees e ON d.id = e.department_id
    GROUP BY d.id, d.name ORDER BY value DESC;
  `;
  const result = await pool.query(query);
  res.json(result.rows);
});

// 8. Данные для графика: фонд ЗП по отделам (Bar Chart)
router.get('/chart/payroll-by-dept', async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT d.name, SUM(e.salary) as value, COUNT(e.id) as employee_count
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
    `;
    const params = [];
    if (department_id) {
      query += ` AND d.id = $1`;
      params.push(department_id);
    }
    query += ` GROUP BY d.id, d.name ORDER BY value DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 9. Данные для графика: текучесть кадров (Pie Chart)
router.get('/chart/turnover-pie', async (req, res) => {
  try {
    const { department_id } = req.query;
    const params = [];
    const query = `
      SELECT 
        CASE status 
          WHEN 'active' THEN 'Работает' 
          WHEN 'vacation' THEN 'В отпуске' 
          WHEN 'sick' THEN 'На больничном' 
          ELSE 'Уволен' 
        END as name,
        COUNT(*) as value,
        CASE status
          WHEN 'active' THEN '#28a745'
          WHEN 'vacation' THEN '#ffc107'
          WHEN 'sick' THEN '#dc3545'
          ELSE '#6c757d'
        END as color
      FROM employees
      WHERE 1=1 ${department_id ? 'AND department_id = $1' : ''}
      GROUP BY status
    `;

    if (department_id) params.push(department_id);
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. Данные для графика: отпуска по месяцам (Line Chart) — из vacation_requests
router.get('/chart/vacations-by-month', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    
    let query = `
      SELECT 
        TO_CHAR(vr.start_date, 'YYYY-MM') as month,
        COUNT(vr.id) as value
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      WHERE vr.status IN ('approved', 'ordered')
    `;
    const params = [];
    let idx = 1;

    if (department_id) {
      query += ` AND e.department_id = $${idx}`;
      params.push(department_id);
      idx++;
    }

    if (start_date && end_date) {
      query += ` AND vr.start_date <= $${idx} AND vr.end_date >= $${idx + 1}`;
      params.push(end_date, start_date);
    }

    query += ` GROUP BY TO_CHAR(vr.start_date, 'YYYY-MM') ORDER BY month ASC`;

    const result = await pool.query(query, params);
    
    const formatted = result.rows.map(row => ({
      ...row,
      month: new Date(row.month + '-01').toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' }),
      value: Number(row.value)
    }));
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 11. Данные для графика: карьерные изменения по типам (Pie Chart)
router.get('/chart/career-types', async (req, res) => {
  try {
    const query = `
      SELECT 
        ct.name,
        COUNT(c.id)::integer as value
      FROM careers c
      JOIN career_types ct ON c.type_id = ct.id
      GROUP BY ct.id, ct.name
      ORDER BY value DESC
    `;
    const result = await pool.query(query);
    const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'];
    res.json(result.rows.map((row, i) => ({
      ...row,
      name: row.name,
      value: row.value,
      color: colors[i % colors.length]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
