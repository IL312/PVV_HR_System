import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Department, Position, EmployeeFilters } from '../types';
import { employeeApi } from '../api/employeeApi';
import SearchIcon from '../assets/icons/search.png';

interface FilterPanelProps {
  filters: EmployeeFilters;
  onFilterChange: (filters: EmployeeFilters) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  // Загружаем справочники один раз при монтировании
  useEffect(() => {
    const fetchData = async () => {
      const [depts, pos] = await Promise.all([
        employeeApi.getDepartments(),
        employeeApi.getPositions()
      ]);
      setDepartments(depts);
      setPositions(pos);
    };
    fetchData();
  }, []);

  const handleChange = (key: keyof EmployeeFilters, value: any) => {
    // Передаем новые фильтры наверх
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="filter-panel">
      <div className="filter-row">
        <div className="filter-group">
          <label>Отдел</label>
          <select
            value={filters.department_id || ''}
            onChange={(e) => handleChange('department_id', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Все отделы</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Должность</label>
          <select
            value={filters.position_id || ''}
            onChange={(e) => handleChange('position_id', e.target.value ? Number(e.target.value) : undefined)}
          >
            <option value="">Любая</option>
            {positions.map(pos => (
              <option key={pos.id} value={pos.id}>{pos.title}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Статусы</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="all">Все</option>
            <option value="active">Работает</option>
            <option value="vacation">В отпуске</option>
            <option value="sick">На больничном</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <input
            type="text"
            placeholder="Поиск сотрудника"
            value={filters.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
          <button className="search-btn">
            <img src={SearchIcon} alt='Поиск'></img>
          </button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-group">
          <label>Заработная плата</label>
          <select
            value={filters.min_salary}
            onChange={(e) => handleChange('min_salary', Number(e.target.value))}
          >
            <option value="0">от 0 ₽</option>
            <option value="30000">от 30 000 ₽</option>
            <option value="50000">от 50 000 ₽</option>
            <option value="70000">от 70 000 ₽</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Срок работы в компании</label>
          <select
            value={filters.min_experience}
            onChange={(e) => handleChange('min_experience', Number(e.target.value))}
          >
            <option value="0">Любой</option>
            <option value="1">от 1 года</option>
            <option value="3">от 3 лет</option>
            <option value="5">от 5 лет</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Стаж</label>
          <select
            value={filters.min_experience}
            onChange={(e) => handleChange('min_experience', Number(e.target.value))}
          >
            <option value="0">Любой</option>
            <option value="1">от 1 года</option>
            <option value="3">от 3 лет</option>
            <option value="5">от 5 лет</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="btn btn-primary" onClick={() => navigate('/employee/add')}>Добавить сотрудника</button>
          <button className="btn btn-secondary">Экспорт</button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;