import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Login } from '../pages/auth/Login';
import { AuthProvider } from '../context/AuthContext';

// Mock do contexto de auth
vi.mock('../context/AuthContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../context/AuthContext')>();
  return {
    ...original,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../context/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderLogin(onIrParaCadastro = vi.fn()) {
  const loginFn = vi.fn();
  mockUseAuth.mockReturnValue({
    user: null, token: null, loading: false, isAuthenticated: false,
    login: loginFn, logout: vi.fn(), register: vi.fn(),
  });
  render(<Login onIrParaCadastro={onIrParaCadastro} />);
  return { loginFn };
}

describe('Login', () => {
  const user = userEvent.setup();

  beforeEach(() => vi.clearAllMocks());

  it('renderiza campos de e-mail, senha e botão', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('exibe credencial demo na tela', () => {
    renderLogin();
    expect(screen.getByText('demo@vlab.dev')).toBeInTheDocument();
    expect(screen.getByText('senha1234')).toBeInTheDocument();
  });

  it('exibe erro quando e-mail está vazio', async () => {
    renderLogin();
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();
  });

  it('exibe erro quando senha está vazia', async () => {
    renderLogin();
    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'a@b.com');
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText('Informe a senha.')).toBeInTheDocument();
  });

  it('chama login com e-mail e senha corretos', async () => {
    const { loginFn } = renderLogin();
    loginFn.mockResolvedValueOnce(undefined);

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'demo@vlab.dev');
    await user.type(screen.getByPlaceholderText('••••••••'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(loginFn).toHaveBeenCalledWith({
        email: 'demo@vlab.dev',
        password: 'senha1234',
      });
    });
  });

  it('exibe mensagem de erro quando login falha com 401', async () => {
    const { loginFn } = renderLogin();
    loginFn.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Credenciais inválidas.', errors: {} } },
    });

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'errado@test.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'errada123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(await screen.findByText('Credenciais inválidas.')).toBeInTheDocument();
  });

  it('desabilita botão enquanto loading', async () => {
    const { loginFn } = renderLogin();
    // Promessa que nunca resolve — simula loading
    loginFn.mockReturnValueOnce(new Promise(() => {}));

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'a@b.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(screen.getByRole('button', { name: /entrar/i })).toBeDisabled();
  });

  it('chama onIrParaCadastro ao clicar em "Cadastre-se"', async () => {
    const onIrParaCadastro = vi.fn();
    renderLogin(onIrParaCadastro);
    await user.click(screen.getByRole('button', { name: /cadastre-se/i }));
    expect(onIrParaCadastro).toHaveBeenCalledTimes(1);
  });

  it('limpa erro de campo ao redigitar', async () => {
    renderLogin();
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText('Informe o e-mail.')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'a');
    expect(screen.queryByText('Informe o e-mail.')).not.toBeInTheDocument();
  });
});