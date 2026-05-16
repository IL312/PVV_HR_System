import React, { createContext, useState, useContext, useEffect } from 'react';
import type {ReactNode} from 'react';
import type { AuthUser } from '../types';
import axios from 'axios';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненный токен/юзера при загрузке
    const storedUser = localStorage.getItem('hr_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    try {
      const response = await axios.post('/api/auth/login', { login, password });
      const userData = response.data.user;
      setUser(userData);
      localStorage.setItem('hr_user', JSON.stringify(userData));
      // Устанавливаем токен для будущих запросов
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Ошибка входа');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hr_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};