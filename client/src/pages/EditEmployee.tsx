import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { employeeApi } from '../api/employeeApi';
import type { Department, Position, Employee } from '../types';
import './AddEmployee.css';

interface EditEmployeeForm {
  last_name: string;
  first_name: string;
  middle_name: string;
  passport: string;
  snils: string;
  phone: string;
  email: string;
  birth_date: string;
  registration_address: string;
  department_id: string;
  position_id: string;
  hire_date: string;
  salary: string;
  status: Employee['status'];
}

const EditEmployee: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState<EditEmployeeForm>({
    last_name: '',
    first_name: '',
    middle_name: '',
    passport: '',
    snils: '',
    phone: '',
    email: '',
    birth_date: '',
    registration_address: '',
    department_id: '',
    position_id: '',
    hire_date: '',
    salary: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [empData, depts, pos] = await Promise.all([
          employeeApi.getById(Number(id)),
          employeeApi.getDepartments(),
          employeeApi.getPositions()
        ]);

        setFormData({
          last_name: empData.last_name || '',
          first_name: empData.first_name || '',
          middle_name: empData.middle_name || '',
          passport: empData.passport || '',
          snils: empData.snils || '',
          phone: empData.phone || '',
          email: empData.email || '',
          birth_date: empData.birth_date ? new Date(empData.birth_date).toISOString().split('T')[0] : '',
          registration_address: empData.registration_address || '',
          department_id: String(empData.department_id || ''),
          position_id: String(empData.position_id || ''),
          hire_date: empData.hire_date ? new Date(empData.hire_date).toISOString().split('T')[0] : '',
          salary: String(empData.salary || ''),
          status: empData.status || 'active'
        });

        setDepartments(depts);
        setPositions(pos);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Не удалось загрузить данные сотрудника');
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const employeeData = {
        ...formData,
        department_id: Number(formData.department_id),
        position_id: Number(formData.position_id),
        salary: Number(formData.salary),
      };

      await employeeApi.update(Number(id), employeeData);
      navigate(`/employee/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при обновлении сотрудника');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="add-employee-page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(`/employee/${id}`)}>
          ← Назад
        </button>
        <h1>Редактирование сотрудника</h1>
      </div>

      <div className="form-container">
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="employee-form">
          <div className="form-section">
            <h3>Личные данные</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Фамилия *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Имя *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Отчество</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Дата рождения *</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Паспорт *</label>
                <input
                  type="text"
                  name="passport"
                  value={formData.passport}
                  onChange={handleChange}
                  placeholder="1417 612171"
                  required
                />
              </div>
              <div className="form-group">
                <label>СНИЛС</label>
                <input
                  type="text"
                  name="snils"
                  value={formData.snils}
                  onChange={handleChange}
                  placeholder="123-456-789 01"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Адрес регистрации</label>
              <textarea
                name="registration_address"
                value={formData.registration_address}
                onChange={handleChange}
                rows={2}
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Контакты</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Телефон *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 (999) 856 99 76"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Рабочие данные</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Отдел *</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите отдел</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Должность *</label>
                <select
                  name="position_id"
                  value={formData.position_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">Выберите должность</option>
                  {positions.map(pos => (
                    <option key={pos.id} value={pos.id}>{pos.title}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Дата приема *</label>
                <input
                  type="date"
                  name="hire_date"
                  value={formData.hire_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Оклад (₽) *</label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1000"
                />
              </div>
              <div className="form-group">
                <label>Статус</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Работает</option>
                  <option value="vacation">В отпуске</option>
                  <option value="sick">На больничном</option>
                  <option value="dismissed">Уволен</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => navigate(`/employee/${id}`)}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployee;
