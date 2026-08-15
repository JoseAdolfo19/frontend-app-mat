import { lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Loading from './Loading';

const AdminDashboard = lazy(() => import('../Admin/AdminDashboard'));
const TeacherDashboard = lazy(() => import('../Teacher/TeacherDashboard'));
const ParentDashboard = lazy(() => import('../Parent/ParentDashboard'));
const StudentDashboard = lazy(() => import('../Student/StudentDashboard'));

// Despacha el dashboard según el rol del usuario autenticado.
const RoleDashboard = () => {
  const { user } = useAuth();
  const role = user?.role?.name;

  let Dashboard = StudentDashboard;
  if (role === 'admin') Dashboard = AdminDashboard;
  else if (role === 'teacher') Dashboard = TeacherDashboard;
  else if (role === 'parent') Dashboard = ParentDashboard;

  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
};

export default RoleDashboard;
