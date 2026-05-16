import React, { useState, useEffect } from 'react';
import { employeeApi } from '../api/employeeApi';
import type { Department } from '../types';

interface ReportFiltersProps {
  filters: {
    department_id: string;
    start_date: string;
    end_date: string;
  };
  setFilters: (filters: any) => void;
}

const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, setFilters }) => {
  const [departments, setDepartments] = useState<Department[]>([]);

  useEffect(() => {
    const fetchDepts = async () => {
      const data = await employeeApi.getDepartments();
      setDepartments(data);
    };
    fetchDepts();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFilters({ ...filters, [field]: value });
  };

  return (
    <div className="report-filters-bar">
      <div className="filter-group">
        <label>Департамент</label>
        <select 
          value={filters.department_id} 
          onChange={(e) => handleChange('department_id', e.target.value)}
        >
          <option value="">Все отделы</option>
          {departments.map(d => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Дата с</label>
        <input 
          type="date" 
          value={filters.start_date} 
          onChange={(e) => handleChange('start_date', e.target.value)} 
        />
      </div>

      <div className="filter-group">
        <label>Дата по</label>
        <input 
          type="date" 
          value={filters.end_date} 
          onChange={(e) => handleChange('end_date', e.target.value)} 
        />
      </div>
      
      <button 
        className="btn btn-secondary btn-sm" 
        onClick={() => setFilters({ department_id: '', start_date: '', end_date: '' })}
      >
        Сбросить
      </button>
    </div>
  );
};

export default ReportFilters;