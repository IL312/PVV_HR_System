const pool = require('../config/db');

class VacationRequest {
  // Найти все заявки на отпуск
  static async findAll(filters = {}) {
    let query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name,
        a.last_name || ' ' || a.first_name as approver_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees a ON vr.approver_id = a.id
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.employee_id) {
      query += ` AND vr.employee_id = $${paramIndex}`;
      params.push(filters.employee_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND vr.status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    if (filters.department_id) {
      query += ` AND e.department_id = $${paramIndex}`;
      params.push(filters.department_id);
      paramIndex++;
    }

    if (filters.type) {
      query += ` AND vr.type = $${paramIndex}`;
      params.push(filters.type);
      paramIndex++;
    }

    query += ' ORDER BY vr.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  // Найти заявку по ID сотрудника
  static async findByEmployee(employeeId) {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name,
        a.last_name || ' ' || a.first_name as approver_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees a ON vr.approver_id = a.id
      WHERE vr.employee_id = $1
      ORDER BY vr.created_at DESC
    `;
    
    const result = await pool.query(query, [employeeId]);
    return result.rows;
  }

  // Найти заявку, ожидающую утверждения для конкретного отдела
  static async findPendingByDepartment(departmentId) {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      JOIN departments d ON e.department_id = d.id
      WHERE vr.status = 'pending' AND e.department_id = $1
      ORDER BY vr.created_at ASC
    `;
    
    const result = await pool.query(query, [departmentId]);
    return result.rows;
  }

  // Найти все заявки, ожидающие утверждения
  static async findAllPending() {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Найти все заявки, оформленные в приказе
  static async findAllOrdered() {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE vr.status = 'ordered'
      ORDER BY vr.approval_date DESC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Найти все утвержденные заявки
  static async findAllApproved() {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE vr.status = 'approved'
      ORDER BY vr.approval_date ASC
    `;
    
    const result = await pool.query(query);
    return result.rows;
  }

  // Найти заявку по ID
  static async findById(id) {
    const query = `
      SELECT 
        vr.*,
        e.last_name || ' ' || e.first_name || ' ' || e.middle_name as employee_name,
        d.name as department_name,
        e.department_id,
        a.last_name || ' ' || a.first_name as approver_name
      FROM vacation_requests vr
      JOIN employees e ON vr.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN employees a ON vr.approver_id = a.id
      WHERE vr.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Создать заявку
  static async create(data) {
    const query = `
      INSERT INTO vacation_requests (
        employee_id, start_date, end_date, type, comment
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      data.employee_id,
      data.start_date,
      data.end_date,
      data.type,
      data.comment || null
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Утвердить заявку
  static async approve(id, approverId) {
    const query = `
      UPDATE vacation_requests
      SET status = 'approved', approver_id = $1, 
        approval_date = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `;
    
    const result = await pool.query(query, [approverId, id]);
    return result.rows[0];
  }

  // Отправить заявку на повторное согласование
  static async reject(id, approverId, reason) {
    const query = `
      UPDATE vacation_requests
      SET status = 'rejected', approver_id = $1, rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [approverId, reason, id]);
    return result.rows[0];
  }

  // Отменить заявку
  static async cancel(id, requesterId) {
    const query = `
      UPDATE vacation_requests
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND employee_id = $2 AND status = 'pending'
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, requesterId]);
    return result.rows[0];
  }

  // Пометить заявку как вошедшую в приказ
  static async markOrdered(id) {
    const query = `
      UPDATE vacation_requests
      SET status = 'ordered', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Вернуть статус заявки в ожидание
  static async returnToPending(id) {
    const query = `
      UPDATE vacation_requests
      SET status = 'pending', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = VacationRequest;
