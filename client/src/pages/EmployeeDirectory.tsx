import React, { useState, useEffect, useCallback } from 'react';
import EmployeeCard from '../components/EmployeeCard';
import FilterPanel from '../components/FilterPanel';
import ProfileCard from '../components/ProfileCard';
import type { Employee, EmployeeFilters } from '../types';
import { employeeApi } from '../api/employeeApi';

const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Состояние фильтров хранится здесь
  const [filters, setFilters] = useState<EmployeeFilters>({
    department_id: undefined,
    position_id: undefined,
    status: 'all',
    min_salary: 0,
    search: ''
  });

  // Загружаем профиль пользователя один раз
  useEffect(() => {
    const loadUser = async () => {
        const all = await employeeApi.getAll({});
        const user = all.find((e: Employee) => e.id === 1);
        setCurrentUser(user || null);
    }
    loadUser();
  }, []);

  // useCallback гарантирует, что ссылка на функцию останется прежней
  // это важно для оптимизации
  const handleFilterChange = useCallback((newFilters: EmployeeFilters) => {
    setFilters(newFilters);
  }, []);

  // Эффект для загрузки данных сотрудников при изменении фильтров
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await employeeApi.getAll(filters);
        setEmployees(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading && employees.length === 0) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="employee-directory">
      <div className="main-content">
        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
        
        <div className="employees-grid">
          {employees.map(employee => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))}
        </div>
      </div>

      {currentUser && (
        <div className="sidebar-profile">
           <ProfileCard user={currentUser} />
        </div>
      )}
    </div>
  );
};

export default EmployeeDirectory;