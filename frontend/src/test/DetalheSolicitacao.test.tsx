import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DetalheSolicitacao } from '../components/solicitacao/DetalheSolicitacao';
import type { Solicitacao } from '../types';

vi.mock('../hooks/useSolicitacao', () => ({
  useSolicitacao: vi.fn(),
}));

vi.mock('../api/solicitacoes', () => ({
  atualizarStatus: vi.fn(),
}));

import { useSolicitacao } from '../hooks/useSolicitacao';
import { atualizarStatus } from '../api/solicitacoes';

const mockUseSolicitacao = vi.mocked(useSolicitacao);
const mockAtualizarStatus = vi.mocked(atualizarStatus);

const solicitacaoBase: Solicitacao = {
  id: 1,
  protocolo: 'SOL-20240101-ABCDE',
  nome_solicitante: 'Maria da Silva',
  categoria: 'CONSULTA',
  prioridade: 'MEDIA',
  status: 'RECEBIDA',
  descricao: 'Consulta de rotina médica.',
  justificativa_prioridade: null,
  proximos_status: ['EM_ANALISE', 'CANCELADA'],
  data_criacao: '2024-01-01T10:00:00Z',
  data_atualizacao: '2024-01-01T10:00:00Z',
};

function renderDetalhe(
  solicitacao: Solicitacao | null = solicitacaoBase,
  opts: { loading?: boolean; error?: string | null } = {}
) {
  mockUseSolicitacao.mockReturnValue({
    data: solicitacao,
    loading: opts.loading ?? false,
    error: opts.error ?? null,
  });

  const onFechar     = vi.fn();
  const onAtualizado = vi.fn();
  render(
    <DetalheSolicitacao id={1} onFechar={onFechar} onAtualizado={onAtualizado} />
  );
  return { onFechar, onAtualizado };
}

describe('DetalheSolicitacao', () => {
  const user = userEvent.setup();

  beforeEach(() => vi.clearAllMocks());

  // ── Renderização ────────────────────────────────────────────────────────────

  it('exibe spinner enquanto carrega', () => {
    renderDetalhe(null, { loading: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('exibe mensagem de erro quando falha', () => {
    renderDetalhe(null, { error: 'Solicitação não encontrada.' });
    expect(screen.getByText('Solicitação não encontrada.')).toBeInTheDocument();
  });

  it('exibe protocolo e nome do solicitante', () => {
    renderDetalhe();
    expect(screen.getByText('SOL-20240101-ABCDE')).toBeInTheDocument();
    expect(screen.getByText('Maria da Silva')).toBeInTheDocument();
  });

  it('exibe descrição da solicitação', () => {
    renderDetalhe();
    expect(screen.getByText('Consulta de rotina médica.')).toBeInTheDocument();
  });

  it('exibe os botões de próximos status', () => {
    renderDetalhe();
    expect(screen.getByRole('button', { name: /em análise/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancelada/i })).toBeInTheDocument();
  });

  it('não exibe botões de status quando solicitação é final', () => {
    renderDetalhe({ ...solicitacaoBase, status: 'CONCLUIDA', proximos_status: [] });
    expect(screen.queryByText(/atualizar para/i)).not.toBeInTheDocument();
  });

  it('exibe bloco de justificativa para solicitações urgentes', () => {
    renderDetalhe({
      ...solicitacaoBase,
      prioridade: 'URGENTE',
      justificativa_prioridade: 'Paciente em estado crítico.',
    });
    expect(screen.getByText('Paciente em estado crítico.')).toBeInTheDocument();
    expect(screen.getByText('Justificativa de urgência')).toBeInTheDocument();
  });

  it('não exibe bloco de justificativa quando nula', () => {
    renderDetalhe({ ...solicitacaoBase, justificativa_prioridade: null });
    expect(screen.queryByText('Justificativa de urgência')).not.toBeInTheDocument();
  });

  // ── Fechamento ──────────────────────────────────────────────────────────────

  it('chama onFechar ao clicar no botão X', async () => {
    const { onFechar } = renderDetalhe();
    await user.click(screen.getByRole('button', { name: /fechar/i }));
    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  it('chama onFechar ao clicar no overlay', async () => {
    const { onFechar } = renderDetalhe();
    const dialog = screen.getByRole('dialog');
    await user.click(dialog);
    expect(onFechar).toHaveBeenCalledTimes(1);
  });

  // ── Atualização de status com confirmação dupla ──────────────────────────────

  it('exige clique duplo para confirmar mudança de status', async () => {
    mockAtualizarStatus.mockResolvedValueOnce({ ...solicitacaoBase, status: 'EM_ANALISE' });
    renderDetalhe();

    // Primeiro clique → entra em modo confirmação
    await user.click(screen.getByRole('button', { name: /em análise/i }));
    expect(mockAtualizarStatus).not.toHaveBeenCalled();
    expect(screen.getByText(/confirmar/i)).toBeInTheDocument();

    // Segundo clique → confirma
    await user.click(screen.getByRole('button', { name: /confirmar/i }));
    await waitFor(() => expect(mockAtualizarStatus).toHaveBeenCalledWith(1, { status: 'EM_ANALISE' }));
  });

  it('cancela confirmação ao clicar em Cancelar', async () => {
    renderDetalhe();

    await user.click(screen.getByRole('button', { name: /em análise/i }));
    expect(screen.getByText(/confirmar/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^cancelar$/i }));
    expect(screen.queryByText(/confirmar/i)).not.toBeInTheDocument();
    expect(mockAtualizarStatus).not.toHaveBeenCalled();
  });

  it('chama onAtualizado e onFechar após atualização bem-sucedida', async () => {
    mockAtualizarStatus.mockResolvedValueOnce({ ...solicitacaoBase, status: 'CANCELADA' });
    const { onFechar, onAtualizado } = renderDetalhe();

    await user.click(screen.getByRole('button', { name: /cancelada/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    await waitFor(() => {
      expect(onAtualizado).toHaveBeenCalledTimes(1);
      expect(onFechar).toHaveBeenCalledTimes(1);
    });
  });

  it('exibe erro quando atualização de status falha', async () => {
    mockAtualizarStatus.mockRejectedValueOnce({
      isAxiosError: true,
      response: { data: { message: 'Transição inválida.' } },
    });
    renderDetalhe();

    await user.click(screen.getByRole('button', { name: /em análise/i }));
    await user.click(screen.getByRole('button', { name: /confirmar/i }));

    expect(await screen.findByText('Transição inválida.')).toBeInTheDocument();
  });

  // ── Acessibilidade ──────────────────────────────────────────────────────────

  it('o modal tem role=dialog e aria-modal', () => {
    renderDetalhe();
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
  });

  it('o modal tem aria-labelledby apontando para o título', () => {
    renderDetalhe();
    const dialog = screen.getByRole('dialog');
    const labelId = dialog.getAttribute('aria-labelledby');
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toBeInTheDocument();
  });
});