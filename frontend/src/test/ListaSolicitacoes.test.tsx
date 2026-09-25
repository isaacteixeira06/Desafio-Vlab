import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListaSolicitacoes } from '../pages/ListaSolicitacoes';
import type { Solicitacao } from '../types';

vi.mock('../api/solicitacoes', () => ({
  listarSolicitacoes: vi.fn(),
}));

import { listarSolicitacoes } from '../api/solicitacoes';
const mockListar = vi.mocked(listarSolicitacoes);

function makeSolicitacao(overrides: Partial<Solicitacao> = {}): Solicitacao {
  return {
    id: Math.floor(Math.random() * 1000),
    protocolo: 'SOL-20240101-AAAAA',
    nome_solicitante: 'João Pereira',
    categoria: 'CONSULTA',
    prioridade: 'MEDIA',
    status: 'RECEBIDA',
    descricao: 'Consulta geral.',
    justificativa_prioridade: null,
    proximos_status: ['EM_ANALISE', 'CANCELADA'],
    data_criacao: '2024-01-01T10:00:00Z',
    data_atualizacao: '2024-01-01T10:00:00Z',
    ...overrides,
  };
}

function makeColecao(items: Solicitacao[], total = items.length) {
  return {
    data: items,
    meta: { current_page: 1, from: 1, last_page: 1, per_page: 15, to: items.length, total },
    links: { first: '', last: '', prev: null, next: null },
  };
}

