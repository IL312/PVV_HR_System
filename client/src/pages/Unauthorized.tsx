import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🔒</div>
        <h2>Доступ запрещён</h2>
        <p>У вас недостаточно прав для просмотра этой страницы.</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
