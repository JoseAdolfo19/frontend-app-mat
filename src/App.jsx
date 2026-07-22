import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './components/Common/ProtectedRoute';

// Layout
import MainLayout from './components/Layout/MainLayout';

// Auth
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

// Common (páginas compartidas por todos los roles)
import Profile from './components/Common/Profile';
import Notifications from './components/Common/Notifications';
import Settings from './components/Common/Settings';
import Help from './components/Common/Help';

// Student
import StudentDashboard from './components/Student/StudentDashboard';
import LessonList from './components/Student/LessonList';
import LessonDetail from './components/Student/LessonDetail';
import EvaluationList from './components/Student/EvaluationList';
import EvaluationResult from './components/Student/EvaluationResult';

// Teacher
import TeacherDashboard from './components/Teacher/TeacherDashboard';
import LessonEditor from './components/Teacher/LessonEditor';
import EvaluationCreator from './components/Teacher/EvaluationCreator';
import StudentProgress from './components/Teacher/StudentProgress';
import Reports from './components/Teacher/Reports';

// Admin
import AdminDashboard from './components/Admin/AdminDashboard';
import UserManagement from './components/Admin/UserManagement';
import SystemConfig from './components/Admin/SystemConfig';
import ColorSettings from './components/Admin/ColorSettings';

import './App.css';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <NotificationProvider>
              <div className="min-h-screen bg-[var(--background)]">
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: 'var(--surface)',
                      color: 'var(--on-surface)',
                      border: '1px solid var(--outline-variant)'
                    }
                  }}
                />
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  
                  {/* Protected Routes */}
                  <Route element={<ProtectedRoute />}>
                    <Route element={<MainLayout />}>
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                      
                      {/* Student */}
                      <Route path="/dashboard" element={<StudentDashboard />} />
                      <Route path="/lessons" element={<LessonList />} />
                      <Route path="/lessons/:id" element={<LessonDetail />} />
                      <Route path="/evaluations" element={<EvaluationList />} />
                      <Route path="/evaluations/:id/result" element={<EvaluationResult />} />
                      
                      {/* Teacher */}
                      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                      <Route path="/teacher/lessons/create" element={<LessonEditor />} />
                      <Route path="/teacher/lessons/:id/edit" element={<LessonEditor />} />
                      <Route path="/teacher/evaluations/create" element={<EvaluationCreator />} />
                      <Route path="/teacher/evaluations/:id/edit" element={<EvaluationCreator />} />
                      <Route path="/teacher/students/:id/progress" element={<StudentProgress />} />
                      <Route path="/reports" element={<Reports />} />

                      {/* Común a todos los roles */}
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/help" element={<Help />} />
                      
                      {/* Admin */}
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/admin/users" element={<UserManagement />} />
                      <Route path="/admin/config" element={<SystemConfig />} />
                      <Route path="/admin/colors" element={<ColorSettings />} />
                    </Route>
                  </Route>
                </Routes>
              </div>
            </NotificationProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;