describe('ListaSolicitacoes', () => {
  const user = userEvent.setup();
  const onVerDetalhe      = vi.fn();
  const onNovaSolicitacao = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  function renderLista(filtroInicial = {}) {
    render(
      <ListaSolicitacoes
        filtroInicial={filtroInicial}
        onVerDetalhe={onVerDetalhe}
        onNovaSolicitacao={onNovaSolicitacao}
      />
    );
  }

  it('exibe spinner enquanto carrega', () => {
    mockListar.mockReturnValueOnce(new Promise(() => {}));
    renderLista();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('exibe mensagem de estado vazio quando lista está vazia', async () => {
    mockListar.mockResolvedValueOnce(makeColecao([]));
    renderLista();
    expect(await screen.findByText(/nenhuma solicitação encontrada/i)).toBeInTheDocument();
  });

  it('exibe as solicitações retornadas pela API', async () => {
    mockListar.mockResolvedValueOnce(makeColecao([
      makeSolicitacao({ nome_solicitante: 'Maria Aparecida' }),
      makeSolicitacao({ nome_solicitante: 'Carlos Eduardo' }),
    ]));
    renderLista();

    expect(await screen.findByText('Maria Aparecida')).toBeInTheDocument();
    expect(screen.getByText('Carlos Eduardo')).toBeInTheDocument();
  });

  it('exibe o total de registros', async () => {
    mockListar.mockResolvedValueOnce(makeColecao(
      [makeSolicitacao(), makeSolicitacao(), makeSolicitacao()], 3
    ));
    renderLista();
    expect(await screen.findByText(/3 registros/i)).toBeInTheDocument();
  });

  it('chama onVerDetalhe ao clicar em "Ver detalhes"', async () => {
    const sol = makeSolicitacao({ id: 42 });
    mockListar.mockResolvedValueOnce(makeColecao([sol]));
    renderLista();

    await user.click(await screen.findByText('Ver detalhes'));
    expect(onVerDetalhe).toHaveBeenCalledWith(42);
  });

  it('chama onNovaSolicitacao ao clicar no botão de nova solicitação', async () => {
    mockListar.mockResolvedValueOnce(makeColecao([]));
    renderLista();
    await waitFor(() => screen.getByRole('button', { name: /nova solicitação/i }));
    await user.click(screen.getAllByRole('button', { name: /nova solicitação/i })[0]);
    expect(onNovaSolicitacao).toHaveBeenCalledTimes(1);
  });

  it('exibe erro e botão de retry quando a API falha', async () => {
    mockListar.mockRejectedValueOnce(new Error('Network error'));
    renderLista();
    expect(await screen.findByText('Não foi possível carregar as solicitações.')).toBeInTheDocument();
    expect(screen.getByText('Tentar novamente')).toBeInTheDocument();
  });

  it('re-busca ao clicar em "Tentar novamente"', async () => {
    mockListar
      .mockRejectedValueOnce(new Error('erro'))
      .mockResolvedValueOnce(makeColecao([makeSolicitacao({ nome_solicitante: 'Recuperado' })]));

    renderLista();
    await screen.findByText('Tentar novamente');
    await user.click(screen.getByText('Tentar novamente'));

    expect(await screen.findByText('Recuperado')).toBeInTheDocument();
  });

  it('filtra por status ao selecionar no select', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista();
    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(1));

    await user.selectOptions(screen.getByLabelText(/status/i), 'RECEBIDA');

    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(2));
    expect(mockListar).toHaveBeenLastCalledWith(
      expect.objectContaining({ status: 'RECEBIDA' })
    );
  });

  it('filtra por categoria ao selecionar no select', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista();
    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(1));

    await user.selectOptions(screen.getByLabelText(/categoria/i), 'EXAME');

    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(2));
    expect(mockListar).toHaveBeenLastCalledWith(
      expect.objectContaining({ categoria: 'EXAME' })
    );
  });

  it('filtra por prioridade ao selecionar no select', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista();
    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(1));

    await user.selectOptions(screen.getByLabelText(/prioridade/i), 'URGENTE');

    await waitFor(() => expect(mockListar).toHaveBeenCalledTimes(2));
    expect(mockListar).toHaveBeenLastCalledWith(
      expect.objectContaining({ prioridade: 'URGENTE' })
    );
  });

  it('aplica filtro inicial quando fornecido', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista({ status: 'AGENDADA' });

    await waitFor(() => {
      expect(mockListar).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'AGENDADA' })
      );
    });
  });

  it('exibe botão "Limpar filtros" quando há filtro ativo', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista();
    await waitFor(() => screen.getByLabelText(/status/i));

    await user.selectOptions(screen.getByLabelText(/status/i), 'RECEBIDA');
    expect(await screen.findByText('Limpar filtros')).toBeInTheDocument();
  });

  it('limpa filtros ao clicar em "Limpar filtros"', async () => {
    mockListar.mockResolvedValue(makeColecao([]));
    renderLista();
    await waitFor(() => screen.getByLabelText(/status/i));

    await user.selectOptions(screen.getByLabelText(/status/i), 'RECEBIDA');
    await screen.findByText('Limpar filtros');
    await user.click(screen.getByText('Limpar filtros'));

    await waitFor(() => {
      const ultimo = mockListar.mock.calls[mockListar.mock.calls.length - 1][0];
      expect(ultimo?.status).toBeFalsy();
    });
  });

  it('destaca linha com fundo diferente para prioridade URGENTE', async () => {
    mockListar.mockResolvedValueOnce(makeColecao([
      makeSolicitacao({ prioridade: 'URGENTE', justificativa_prioridade: 'Urgente mesmo.' }),
    ]));
    renderLista();
    await screen.findByText('João Pereira');

    // A linha urgente tem classe de fundo específica
    const linhas = document.querySelectorAll('tbody tr');
    expect(linhas[0].className).toContain('bg-orange-50');
  });

  it('exibe paginação quando há mais de uma página', async () => {
    mockListar.mockResolvedValueOnce({
      data: [makeSolicitacao()],
      meta: { current_page: 1, from: 1, last_page: 3, per_page: 15, to: 1, total: 45 },
      links: { first: '', last: '', prev: null, next: '' },
    });
    renderLista();

    expect(await screen.findByRole('button', { name: /próxima/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /anterior/i })).toBeDisabled();
  });

  it('não exibe paginação quando há apenas uma página', async () => {
    mockListar.mockResolvedValueOnce(makeColecao([makeSolicitacao()]));
    renderLista();
    await screen.findByText('João Pereira');
    expect(screen.queryByRole('button', { name: /próxima/i })).not.toBeInTheDocument();
  });
});