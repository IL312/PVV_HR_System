const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../middleware/authMiddleware');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await pool.query(
      `SELECT u.id, u.login, u.password_hash, u.employee_id, r.name as role 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.login = $1`,
      [login]
    );
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Логин и/или пароль не верны' });
    }

    const token = jwt.sign(
      { userId: user.id, login: user.login, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    let employeeData = null;
    if (user.employee_id) {
      const empResult = await pool.query('SELECT * FROM employees WHERE id = $1', [user.employee_id]);
      employeeData = empResult.rows[0];
    }

    res.json({
      token,
      user: {
        id: user.id,
        login: user.login,
        role: user.role,
        employee: employeeData
      }
    });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
