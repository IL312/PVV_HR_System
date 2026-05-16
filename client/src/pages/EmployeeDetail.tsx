import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Employee } from '../types';
import { employeeApi } from '../api/employeeApi';
import ProfileCard from '../components/ProfileCard';
import declOfYears from '../utils';
import avatar from '../assets/avatar.png';

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const empData = await employeeApi.getById(Number(id));
        setEmployee(empData);

        // Load current user
        const allEmployees = await employeeApi.getAll({});
        const user = allEmployees.find((e: Employee) => e.id === 1);
        setCurrentUser(user || null);
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!employee) {
    return <div className="error">Сотрудник не найден</div>;
  }

  const quickAccessButtons = [
    'Семья', 'Образование', 'Здоровье', 'Работа',
    'Судимости', 'Военная служба', 'Спорт', 'Достижения'
  ];

  return (
    <div className="employee-detail">
      <div className="main-content">
        <div className="detail-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            ← Вернуться
          </button>
          <div className="header-actions">
            <button className="action-btn">🖨️</button>
            <button className="action-btn">✏️</button>
            <button className="btn btn-primary">Экспорт</button>
            <div className="search-box">
              <input type="text" placeholder="Поиск данных" />
              <button>🔍</button>
            </div>
          </div>
        </div>

        <div className="detail-content">
          <div className="employee-photo">
            <img src={avatar} alt={`${employee.last_name} ${employee.first_name}`} />
          </div>

          <div className="employee-info">
            <section className="info-section">
              <h3>Основные сведения:</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Дата рождения:</span>
                  <span className="value">{new Date(employee.birth_date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="info-item">
                  <span className="label">Паспорт:</span>
                  <span className="value">{employee.passport}</span>
                </div>
                <div className="info-item">
                  <span className="label">Регистрация:</span>
                  <span className="value">{employee.registration_address}</span>
                </div>
                <div className="info-item">
                  <span className="label">Стаж работы:</span>
                  <span className="value">{declOfYears(employee.experience_years)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Оклад:</span>
                  <span className="value">{employee.salary.toLocaleString('ru-RU')} ₽</span>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h3>Контакты:</h3>
              <div className="contacts">
                <div className="contact-item">
                  <span className="icon">📧</span>
                  <div>
                    <div className="contact-label">Email</div>
                    <div className="contact-value">{employee.email}</div>
                  </div>
                </div>
                <div className="contact-item">
                  <span className="icon">📱</span>
                  <div>
                    <div className="contact-label">Телефон</div>
                    <div className="contact-value">{employee.phone}</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h3>Рабочие сведения:</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Отдел:</span>
                  <span className="value">{employee.department_name}</span>
                </div>
                <div className="info-item">
                  <span className="label">Должность:</span>
                  <span className="value">{employee.position_title}</span>
                </div>
                <div className="info-item">
                  <span className="label">Дата приёма:</span>
                  <span className="value">{new Date(employee.hire_date).toLocaleDateString('ru-RU')}</span>
                </div>
                <div className="info-item">
                  <span className="label">Формат работы:</span>
                  <span className="value">На месте работодателя</span>
                </div>
              </div>
            </section>

            <section className="info-section">
              <h3>Часто обрабатываемые запроссы данных:</h3>
              <div className="quick-access">
                {quickAccessButtons.map((btn, index) => (
                  <button key={index} className="quick-btn">
                    {btn}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      {currentUser && (
        <div className="sidebar-profile">
          <ProfileCard user={currentUser} />
          <div className="mini-card">
            <h4>{employee.last_name} {employee.first_name} {employee.middle_name}</h4>
            <p className="position">{employee.position_title}</p>
            <div className="mini-info">
              <div className="info-row">
                <span>Отдел:</span>
                <span className="badge">{employee.department_name}</span>
              </div>
              <div className="info-row">
                <span>Email:</span>
                <span>{employee.email}</span>
              </div>
              <div className="info-row">
                <span>Телефон:</span>
                <span>{employee.phone}</span>
              </div>
              <div className="info-row">
                <span>Стаж:</span>
                <span>{declOfYears(employee.experience_years)}</span>
              </div>
              <div className="info-row">
                <span>Оклад:</span>
                <span>{employee.salary.toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetail;