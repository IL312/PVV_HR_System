import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRole, ROLES } from '../hooks/useRole';
import HomeIcon from '../assets/icons/home.png';
import SettingsIcon from '../assets/icons/settings.png';
import DocIcon from '../assets/icons/document.png';
import DataIcon from '../assets/icons/data.png';
import UserIcon from '../assets/icons/user.png';
import LogoutIcon from '../assets/icons/logout.png';
import './Sidebar.css';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { hasAnyRole, isAdmin } = useRole();

  const menuItems = [
    { icon: HomeIcon, path: '/', label: 'Главная' },
    ...(isAdmin() ? [{ icon: SettingsIcon, path: '/settings', label: 'Настройки' }] : []),
    { icon: DocIcon, path: '/vacations', label: 'Документы' },
    ...(hasAnyRole([ROLES.ADMIN, ROLES.HEAD, ROLES.HR, ROLES.ACC])
      ? [{ icon: DataIcon, path: '/reports', label: 'Отчёты' }]
      : []),
    { icon: UserIcon, path: `/employee/${user?.employee?.id}`, label: 'Профиль' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <span>HRS</span>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <img className="nav-icon" src={item.icon} alt={item.label}></img>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
            <img className="nav-icon" src={LogoutIcon} alt='Выход'></img>
          <span>Выйти</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
