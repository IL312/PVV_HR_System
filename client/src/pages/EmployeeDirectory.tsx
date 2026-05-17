import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import EmployeeCard from '../components/EmployeeCard';
import FilterPanel from '../components/FilterPanel';
import ProfileCard from '../components/ProfileCard';
import type { Employee, EmployeeFilters } from '../types';
import { employeeApi } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';
import { useRole, ROLES } from '../hooks/useRole';
import './EmployeeDirectory.css';

const EmployeeDirectory: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasAnyRole } = useRole();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [currentUser, setCurrentUser] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState<EmployeeFilters>({
    department_id: undefined,
    position_id: undefined,
    status: 'all',
    min_salary: 0,
    search: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      if (user?.employee?.id) {
        const emp = await employeeApi.getById(user.employee.id);
        setCurrentUser(emp || null);
      }
    }
    loadUser();
  }, [user?.employee?.id]);

  const handleFilterChange = useCallback((newFilters: EmployeeFilters) => {
    setFilters(newFilters);
  }, []);

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

  if (!hasAnyRole([ROLES.ADMIN, ROLES.HEAD, ROLES.HR, ROLES.ACC]) && currentUser) {
    return (
      <Navigate to={`/employee/${currentUser.id}`} replace />
    );
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
