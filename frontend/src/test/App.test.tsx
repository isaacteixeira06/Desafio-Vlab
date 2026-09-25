import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock das chamadas de API reais
vi.mock('../api/auth', () => ({
  login:    vi.fn(),
  logout:   vi.fn(),
  register: vi.fn(),
  me:       vi.fn(),
}));

vi.mock('../api/solicitacoes', () => ({
  listarSolicitacoes: vi.fn(),
  buscarSolicitacao:  vi.fn(),
  criarSolicitacao:   vi.fn(),
  atualizarStatus:    vi.fn(),
}));

import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../api/auth';
import { listarSolicitacoes } from '../api/solicitacoes';

const mockLogin    = vi.mocked(apiLogin);
const mockLogout   = vi.mocked(apiLogout);
const mockRegister = vi.mocked(apiRegister);
const mockListar   = vi.mocked(listarSolicitacoes);

const authResponseMock = {
  message: 'ok',
  user: { id: 1, name: 'Maria Demo', email: 'demo@vlab.dev' },
  token: 'token-demo-123',
};

const colecaoVazia = {
  data: [],
  meta: { current_page: 1, from: null, last_page: 1, per_page: 15, to: null, total: 0 },
  links: { first: '', last: '', prev: null, next: null },
};

describe('App — fluxo de autenticação', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('exibe tela de login quando não autenticado', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();
    });
  });

  it('não exibe o painel antes de autenticar', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('heading', { name: /entrar na conta/i }));
    expect(screen.queryByText('Painel de atendimento')).not.toBeInTheDocument();
  });

  it('navega para cadastro ao clicar em Cadastre-se', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: /cadastre-se/i }));
    await user.click(screen.getByRole('button', { name: /cadastre-se/i }));
    expect(screen.getByRole('heading', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('volta para login a partir do cadastro', async () => {
    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: /cadastre-se/i }));
    await user.click(screen.getByRole('button', { name: /cadastre-se/i }));
    await user.click(screen.getByRole('button', { name: /^entrar$/i }));
    expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();
  });

  it('exibe o painel após login bem-sucedido', async () => {
    mockLogin.mockResolvedValueOnce(authResponseMock);
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);
    await waitFor(() => screen.getByPlaceholderText(/seu@email.com/i));

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'demo@vlab.dev');
    await user.type(screen.getByPlaceholderText('••••••••'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Painel de atendimento')).toBeInTheDocument();
    });
  });

  it('exibe nome do usuário na sidebar após login', async () => {
    mockLogin.mockResolvedValueOnce(authResponseMock);
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);
    await waitFor(() => screen.getByPlaceholderText(/seu@email.com/i));

    await user.type(screen.getByPlaceholderText(/seu@email.com/i), 'demo@vlab.dev');
    await user.type(screen.getByPlaceholderText('••••••••'), 'senha1234');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Maria Demo')).toBeInTheDocument();
    });
  });

  it('restaura sessão salva no localStorage sem pedir login', async () => {
    localStorage.setItem('auth_token', 'saved-token');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'Salvo', email: 'salvo@test.com' }));
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Painel de atendimento')).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('volta para login após logout', async () => {
    localStorage.setItem('auth_token', 'tk');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'X', email: 'x@x.com' }));
    mockLogout.mockResolvedValueOnce(undefined);
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);
    await waitFor(() => screen.getByText('Painel de atendimento'));

    await user.click(screen.getByRole('button', { name: /sair/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();
    });
  });

  it('redireciona para login quando token expira (401)', async () => {
    localStorage.setItem('auth_token', 'expirado');
    localStorage.setItem('auth_user', JSON.stringify({ id: 1, name: 'X', email: 'x@x.com' }));
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);
    await waitFor(() => screen.getByText('Painel de atendimento'));

    // Simula o evento que o interceptor axios dispara ao receber 401
    act(() => window.dispatchEvent(new Event('auth:unauthenticated')));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar na conta/i })).toBeInTheDocument();
    });
  });

  it('exibe painel após registro bem-sucedido', async () => {
    mockRegister.mockResolvedValueOnce(authResponseMock);
    mockListar.mockResolvedValue(colecaoVazia);

    render(<App />);
    await waitFor(() => screen.getByRole('button', { name: /cadastre-se/i }));
    await user.click(screen.getByRole('button', { name: /cadastre-se/i }));

    await user.type(screen.getByPlaceholderText('Seu nome'), 'Maria Demo');
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'demo@vlab.dev');
    const senhas = screen.getAllByPlaceholderText('••••••••');
    await user.type(senhas[0], 'senha1234');
    await user.type(senhas[1], 'senha1234');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(screen.getByText('Painel de atendimento')).toBeInTheDocument();
    });
  });
});