import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Employee } from '../types';
import declOfYears from '../utils';

interface EmployeeCardProps {
  employee: Employee;
}

// Оборачиваем в React.memo
const EmployeeCard = React.memo<EmployeeCardProps>(({ employee }) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (employee.status) {
      case 'active': return '#28a745'; // green
      case 'vacation': return '#ffc107'; // orange
      case 'sick': return '#dc3545'; // red
      default: return '#6c757d';
    }
  };

  const getStatusText = () => {
    switch (employee.status) {
      case 'active': return 'Работает';
      case 'vacation': return 'В отпуске';
      case 'sick': return 'На больничном';
      default: return 'Уволен';
    }
  };

  return (
    <div className="employee-card" onClick={() => navigate(`/employee/${employee.id}`)}>
      <div className="card-header">
        <div className="avatar">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="18" fill="white" />
            <circle cx="20" cy="15" r="6" fill="#007bff" />
            <path d="M 8 32 Q 20 24 32 32" fill="none" stroke="#007bff" strokeWidth="2" />
          </svg>
        </div>
        <div className="header-info">
          <h3>{employee.last_name} {employee.first_name} {employee.middle_name}</h3>
          <p className="position">{employee.position_title}</p>
        </div>
      </div>
      
      <div className="card-body">
        <div className="info-row">
          <span className="label">Отдел:</span>
          <span className="badge">{employee.department_name}</span>
        </div>
        <div className="info-row">
          <span className="label">Email:</span>
          <span className="value">{employee.email}</span>
        </div>
        <div className="info-row">
          <span className="label">Телефон:</span>
          <span className="value">{employee.phone}</span>
        </div>
        <div className="info-row">
          <span className="label">Стаж:</span>
          <span className="value">{declOfYears(employee.experience_years)}</span>
        </div>
      </div>

      <div className="card-footer">
        <div className="status" style={{ color: getStatusColor() }}>
          <span className="status-dot" style={{ backgroundColor: getStatusColor() }}></span>
          {getStatusText()}
        </div>
        <button className="details-btn" onClick={(e) => {
          e.stopPropagation(); // Чтобы не переходить на карточку при клике на кнопку
          navigate(`/employee/${employee.id}`);
        }}></button>
      </div>
    </div>
  );
});

export default EmployeeCard;