import React from 'react';
import type { Employee } from '../types';
import avatar from '../assets/avatar.png';
import EditIcon from '../assets/icons/edit.png';
import './ProfileCard.css';

interface ProfileCardProps {
  user: Employee;
}

const ProfileCard = React.memo<ProfileCardProps>(({ user }) => {
  const date = new Date().toLocaleDateString();
  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Мой профиль</h2>
        <button className="edit-btn">
            <img src={EditIcon} alt='Выход'></img>

        </button>
      </div>
      <div className="profile-content">
        <div className="profile-avatar">
          <img src={avatar} alt="Avatar" />
        </div>
        <div className="profile-info">
          <h3>{user.last_name} {user.first_name} {user.middle_name}</h3>
          <p className="position">{user.position_title}</p>
          <p className="location">Москва</p>
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Дата</span>
            <span className="value">{date}</span>
          </div>
          <div className="detail-item">
            <span className="label">Отдел</span>
            <span className="value">{user.department_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Доступ</span>
            <span className="value">Просмотр</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProfileCard;