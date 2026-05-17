import axios from 'axios';
import type { Employee } from '../types';

const API_URL = '/api';

export const employeeApi = {
  // Получить всех сотрудников
  getAll: async (filters: any) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        params.append(key, filters[key]);
      }
    });
    
    const response = await axios.get(`${API_URL}/employees?${params}`);
    return response.data;
  },

  // Получить сотрудников по ID
  getById: async (id: number) => {
    const response = await axios.get(`${API_URL}/employees/${id}`);
    return response.data;
  },

  // Создать сотрудника
  create: async (employeeData: Partial<Employee>) => {
    const response = await axios.post(`${API_URL}/employees`, employeeData);
    return response.data;
  },

  // Обновить данные сотрудника
  update: async (id: number, employeeData: Partial<Employee>) => {
    const response = await axios.put(`${API_URL}/employees/${id}`, employeeData);
    return response.data;
  },

  // Получить отдел сотрудника
  getDepartments: async () => {
    const response = await axios.get(`${API_URL}/employees/meta/departments`);
    return response.data;
  },

  // Получить должность сотрудника
  getPositions: async () => {
    const response = await axios.get(`${API_URL}/employees/meta/positions`);
    return response.data;
  }
};