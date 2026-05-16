const pool = require('../config/db');

class Department {
  // Найти все подразделения
  static async findAll() {
    const result = await pool.query('SELECT * FROM departments ORDER BY name');
    return result.rows;
  }

  // Найти подразделение по ID
  static async findById(id) {
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = Department;