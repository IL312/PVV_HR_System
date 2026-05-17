import { useAuth } from '../context/AuthContext';

export const ROLES = {
  ADMIN: 'admin',
  HEAD: 'head',
  HR: 'hr',
  ACC: 'acc',
  COMMON: 'common',
} as const;

export const ROLE_LABELS: Record<string, string> = {
  admin: 'Администратор',
  head: 'Руководитель',
  hr: 'HR-специалист',
  acc: 'Бухгалтер',
  common: 'Сотрудник',
};

export function useRole() {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user?.role) return false;
    return roles.includes(user.role);
  };

  const isCommon = () => hasRole(ROLES.COMMON);
  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isHead = () => hasRole(ROLES.HEAD);
  const isHR = () => hasRole(ROLES.HR);
  const isAcc = () => hasRole(ROLES.ACC);

  return {
    role: user?.role || null,
    hasRole,
    hasAnyRole,
    isCommon,
    isAdmin,
    isHead,
    isHR,
    isAcc,
  };
}
