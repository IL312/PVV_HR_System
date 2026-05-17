import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vacationApi, orderApi } from '../api/vacationApi';
import VacationStatusBadge from '../components/VacationStatusBadge';
import { useRole, ROLES } from '../hooks/useRole';
import type { VacationRequest, Order } from '../types';
import './Vacations.css';

const VACATION_TYPE_LABELS: Record<string, string> = {
  annual: 'Ежегодный',
  unpaid: 'Без содержания',
  maternity: 'Декретный',
  sick: 'Больничный',
};

const VacationOrders: React.FC = () => {
  const navigate = useNavigate();
  const [approvedRequests, setApprovedRequests] = useState<VacationRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [orderModal, setOrderModal] = useState<{
    vacationRequestId: number | null;
    employeeId: number;
    employeeName: string;
    startDate: string;
    endDate: string;
    vacationType: string;
    existingOrderId: number | null;
  } | null>(null);
  const [orderForm, setOrderForm] = useState({
    order_number: '',
    order_date: '',
    content: '',
    signed_by: ''
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approved, allOrders] = await Promise.all([
        vacationApi.getApproved(),
        orderApi.getAll({ type: 'vacation' })
      ]);
      setApprovedRequests(approved);
      setOrders(allOrders);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const openOrderModalForRequest = (req: VacationRequest) => {
    setOrderModal({
      vacationRequestId: req.id,
      employeeId: req.employee_id,
      employeeName: req.employee_name,
      startDate: req.start_date,
      endDate: req.end_date,
      vacationType: req.type,
      existingOrderId: null
    });
    setOrderForm({
      order_number: '',
      order_date: new Date().toISOString().split('T')[0],
      content: `Предоставить ${VACATION_TYPE_LABELS[req.type].toLowerCase()} отпуск сотруднику ${req.employee_name} сроком с ${new Date(req.start_date).toLocaleDateString('ru-RU')} по ${new Date(req.end_date).toLocaleDateString('ru-RU')}.`,
      signed_by: ''
    });
  };

  const openOrderModalForEdit = (order: Order) => {
    setOrderModal({
      vacationRequestId: order.vacation_request_id || null,
      employeeId: order.employee_id,
      employeeName: order.employee_name,
      startDate: order.vacation_start || '',
      endDate: order.vacation_end || '',
      vacationType: order.vacation_type || '',
      existingOrderId: order.id
    });
    setOrderForm({
      order_number: order.order_number,
      order_date: order.order_date,
      content: order.content,
      signed_by: order.signed_by
    });
  };

  const handleSaveOrder = async () => {
    if (!orderForm.order_number || !orderForm.order_date || !orderForm.content || !orderForm.signed_by) return;

    try {
      setProcessing(true);
      if (orderModal!.existingOrderId) {
        await orderApi.update(orderModal!.existingOrderId, {
          order_number: orderForm.order_number,
          order_date: orderForm.order_date,
          content: orderForm.content,
          signed_by: orderForm.signed_by
        });
      } else {
        await orderApi.create({
          order_number: orderForm.order_number,
          order_date: orderForm.order_date,
          type: 'vacation',
          employee_id: orderModal!.employeeId,
          vacation_request_id: orderModal!.vacationRequestId || undefined,
          content: orderForm.content,
          signed_by: orderForm.signed_by
        });
      }
      setOrderModal(null);
      fetchData();
    } catch (error) {
      console.error('Error saving order:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteOrder = async (orderId: number, vacationRequestId?: number) => {
    try {
      if (vacationRequestId) await vacationApi.returnToPending(vacationRequestId);
      await orderApi.delete(orderId);
      fetchData();
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div>
      <h2>Утверждённые заявки (оформить приказ)</h2>
      {approvedRequests.length === 0 ? (
        <div className="no-data">Нет утверждённых заявок без приказа</div>
      ) : (
        <div className="vacations-table-wrapper">
          <table className="vacations-table">
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Отдел</th>
                <th>Тип</th>
                <th>Начало</th>
                <th>Окончание</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {approvedRequests.map(req => (
                <tr key={req.id}>
                  <td>{req.employee_name}</td>
                  <td>{req.department_name}</td>
                  <td>{VACATION_TYPE_LABELS[req.type]}</td>
                  <td>{new Date(req.start_date).toLocaleDateString('ru-RU')}</td>
                  <td>{new Date(req.end_date).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => openOrderModalForRequest(req)}>
                      Создать приказ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 style={{ marginTop: '30px' }}>Оформленные приказы</h2>
      {orders.length === 0 ? (
        <div className="no-data">Нет оформленных приказов</div>
      ) : (
        <div className="vacations-table-wrapper">
          <table className="vacations-table">
            <thead>
              <tr>
                <th>№ приказа</th>
                <th>Дата</th>
                <th>Сотрудник</th>
                <th>Подписант</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{new Date(order.order_date).toLocaleDateString('ru-RU')}</td>
                  <td>{order.employee_name}</td>
                  <td>{order.signed_by}</td>
                  <td className="actions-cell">
                    <button className="btn btn-sm btn-secondary" onClick={() => openOrderModalForEdit(order)}>
                      Редактировать
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDeleteOrder(order.id, order.vacation_request_id)}>
                      Отклонить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {orderModal && (
        <div className="modal-overlay" onClick={() => setOrderModal(null)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <h3>{orderModal.existingOrderId ? 'Редактировать приказ' : 'Создать приказ на отпуск'}</h3>
            <p className="modal-employee">
              Сотрудник: <strong>{orderModal.employeeName}</strong>
              {orderModal.startDate && (
                <> | Период: <strong>{new Date(orderModal.startDate).toLocaleDateString('ru-RU')} — {new Date(orderModal.endDate).toLocaleDateString('ru-RU')}</strong></>
              )}
            </p>
            <div className="form-row">
              <div className="form-group">
                <label>Номер приказа *</label>
                <input type="text" value={orderForm.order_number} onChange={e => setOrderForm(p => ({ ...p, order_number: e.target.value }))} placeholder="П-001" />
              </div>
              <div className="form-group">
                <label>Дата приказа *</label>
                <input type="date" value={orderForm.order_date} onChange={e => setOrderForm(p => ({ ...p, order_date: e.target.value }))} />
              </div>
            </div>
            <div className="form-group">
              <label>Подписант *</label>
              <input type="text" value={orderForm.signed_by} onChange={e => setOrderForm(p => ({ ...p, signed_by: e.target.value }))} placeholder="ФИО подписанта" />
            </div>
            <div className="form-group">
              <label>Текст приказа *</label>
              <textarea value={orderForm.content} onChange={e => setOrderForm(p => ({ ...p, content: e.target.value }))} rows={5} />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => setOrderModal(null)}>Отмена</button>
              <button className="btn btn-primary" onClick={handleSaveOrder} disabled={processing}>
                {processing ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Vacations: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useRole();
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'requests' | 'approve' | 'orders'>('requests');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await vacationApi.getMy();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching vacation requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await vacationApi.cancel(id);
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
    }
  };

  const filteredRequests = filter === 'all'
    ? requests
    : requests.filter(r => r.status === filter);

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="vacations-page">
      <div className="vacations-header">
        <h1>Документы</h1>
        <button className="btn btn-primary" onClick={() => navigate('/vacations/new')}>
          Новая заявка
        </button>
      </div>

      <div className="vacations-tabs">
        <button
          className={`tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Заявки
        </button>
        {hasAnyRole([ROLES.HEAD, ROLES.ADMIN]) && (
          <button
            className={`tab-btn ${activeTab === 'approve' ? 'active' : ''}`}
            onClick={() => setActiveTab('approve')}
          >
            Утверждение ({requests.filter(r => r.status === 'pending').length})
          </button>
        )}
        {hasAnyRole([ROLES.HR, ROLES.ADMIN]) && (
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Приказы
          </button>
        )}
      </div>

      {activeTab === 'requests' && (
        <>
          <div className="vacations-filters">
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>Все ({requests.length})</button>
            <button className={`filter-btn ${filter === 'pending' ? 'active' : ''}`} onClick={() => setFilter('pending')}>Ожидает ({requests.filter(r => r.status === 'pending').length})</button>
            <button className={`filter-btn ${filter === 'approved' ? 'active' : ''}`} onClick={() => setFilter('approved')}>Утверждено ({requests.filter(r => r.status === 'approved').length})</button>
            <button className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`} onClick={() => setFilter('rejected')}>Отклонено ({requests.filter(r => r.status === 'rejected').length})</button>
            <button className={`filter-btn ${filter === 'ordered' ? 'active' : ''}`} onClick={() => setFilter('ordered')}>Приказ оформлен ({requests.filter(r => r.status === 'ordered').length})</button>
          </div>

          {filteredRequests.length === 0 ? (
            <div className="no-data">Нет заявок</div>
          ) : (
            <div className="vacations-table-wrapper">
              <table className="vacations-table">
                <thead>
                  <tr>
                    <th>Сотрудник</th>
                    <th>Отдел</th>
                    <th>Тип</th>
                    <th>Начало</th>
                    <th>Окончание</th>
                    <th>Дней</th>
                    <th>Статус</th>
                    <th>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const days = Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    return (
                      <tr key={req.id}>
                        <td>{req.employee_name}</td>
                        <td>{req.department_name}</td>
                        <td>{VACATION_TYPE_LABELS[req.type]}</td>
                        <td>{new Date(req.start_date).toLocaleDateString('ru-RU')}</td>
                        <td>{new Date(req.end_date).toLocaleDateString('ru-RU')}</td>
                        <td>{days}</td>
                        <td><VacationStatusBadge status={req.status} /></td>
                        <td>
                          {req.status === 'pending' && (
                            <button className="btn-link btn-danger" onClick={() => handleCancel(req.id)}>Отменить</button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'approve' && <VacationApproveTab onAction={fetchRequests} />}

      {activeTab === 'orders' && <VacationOrders />}
    </div>
  );
};

const VacationApproveTab: React.FC<{ onAction: () => void }> = ({ onAction }) => {
  const [requests, setRequests] = useState<VacationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectModal, setRejectModal] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const data = await vacationApi.getPending();
      setRequests(data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      setProcessing(id);
      await vacationApi.approve(id);
      onAction();
      fetchPending();
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setProcessing(id);
      await vacationApi.reject(id, rejectReason || 'Без указания причины');
      setRejectModal(null);
      setRejectReason('');
      onAction();
      fetchPending();
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <>
      {requests.length === 0 ? (
        <div className="no-data">Нет заявок на утверждение</div>
      ) : (
        <div className="vacations-table-wrapper">
          <table className="vacations-table">
            <thead>
              <tr>
                <th>Сотрудник</th>
                <th>Отдел</th>
                <th>Тип</th>
                <th>Начало</th>
                <th>Окончание</th>
                <th>Дней</th>
                <th>Комментарий</th>
                <th>Дата заявки</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => {
                const days = Math.ceil((new Date(req.end_date).getTime() - new Date(req.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1;
                return (
                  <tr key={req.id}>
                    <td>{req.employee_name}</td>
                    <td>{req.department_name}</td>
                    <td>{VACATION_TYPE_LABELS[req.type]}</td>
                    <td>{new Date(req.start_date).toLocaleDateString('ru-RU')}</td>
                    <td>{new Date(req.end_date).toLocaleDateString('ru-RU')}</td>
                    <td>{days}</td>
                    <td className="comment-cell">{req.comment || '—'}</td>
                    <td>{new Date(req.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="actions-cell">
                      <button className="btn btn-sm btn-success" onClick={() => handleApprove(req.id)} disabled={processing === req.id}>
                        {processing === req.id ? '...' : 'Утвердить'}
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => setRejectModal(req.id)} disabled={processing === req.id}>
                        Отклонить
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {rejectModal && (
        <div className="modal-overlay" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Отклонение заявки</h3>
            <div className="form-group">
              <label>Причина отклонения</label>
              <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3} placeholder="Укажите причину..." />
            </div>
            <div className="modal-actions">
              <button className="btn btn-secondary" onClick={() => { setRejectModal(null); setRejectReason(''); }}>Отмена</button>
              <button className="btn btn-danger" onClick={() => handleReject(rejectModal)}>Отклонить</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Vacations;
