const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { login, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE login = $1', [login]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    // Проверяем пароль (в реальном проекте он хеширован, здесь для демо упростим или используем bcrypt)
    // Если в БД пароль захеширован:
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Логин и/или пароль не верны' });
    }

    // Возвращаем данные пользователя (без пароля)
    // Нам нужно связать пользователя с сотрудником, чтобы получить его данные для профиля
    let employeeData = null;
    if (user.employee_id) {
        const empResult = await pool.query('SELECT * FROM employees WHERE id = $1', [user.employee_id]);
        employeeData = empResult.rows[0];
    }

    res.json({
      token: 'mock-jwt-token-' + Date.now(), // В реальности здесь JWT
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