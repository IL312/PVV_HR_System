const express = require('express');
const router = express.Router();
const VacationRequest = require('../models/VacationRequest');
const { authMiddleware } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.use(authMiddleware);

// Create vacation request
router.post('/', async (req, res) => {
  try {
    const { employee_id, start_date, end_date, type, comment } = req.body;

    if (!start_date || !end_date || !type) {
      return res.status(400).json({ error: 'Укажите даты и тип отпуска' });
    }

    if (new Date(end_date) < new Date(start_date)) {
      return res.status(400).json({ error: 'Дата окончания не может быть раньше даты начала' });
    }

    // common users can only create for themselves
    const targetEmployeeId = req.user.role === 'common' ? req.user.employee_id : employee_id;

    if (!targetEmployeeId) {
      return res.status(400).json({ error: 'Укажите сотрудника' });
    }

    const request = await VacationRequest.create({
      employee_id: targetEmployeeId,
      start_date,
      end_date,
      type,
      comment
    });

    res.status(201).json(request);
  } catch (error) {
    console.error('Error creating vacation request:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
});

// Get my / department / all requests
router.get('/my', async (req, res) => {
  try {
    let requests;

    if (req.user.role === 'common') {
      requests = await VacationRequest.findByEmployee(req.user.employee_id);
    } else if (req.user.role === 'head') {
      requests = await VacationRequest.findAll({ department_id: req.user.employee?.department_id });
    } else {
      requests = await VacationRequest.findAll();
    }

    res.json(requests);
  } catch (error) {
    console.error('Error fetching vacation requests:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Get pending requests for approval (head, admin)
router.get('/pending', roleMiddleware(['head', 'admin']), async (req, res) => {
  try {
    let requests;

    if (req.user.role === 'head') {
      requests = await VacationRequest.findPendingByDepartment(req.user.employee?.department_id);
    } else {
      requests = await VacationRequest.findAllPending();
    }

    res.json(requests);
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Get ordered requests (hr, admin)
router.get('/ordered', roleMiddleware(['hr', 'admin']), async (req, res) => {
  try {
    const requests = await VacationRequest.findAllOrdered();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching ordered requests:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Get approved requests for order creation (hr, admin)
router.get('/approved', roleMiddleware(['hr', 'admin']), async (req, res) => {
  try {
    const requests = await VacationRequest.findAllApproved();
    res.json(requests);
  } catch (error) {
    console.error('Error fetching approved requests:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Approve request (head, admin)
router.put('/:id/approve', roleMiddleware(['head', 'admin']), async (req, res) => {
  try {
    const request = await VacationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Заявка уже обработана' });
    }

    // head can only approve requests from their department
    if (req.user.role === 'head' && request.department_id !== req.user.employee?.department_id) {
      return res.status(403).json({ error: 'Недостаточно прав для утверждения этой заявки' });
    }

    const updated = await VacationRequest.approve(req.params.id, req.user.employee_id);
    res.json(updated);
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: 'Ошибка при утверждении заявки' });
  }
});

// Reject request (head, admin)
router.put('/:id/reject', roleMiddleware(['head', 'admin']), async (req, res) => {
  try {
    const { reason } = req.body;
    const request = await VacationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Заявка уже обработана' });
    }

    if (req.user.role === 'head' && request.department_id !== req.user.employee?.department_id) {
      return res.status(403).json({ error: 'Недостаточно прав для отклонения этой заявки' });
    }

    const updated = await VacationRequest.reject(req.params.id, req.user.employee_id, reason || 'Без указания причины');
    res.json(updated);
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: 'Ошибка при отклонении заявки' });
  }
});

// Cancel request (requester, admin)
router.put('/:id/cancel', async (req, res) => {
  try {
    const request = await VacationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Можно отменить только ожидающую заявку' });
    }

    if (req.user.role !== 'admin' && request.employee_id !== req.user.employee_id) {
      return res.status(403).json({ error: 'Можно отменить только свою заявку' });
    }

    const updated = await VacationRequest.cancel(req.params.id, req.user.employee_id);
    if (!updated) {
      return res.status(400).json({ error: 'Не удалось отменить заявку' });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ error: 'Ошибка при отмене заявки' });
  }
});

// Return to pending (hr, admin) — when HR rejects an order
router.put('/:id/return', roleMiddleware(['hr', 'admin']), async (req, res) => {
  try {
    const request = await VacationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ error: 'Заявка не найдена' });
    }

    if (request.status !== 'ordered') {
      return res.status(400).json({ error: 'Можно вернуть только заявку с оформленным приказом' });
    }

    const updated = await VacationRequest.returnToPending(req.params.id);
    res.json(updated);
  } catch (error) {
    console.error('Error returning request:', error);
    res.status(500).json({ error: 'Ошибка при возврате заявки' });
  }
});

module.exports = router;
