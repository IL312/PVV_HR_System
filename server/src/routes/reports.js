const express = require('express');
const router = express.Router();
const pool = require('../config/db');

const buildFilters = (req) => {
  const { department_id, start_date, end_date } = req.query;
  let querySuffix = '';
  const params = [];
  let paramIndex = 1;

  if (department_id) {
    querySuffix += ` AND e.department_id = $${paramIndex}`;
    params.push(department_id);
    paramIndex++;
  }

  // Для отчетов, где есть даты (например, вакансии или карьера)
  if (start_date && end_date) {
     // Пример для точной даты: date_column BETWEEN ...
     // Но для интервалов (отпуска) логика будет другой в самих запросах
     querySuffix += ` AND date_placeholder >= $${paramIndex} AND date_placeholder <= $${paramIndex + 1}`;
     params.push(start_date, end_date);
     paramIndex += 2;
  }

  return { querySuffix, params };
};

// 1. Общее количество сотрудников по департаментам +
router.get('/employee-count', async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT 
             d.name as name, 
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

// 2. Карьерный рост +
router.get('/career-growth', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    let query = `
      SELECT 
        e.last_name || ' ' || e.first_name as employee,
        d.name as department,
        ct.name as type_name,
        c.order_date as date,
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

    // Для карьеры используем BETWEEN, так как это точка во времени
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
        d.name as "Департамент",
        COUNT(e.id) as "Кол-во сотрудников",
        COUNT(CASE WHEN e.status = 'dismissed' THEN 1 END) as "Кол-во ушедших",
        ROUND(
          COUNT(CASE WHEN e.status = 'dismissed' THEN 1 END)::numeric / 
          NULLIF(COUNT(e.id), 0) * 100, 2
        ) as "Процент текучки"
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      GROUP BY d.id, d.name
      ORDER BY "Процент текучки" DESC NULLS LAST
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
        COALESCE(d.name, 'ИТОГО') as "Департамент",
        COUNT(e.id) as "Кол-во сотрудников",
        SUM(e.salary) as "Общая выручка",
        ROUND(AVG(e.salary), 2) as "Средняя ЗП"
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.status = 'active'
      GROUP BY GROUPING SETS ((d.name), ())
      ORDER BY "Департамент" NULLS LAST
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. График отпусков ++
router.get('/vacations', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    let query = `
      SELECT 
        e.last_name || ' ' || e.first_name as employee,
        d.name as department,
        v.start_date,
        v.end_date,
        v.type
      FROM vacations v
      JOIN employees e ON v.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      params.push(department_id);
      paramIndex++;
    }

    // Те же условия пересечения для таблицы
    if (start_date && end_date) {
      query += ` AND v.start_date <= $${paramIndex} AND v.end_date >= $${paramIndex + 1}`;
      params.push(end_date, start_date);
    } else if (start_date) {
      query += ` AND v.end_date >= $${paramIndex}`;
      params.push(start_date);
    } else if (end_date) {
      query += ` AND v.start_date <= $${paramIndex}`;
      params.push(end_date);
    }

    query += ` ORDER BY v.start_date ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. Отсутствие сотрудников
router.get('/absences', async (req, res) => {
  try {
    const query = `
      SELECT 
        e.last_name || ' ' || e.first_name as "Сотрудник",
        d.name as "Департамент",
        CASE 
          WHEN e.status = 'vacation' THEN 'В отпуске'
          WHEN e.status = 'sick' THEN 'На больничном'
          ELSE e.status 
        END as "Причина",
        e.hire_date as since_date
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      WHERE e.status IN ('vacation', 'sick')
      ORDER BY "Сотрудник"
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Данные для графика: сотрудники по отделам (Bar Chart)
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

// 8. Данные для графика: фонд ЗП по отделам (Bar Chart) +
router.get('/chart/payroll-by-dept', async (req, res) => {
  try {
    const { department_id } = req.query;
    let query = `
      SELECT d.name as name, SUM(e.salary) as value, COUNT(e.id) as employee_count
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

// 9. Данные для графика: текучесть кадров (Pie Chart) +
router.get('/chart/turnover-pie', async (req, res) => {
  try {
    const { department_id } = req.query;
    let baseQuery = `FROM employees WHERE 1=1`;
    const params = [];
    if (department_id) {
      baseQuery += ` AND department_id = $1`;
      params.push(department_id);
    }

    // Union все еще нужен, но с общим WHERE
    const query = `
      SELECT 'Работает' as name, COUNT(*) as value, '#28a745' as color ${baseQuery} AND status = 'active'
      UNION ALL
      SELECT 'В отпуске', COUNT(*), '#ffc107' ${baseQuery} AND status = 'vacation'
      UNION ALL
      SELECT 'На больничном', COUNT(*), '#dc3545' ${baseQuery} AND status = 'sick'
      UNION ALL
      SELECT 'Уволен', COUNT(*), '#6c757d' ${baseQuery} AND status = 'dismissed'
    `;
    
    // Примечание: UNION ALL с разными WHERE условиями требует аккуратности. 
    // Проще сделать группировку:
    const simpleQuery = `
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

    const result = await pool.query(simpleQuery, params);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 10. Данные для графика: отпуска по месяцам (Line Chart) +
router.get('/chart/vacations-by-month', async (req, res) => {
  try {
    const { department_id, start_date, end_date } = req.query;
    
    // Базовый запрос
    let query = `
      SELECT 
        TO_CHAR(v.start_date, 'YYYY-MM') as month,
        COUNT(v.id) as value
      FROM vacations v
      JOIN employees e ON v.employee_id = e.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (department_id) {
      query += ` AND e.department_id = $${idx}`;
      params.push(department_id);
      idx++;
    }

    // ЛОГИКА ПЕРЕСЕЧЕНИЯ ИНТЕРВАЛОВ:
    // Запись берется, если она началась ДО конца фильтра И закончилась ПОСЛЕ начала фильтра
    if (start_date && end_date) {
      query += ` AND v.start_date <= $${idx} AND v.end_date >= $${idx + 1}`;
      params.push(end_date, start_date); // Обратите внимание на порядок аргументов
    }

    query += ` GROUP BY TO_CHAR(v.start_date, 'YYYY-MM') ORDER BY month ASC`;

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
        ct.name as name,
        COUNT(c.id)::integer as value
      FROM careers c
      JOIN career_types ct ON c.type_id = ct.id
      GROUP BY ct.id, ct.name
      ORDER BY value DESC
    `;
    const result = await pool.query(query);
    // Добавляем цвета
    const colors = ['#007bff', '#28a745', '#ffc107', '#17a2b8', '#6f42c1'];
    res.json(result.rows.map((row, i) => ({
      ...row,
      color: colors[i % colors.length]
    })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;