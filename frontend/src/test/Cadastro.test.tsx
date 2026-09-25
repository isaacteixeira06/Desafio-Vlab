import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Cadastro } from '../pages/auth/Cadastro';

vi.mock('../context/AuthContext', async (importOriginal) => {
  const original = await importOriginal<typeof import('../context/AuthContext')>();
  return {
    ...original,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../context/AuthContext';
const mockUseAuth = vi.mocked(useAuth);

function renderCadastro(onIrParaLogin = vi.fn()) {
  const registerFn = vi.fn();
  mockUseAuth.mockReturnValue({
    user: null, token: null, loading: false, isAuthenticated: false,
    login: vi.fn(), logout: vi.fn(), register: registerFn,
  });
  render(<Cadastro onIrParaLogin={onIrParaLogin} />);
  return { registerFn };
}

async function preencherFormulario(overrides: {
  name?: string;
  email?: string;
  password?: string;
  confirm?: string;
} = {}) {
  const user = userEvent.setup();
  const {
    name    = 'Maria Silva',
    email   = 'maria@example.com',
    password = 'senha1234',
    confirm  = 'senha1234',
  } = overrides;

  if (name)     await user.type(screen.getByPlaceholderText('Seu nome'), name);
  if (email)    await user.type(screen.getByPlaceholderText('seu@email.com'), email);

  const senhaInputs = screen.getAllByPlaceholderText('••••••••');
  if (password) await user.type(senhaInputs[0], password);
  if (confirm)  await user.type(senhaInputs[1], confirm);

  return user;
}

describe('Cadastro', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renderiza todos os campos obrigatórios', () => {
    renderCadastro();
    expect(screen.getByPlaceholderText('Seu nome')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getAllByPlaceholderText('••••••••')).toHaveLength(2);
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('exibe todos os erros ao submeter vazio', async () => {
    const user = userEvent.setup();
    renderCadastro();
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText('Informe seu nome.')).toBeInTheDocument();
    expect(screen.getByText('Informe o e-mail.')).toBeInTheDocument();
    expect(screen.getByText('Crie uma senha.')).toBeInTheDocument();
    expect(screen.getByText('Confirme a senha.')).toBeInTheDocument();
  });

  it('exibe erro para e-mail com formato inválido', async () => {
    const user = userEvent.setup();
    renderCadastro();
    await user.type(screen.getByPlaceholderText('Seu nome'), 'João');
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'nao-e-email');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText('E-mail inválido.')).toBeInTheDocument();
  });

  it('exibe erro quando senha tem menos de 8 caracteres', async () => {
    const user = userEvent.setup();
    renderCadastro();
    await user.type(screen.getByPlaceholderText('Seu nome'), 'João');
    await user.type(screen.getByPlaceholderText('seu@email.com'), 'joao@example.com');
    await user.type(screen.getAllByPlaceholderText('••••••••')[0], '123');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText('A senha deve ter pelo menos 8 caracteres.')).toBeInTheDocument();
  });

  it('exibe erro quando senhas não conferem', async () => {
    const user = userEvent.setup();
    renderCadastro();
    await preencherFormulario({ confirm: 'diferente' });
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(await screen.findByText('As senhas não conferem.')).toBeInTheDocument();
  });

  it('chama register com dados válidos', async () => {
    const { registerFn } = renderCadastro();
    registerFn.mockResolvedValueOnce(undefined);

    const user = await preencherFormulario();
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(registerFn).toHaveBeenCalledWith({
        name: 'Maria Silva',
        email: 'maria@example.com',
        password: 'senha1234',
        password_confirmation: 'senha1234',
      });
    });
  });

  it('exibe erro da API quando e-mail já está cadastrado', async () => {
    const { registerFn } = renderCadastro();
    registerFn.mockRejectedValueOnce({
      isAxiosError: true,
      response: {
        data: {
          message: 'Dados inválidos.',
          errors: { email: ['Este e-mail já está cadastrado.'] },
        },
      },
    });

    const user = await preencherFormulario();
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(await screen.findByText('Este e-mail já está cadastrado.')).toBeInTheDocument();
  });

  it('desabilita botão durante o loading', async () => {
    const { registerFn } = renderCadastro();
    registerFn.mockReturnValueOnce(new Promise(() => {}));

    const user = await preencherFormulario();
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByRole('button', { name: /criar conta/i })).toBeDisabled();
  });

  it('chama onIrParaLogin ao clicar em "Entrar"', async () => {
    const user = userEvent.setup();
    const onIrParaLogin = vi.fn();
    renderCadastro(onIrParaLogin);
    await user.click(screen.getByRole('button', { name: /entrar/i }));
    expect(onIrParaLogin).toHaveBeenCalledTimes(1);
  });

  it('não chama register quando validação local falha', async () => {
    const user = userEvent.setup();
    const { registerFn } = renderCadastro();
    await user.click(screen.getByRole('button', { name: /criar conta/i }));
    expect(registerFn).not.toHaveBeenCalled();
  });
});