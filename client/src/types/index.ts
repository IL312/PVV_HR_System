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

export type VacationStatus = 'pending' | 'approved' | 'rejected' | 'ordered' | 'cancelled';
export type VacationType = 'annual' | 'unpaid' | 'maternity' | 'sick';
export type OrderType = 'vacation' | 'hire' | 'transfer' | 'dismissal';

export interface VacationRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  department_name: string;
  department_id?: number;
  start_date: string;
  end_date: string;
  type: VacationType;
  status: VacationStatus;
  comment?: string;
  approver_id?: number;
  approver_name?: string;
  approval_date?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  order_date: string;
  type: OrderType;
  employee_id: number;
  employee_name: string;
  department_name?: string;
  vacation_request_id?: number;
  content: string;
  signed_by: string;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
  vacation_start?: string;
  vacation_end?: string;
  vacation_type?: string;
}
