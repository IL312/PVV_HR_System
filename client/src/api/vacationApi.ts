import axios from 'axios';
import type { VacationRequest, Order } from '../types';

const API_URL = '/api';

export const vacationApi = {
  // Создать заявку
  create: async (data: { employee_id?: number; start_date: string; end_date: string; type: string; comment?: string }) => {
    const response = await axios.post(`${API_URL}/vacations`, data);
    return response.data;
  },

  // Получить свои заявки
  getMy: async (): Promise<VacationRequest[]> => {
    const response = await axios.get(`${API_URL}/vacations/my`);
    return response.data;
  },

// Получить заявки на утверждение (head, admin)
  getPending: async (): Promise<VacationRequest[]> => {
    const response = await axios.get(`${API_URL}/vacations/pending`);
    return response.data;
  },

// Получить отработанные заявки
  getOrdered: async (): Promise<VacationRequest[]> => {
    const response = await axios.get(`${API_URL}/vacations/ordered`);
    return response.data;
  },

// Получить утвержденные заявки для создания приказа
  getApproved: async (): Promise<VacationRequest[]> => {
    const response = await axios.get(`${API_URL}/vacations/approved`);
    return response.data;
  },

  // Утвердить заявку
  approve: async (id: number): Promise<VacationRequest> => {
    const response = await axios.put(`${API_URL}/vacations/${id}/approve`);
    return response.data;
  },

  // Отклонить заявку
  reject: async (id: number, reason: string): Promise<VacationRequest> => {
    const response = await axios.put(`${API_URL}/vacations/${id}/reject`, { reason });
    return response.data;
  },
  // Отменить заявку
  cancel: async (id: number): Promise<VacationRequest> => {
    const response = await axios.put(`${API_URL}/vacations/${id}/cancel`);
    return response.data;
  },

  // Вернуть заявку на рассмотрение
  returnToPending: async (id: number): Promise<VacationRequest> => {
    const response = await axios.put(`${API_URL}/vacations/${id}/return`);
    return response.data;
  },
};

export const orderApi = {
  // Получить все приказы
  getAll: async (filters?: { type?: string; employee_id?: number }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.employee_id) params.append('employee_id', String(filters.employee_id));
    const response = await axios.get(`${API_URL}/orders?${params}`);
    return response.data;
  },

  // Получить приказ по ID
  getById: async (id: number): Promise<Order> => {
    const response = await axios.get(`${API_URL}/orders/${id}`);
    return response.data;
  },

  // Создать приказ
  create: async (data: {
    order_number: string;
    order_date: string;
    type: string;
    employee_id: number;
    vacation_request_id?: number;
    content: string;
    signed_by: string;
  }): Promise<Order> => {
    const response = await axios.post(`${API_URL}/orders`, data);
    return response.data;
  },

  // Обновить приказ
  update: async (id: number, data: {
    order_number: string;
    order_date: string;
    content: string;
    signed_by: string;
  }): Promise<Order> => {
    const response = await axios.put(`${API_URL}/orders/${id}`, data);
    return response.data;
  },

  // Удалить приказ
  delete: async (id: number): Promise<Order> => {
    const response = await axios.delete(`${API_URL}/orders/${id}`);
    return response.data;
  },
};
