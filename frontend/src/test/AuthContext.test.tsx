import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../context/AuthContext';

vi.mock('../../api/auth', () => ({
  login:   vi.fn(),
  logout:  vi.fn(),
  register: vi.fn(),
}));

import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';

const mockLogin    = vi.mocked(apiLogin);
const mockLogout   = vi.mocked(apiLogout);
const mockRegister = vi.mocked(apiRegister);

const authResponseMock = {
  message: 'ok',
  user: { id: 1, name: 'Maria', email: 'maria@example.com' },
  token: 'token-abc-123',
};

// Componente auxiliar para expor o contexto
function TestConsumer({ acao }: { acao?: () => void }) {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="authenticated">{String(auth.isAuthenticated)}</span>
      <span data-testid="user-name">{auth.user?.name ?? ''}</span>
      <span data-testid="loading">{String(auth.loading)}</span>
      {acao && <button onClick={acao}>Ação</button>}
    </div>
  );
}

describe('AuthContext', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('inicia não autenticado sem dados no localStorage', async () => {
    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('false');
    });
    expect(screen.getByTestId('authenticated').textContent).toBe('false');
  });

  it('restaura sessão do localStorage na montagem', async () => {
    localStorage.setItem('auth_token', 'saved-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Salvo', email: 'salvo@test.com' }));

    render(<AuthProvider><TestConsumer /></AuthProvider>);

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('true');
    });
    expect(screen.getByTestId('user-name').textContent).toBe('Salvo');
  });

  it('login salva token e atualiza estado', async () => {
    mockLogin.mockResolvedValueOnce(authResponseMock);

    let loginFn!: () => Promise<void>;
    function Comp() {
      const auth = useAuth();
      loginFn = () => auth.login({ email: 'a@b.com', password: '12345678' });
      return <TestConsumer />;
    }

    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => screen.getByTestId('loading'));

    await act(async () => { await loginFn(); });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(screen.getByTestId('user-name').textContent).toBe('Maria');
    expect(localStorage.getItem('auth_token')).toBe('token-abc-123');
  });

  it('logout limpa estado e localStorage', async () => {
    localStorage.setItem('auth_token', 'tk');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'X', email: 'x@x.com' }));
    mockLogout.mockResolvedValueOnce(undefined);

    let logoutFn!: () => Promise<void>;
    function Comp() {
      const auth = useAuth();
      logoutFn = () => auth.logout();
      return <TestConsumer />;
    }

    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    await act(async () => { await logoutFn(); });

    expect(screen.getByTestId('authenticated').textContent).toBe('false');
    expect(localStorage.getItem('auth_token')).toBeNull();
  });

  it('evento auth:unauthenticated limpa sessão', async () => {
    localStorage.setItem('auth_token', 'tk');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'X', email: 'x@x.com' }));

    render(<AuthProvider><TestConsumer /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('authenticated').textContent).toBe('true'));

    act(() => { window.dispatchEvent(new Event('auth:unauthenticated')); });

    await waitFor(() => {
      expect(screen.getByTestId('authenticated').textContent).toBe('false');
    });
  });

  it('register salva token e atualiza estado', async () => {
    mockRegister.mockResolvedValueOnce(authResponseMock);

    let registerFn!: () => Promise<void>;
    function Comp() {
      const auth = useAuth();
      registerFn = () => auth.register({
        name: 'Maria', email: 'a@b.com',
        password: '12345678', password_confirmation: '12345678',
      });
      return <TestConsumer />;
    }

    render(<AuthProvider><Comp /></AuthProvider>);
    await waitFor(() => screen.getByTestId('loading'));

    await act(async () => { await registerFn(); });

    expect(screen.getByTestId('authenticated').textContent).toBe('true');
    expect(localStorage.getItem('auth_token')).toBe('token-abc-123');
  });
});