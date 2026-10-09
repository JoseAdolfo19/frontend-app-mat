// Tests authentication-session loading, retry, and logout behavior.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useState } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}));

vi.mock('../utils/i18n', () => ({
  getTranslation: (_lang, key) =>
    key === 'auth.login.error'
      ? 'No se pudo iniciar sesión. Verifica tu correo y contraseña e inténtalo de nuevo.'
      : key,
  getSavedLanguage: () => 'es',
}));

vi.mock('../utils/roles', () => ({
  canAccess: (role, allowed) => (allowed || []).includes(role),
}));

import axios from '../api/axios';

const Probe = () => {
  const { user, loading, authError } = useAuth();
  if (loading) return <div data-testid="estado">cargando</div>;
  if (authError) return <div data-testid="estado">error:{authError}</div>;
  if (!user) return <div data-testid="estado">sin-sesion</div>;
  return <div data-testid="estado">usuario:{user.email}</div>;
};

const LoginProbe = () => {
  const { login } = useAuth();
  const [error, setError] = useState('');
  return (
    <>
      <button onClick={async () => setError((await login('user@example.com', 'bad-password')).error)}>
        Probar inicio de sesión
      </button>
      <p role="alert">{error}</p>
    </>
  );
};

const montar = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>
  );

describe('AuthContext - manejo de sesión', () => {
  beforeEach(() => {
    localStorage.setItem('access_token', 'token-de-prueba');
    axios.get.mockReset();
    axios.post.mockReset();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('carga el usuario correctamente', async () => {
    axios.get.mockResolvedValue({ data: { user: { email: 'a@b.com' } } });
    montar();
    expect(await screen.findByText('usuario:a@b.com')).toBeInTheDocument();
  });

  it('cierra sesión con un 401', async () => {
    axios.get.mockRejectedValue({ response: { status: 401 } });
    axios.post.mockResolvedValue({ data: {} });
    montar();
    expect(await screen.findByText('sin-sesion')).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBeNull();
  });

  it('NO cierra sesión ante un 429: reintenta y recupera', async () => {
    // Primero falla por límite de peticiones, el reintento sí funciona.
    axios.get
      .mockRejectedValueOnce({ response: { status: 429 } })
      .mockResolvedValueOnce({ data: { user: { email: 'a@b.com' } } });

    montar();

    // El primer reintento tiene un backoff de 1s; findByText por defecto
    // solo espera 1s, así que hay que darle margen.
    expect(
      await screen.findByText('usuario:a@b.com', {}, { timeout: 8000 })
    ).toBeInTheDocument();
    // La sesión debe seguir viva.
    expect(localStorage.getItem('access_token')).toBe('token-de-prueba');
    expect(axios.get).toHaveBeenCalledTimes(2);
  });

  it('NO cierra sesión ante un 500: reintenta y recupera', async () => {
    axios.get
      .mockRejectedValueOnce({ response: { status: 500 } })
      .mockResolvedValueOnce({ data: { user: { email: 'a@b.com' } } });

    montar();

    expect(
      await screen.findByText('usuario:a@b.com', {}, { timeout: 8000 })
    ).toBeInTheDocument();
    expect(localStorage.getItem('access_token')).toBe('token-de-prueba');
  });

  it('muestra error de conexión, no login, si los reintentos se agotan', async () => {
    axios.get.mockRejectedValue({ response: { status: 429 } });

    montar();

    // 3 reintentos con backoff (1s + 2s + 4s) necesitan más que el 5s por defecto.
    await waitFor(
      () => expect(screen.getByTestId('estado').textContent).toMatch(/^error:/),
      { timeout: 20000 }
    );

    // Este es el bug original: aquí antes se terminaba en "sin-sesion",
    // lo que hacía que ProtectedRoute mandara al usuario al login.
    expect(screen.getByTestId('estado').textContent).not.toBe('sin-sesion');
    // La sesión tampoco debe destruirse.
    expect(localStorage.getItem('access_token')).toBe('token-de-prueba');
  }, 25000);

  it('no hace peticiones si no hay token', async () => {
    localStorage.removeItem('access_token');
    axios.get.mockResolvedValue({ data: { user: { email: 'a@b.com' } } });
    montar();
    expect(await screen.findByText('sin-sesion')).toBeInTheDocument();
    expect(axios.get).not.toHaveBeenCalled();
  });

  it('muestra un mensaje traducido si falla el inicio de sesión sin detalle del servidor', async () => {
    localStorage.removeItem('access_token');
    axios.post.mockRejectedValue({ response: { status: 401 } });
    render(<AuthProvider><LoginProbe /></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Probar inicio de sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión. Verifica tu correo y contraseña e inténtalo de nuevo.'
    );
  });

  it('no muestra una clave de traducción enviada por el servidor', async () => {
    localStorage.removeItem('access_token');
    axios.post.mockRejectedValue({
      response: { status: 401, data: { message: 'auth.login.error' } },
    });
    render(<AuthProvider><LoginProbe /></AuthProvider>);

    fireEvent.click(screen.getByRole('button', { name: 'Probar inicio de sesión' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo iniciar sesión. Verifica tu correo y contraseña e inténtalo de nuevo.'
    );
  });
});
