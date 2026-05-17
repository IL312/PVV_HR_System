import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { vacationApi } from '../api/vacationApi';
import { employeeApi } from '../api/employeeApi';
import { useRole, ROLES } from '../hooks/useRole';
import type { Employee } from '../types';
import './Vacations.css';

const VacationNew: React.FC = () => {
  const navigate = useNavigate();
  const { hasAnyRole } = useRole();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [formData, setFormData] = useState({
    employee_id: '',
    start_date: '',
    end_date: '',
    type: 'annual',
    comment: ''
  });

  const canSelectEmployee = hasAnyRole([ROLES.ADMIN, ROLES.HR, ROLES.HEAD]);

  useEffect(() => {
    if (canSelectEmployee) {
      employeeApi.getAll({}).then(setEmployees).catch(() => {});
    }
  }, [canSelectEmployee]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (new Date(formData.end_date) < new Date(formData.start_date)) {
      setError('Дата окончания не может быть раньше даты начала');
      return;
    }

    if (new Date(formData.start_date) < new Date(new Date().toISOString().split('T')[0])) {
      setError('Дата начала не может быть в прошлом');
      return;
    }

    setLoading(true);

    try {
      const data: any = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        type: formData.type,
        comment: formData.comment
      };

      if (canSelectEmployee && formData.employee_id) {
        data.employee_id = Number(formData.employee_id);
      }

      await vacationApi.create(data);
      navigate('/vacations');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vacation-form-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate('/vacations')}>
          ← Назад
        </button>
        <h1>Новая заявка на отпуск</h1>
      </div>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="employee-form">
          {canSelectEmployee && (
            <div className="form-section">
              <h3>Сотрудник</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Сотрудник</label>
                  <select
                    name="employee_id"
                    value={formData.employee_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Выберите сотрудника</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.last_name} {emp.first_name} {emp.middle_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="form-section">
            <h3>Параметры отпуска</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Дата начала *</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Дата окончания *</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                  min={formData.start_date || new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="form-group">
                <label>Тип отпуска *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="annual">Ежегодный</option>
                  <option value="unpaid">Без содержания</option>
                  <option value="maternity">Декретный</option>
                  <option value="sick">Больничный</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Комментарий</label>
              <textarea
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows={3}
                placeholder="Дополнительная информация..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/vacations')}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacationNew;
