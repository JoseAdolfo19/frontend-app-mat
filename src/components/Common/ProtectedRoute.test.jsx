import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

const mockAuth = { user: null, loading: false, hasRole: () => false };

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../../contexts/LanguageContext', () => ({
  useLanguage: () => ({ t: (k) => k }),
}));

const renderRoute = (roles = []) => {
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route path="/protected" element={<ProtectedRoute roles={roles} />}>
          <Route index element={<div data-testid="sentinel">CONTENIDO PROTEGIDO</div>} />
        </Route>
        <Route path="/login" element={<div data-testid="login">LOGIN</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockAuth.user = null;
    mockAuth.loading = false;
    mockAuth.hasRole = () => false;
  });

  it('muestra el indicador de carga mientras carga', () => {
    mockAuth.loading = true;
    const { container } = renderRoute();
    expect(container.querySelector('[role="alert"]')).toBeNull();
    expect(screen.queryByTestId('sentinel')).toBeNull();
    expect(screen.queryByTestId('login')).toBeNull();
  });

  it('redirige a /login cuando no hay sesión', () => {
    renderRoute();
    expect(screen.getByTestId('login')).toBeInTheDocument();
    expect(screen.queryByTestId('sentinel')).toBeNull();
  });

  it('permite el acceso cuando no se restringe por rol', () => {
    mockAuth.user = { role: 'student' };
    renderRoute();
    expect(screen.getByTestId('sentinel')).toBeInTheDocument();
    expect(screen.queryByTestId('login')).toBeNull();
  });

  it('permite el acceso cuando el rol está permitido', () => {
    mockAuth.user = { role: 'teacher' };
    mockAuth.hasRole = (roles) => roles.includes('teacher');
    renderRoute(['teacher', 'admin']);
    expect(screen.getByTestId('sentinel')).toBeInTheDocument();
  });

  it('muestra no autorizado cuando el rol no está permitido', () => {
    mockAuth.user = { role: 'student' };
    mockAuth.hasRole = (roles) => roles.includes('student');
    renderRoute(['teacher']);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByTestId('sentinel')).toBeNull();
    expect(screen.queryByTestId('login')).toBeNull();
  });
});