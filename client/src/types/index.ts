export interface Employee {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  passport: string;
  snils?: string;
  phone: string;
  email: string;
  birth_date: string;
  registration_address: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'vacation' | 'sick' | 'dismissed';
  department_id: number;
  department_name: string;
  position_id: number;
  position_title: string;
  experience_years: number;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
}

export interface Position {
  id: number;
  title: string;
  code: string;
  base_salary: number;
}

export interface EmployeeFilters {
  department_id?: number;
  position_id?: number;
  status?: string;
  min_salary?: number;
  min_experience?: number;
  search?: string;
}

export interface AuthUser {
  id: number;
  login: string;
  role: string;
  employee: Employee | null;
}

export interface ReportRow {
  [key: string]: string | number | null | undefined;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  active?: number;
  [key: string]: string | number | null | undefined;
}
