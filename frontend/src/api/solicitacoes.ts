import { api } from './client';
import type {
  ApiCollection,
  ApiResource,
  AtualizarStatusPayload,
  CriarSolicitacaoPayload,
  FiltrosSolicitacao,
  Solicitacao,
} from '../types';

export async function listarSolicitacoes(
  filtros: FiltrosSolicitacao = {}
): Promise<ApiCollection<Solicitacao>> {
  // Remove filtros vazios antes de enviar
  const params = Object.fromEntries(
    Object.entries(filtros).filter(([, v]) => v !== '' && v !== undefined)
  );
  const { data } = await api.get<ApiCollection<Solicitacao>>('/solicitacoes', { params });
  return data;
}

export async function buscarSolicitacao(id: number): Promise<Solicitacao> {
  const { data } = await api.get<ApiResource<Solicitacao>>(`/solicitacoes/${id}`);
  return data.data;
}

export async function criarSolicitacao(
  payload: CriarSolicitacaoPayload
): Promise<Solicitacao> {
  const { data } = await api.post<ApiResource<Solicitacao>>('/solicitacoes', payload);
  return data.data;
}

export async function atualizarStatus(
  id: number,
  payload: AtualizarStatusPayload
): Promise<Solicitacao> {
  const { data } = await api.patch<ApiResource<Solicitacao>>(
    `/solicitacoes/${id}/status`,
    payload
  );
  return data.data;
}