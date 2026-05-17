const pool = require('../config/db');

class Order {
  // Получить все приказы
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        o.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name,
        cb.last_name || ' ' || cb.first_name as created_by_name,
        vr.start_date as vacation_start,
        vr.end_date as vacation_end,
        vr.type as vacation_type
      FROM orders o
      JOIN employees e ON o.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees cb ON o.created_by = cb.id
      LEFT JOIN vacation_requests vr ON o.vacation_request_id = vr.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.type) {
      query += ` AND o.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    if (filters.employee_id) {
      query += ` AND o.employee_id = $${paramIndex}`;
      params.push(filters.employee_id);
      paramIndex++;
    }

    query += ' ORDER BY o.order_date DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Получить приказ по ID
  static async findById(id) {
    const query = `
      SELECT 
        o.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name,
        cb.last_name || ' ' || cb.first_name as created_by_name,
        vr.start_date as vacation_start,
        vr.end_date as vacation_end,
        vr.type as vacation_type
      FROM orders o
      JOIN employees e ON o.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees cb ON o.created_by = cb.id
      LEFT JOIN vacation_requests vr ON o.vacation_request_id = vr.id
      WHERE o.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async findByVacationRequest(vacationRequestId) {
    const query = `
      SELECT * FROM orders
      WHERE vacation_request_id = $1
    `;
    
    const result = await pool.query(query, [vacationRequestId]);
    return result.rows[0];
  }

  static async create(data) {
    const query = `
      INSERT INTO orders (
        order_number, order_date, type, employee_id, vacation_request_id,
        content, signed_by, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    
    const values = [
      data.order_number,
      data.order_date,
      data.type,
      data.employee_id,
      data.vacation_request_id || null,
      data.content,
      data.signed_by,
      data.created_by || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async delete(id) {
    const query = `
      DELETE FROM orders WHERE id = $1 RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Order;
