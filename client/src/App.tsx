import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import EmployeeDirectory from './pages/EmployeeDirectory';
import EmployeeDetail from './pages/EmployeeDetail';
import EditEmployee from './pages/EditEmployee';
import Login from './pages/Login';
import AddEmployee from './pages/AddEmployee';
import Reports from './pages/Reports';
import Unauthorized from './pages/Unauthorized';
import Vacations from './pages/Vacations';
import VacationNew from './pages/VacationNew';
import ProtectedRoute from './components/ProtectedRoute';
import { ROLES } from './hooks/useRole';
import './App.css';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeDirectory />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <EmployeeDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/add"
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.HR]}>
            <Layout>
              <AddEmployee />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee/:id/edit"
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
            <Layout>
              <EditEmployee />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route 
        path="/reports" 
        element={
          <ProtectedRoute requiredRoles={[ROLES.ADMIN, ROLES.HEAD, ROLES.HR, ROLES.ACC]}>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        } 
      />
      <Route
        path="/vacations"
        element={
          <ProtectedRoute>
            <Layout>
              <Vacations />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vacations/new"
        element={
          <ProtectedRoute>
            <Layout>
              <VacationNew />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
