const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const Order = require('../models/Order');
const VacationRequest = require('../models/VacationRequest');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);
router.use(roleMiddleware(['hr', 'admin']));

// Получить все приказы
router.get('/', async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      employee_id: req.query.employee_id
    };
    const orders = await Order.findAll(filters);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Ошибка при получении приказов' });
  }
});

// Получить приказ по ID
router.get('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Приказ не найден' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Ошибка при получении приказа' });
  }
});

// Создать приказ
router.post('/', async (req, res) => {
  try {
    const { order_number, order_date, type, employee_id, vacation_request_id, content, signed_by } = req.body;

    if (!order_number || !order_date || !type || !employee_id || !content || !signed_by) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const order = await Order.create({
      order_number,
      order_date,
      type,
      employee_id,
      vacation_request_id,
      content,
      signed_by,
      created_by: req.user.employee_id
    });

    // Если привязывается vacation request, то помечает его как ordered
    if (vacation_request_id) {
      await VacationRequest.markOrdered(vacation_request_id);
    }

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Ошибка при создании приказа' });
  }
});

// Обновить приказ
router.put('/:id', async (req, res) => {
  try {
    const { order_number, order_date, content, signed_by } = req.body;

    if (!order_number || !order_date || !content || !signed_by) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const existingOrder = await Order.findById(req.params.id);
    if (!existingOrder) {
      return res.status(404).json({ error: 'Приказ не найден' });
    }

    const query = `
      UPDATE orders
      SET order_number = $1, order_date = $2, content = $3, signed_by = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING *
    `;
    const result = await pool.query(query, [order_number, order_date, content, signed_by, req.params.id]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Ошибка при обновлении приказа' });
  }
});

// Удалить приказ (вернуть vacation request в состояние pending, если связан с этим приказом)
router.delete('/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ error: 'Приказ не найден' });
    }

    const deleted = await Order.delete(req.params.id);

    // If linked to a vacation request, return it to pending
    if (order.vacation_request_id) {
      await VacationRequest.returnToPending(order.vacation_request_id);
    }

    res.json({ message: 'Приказ удалён', order: deleted });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Ошибка при удалении приказа' });
  }
});

module.exports = router;
