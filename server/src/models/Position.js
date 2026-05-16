const pool = require('../config/db');

class Position {
  // Найти все должности
  static async findAll() {
    const result = await pool.query('SELECT * FROM positions ORDER BY title');
    return result.rows;
  }

  // Найти должность по ID
  static async findById(id) {
    const result = await pool.query('SELECT * FROM positions WHERE id = $1', [id]);
    return result.rows[0];
  }
}

module.exports = Position;