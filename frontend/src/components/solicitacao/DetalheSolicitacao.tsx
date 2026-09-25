import React, { useState } from 'react';
import { atualizarStatus } from '../../api/solicitacoes';
import { extrairErrosApi } from '../../api/client';
import type { Solicitacao, Status } from '../../types';
import {
  STATUS_LABEL, STATUS_BADGE,
  CATEGORIA_LABEL, PRIORIDADE_LABEL,
} from '../../utils/constants';
import { StatusBadge, PrioridadeBadge, Button, ErrorBanner, Spinner } from '../ui';
import { useSolicitacao } from '../../hooks/useSolicitacao';

// ─── Modal container ──────────────────────────────────────────────────────────

interface DetalheSolicitacaoProps {
  id: number;
  onFechar: () => void;
  onAtualizado: () => void;
}

export function DetalheSolicitacao({ id, onFechar, onAtualizado }: DetalheSolicitacaoProps) {
  const { data, loading, error } = useSolicitacao(id);
  const [atualizando, setAtualizando] = useState(false);
  const [erroStatus, setErroStatus] = useState('');
  const [confirmando, setConfirmando] = useState<Status | null>(null);

  async function handleAtualizarStatus(novoStatus: Status) {
    if (confirmando !== novoStatus) {
      setConfirmando(novoStatus);
      return;
    }
    setAtualizando(true);
    setErroStatus('');
    setConfirmando(null);
    try {
      await atualizarStatus(id, { status: novoStatus });
      onAtualizado();
      onFechar();
    } catch (err) {
      const { geral } = extrairErrosApi(err);
      setErroStatus(geral);
    } finally {
      setAtualizando(false);
    }
  }

  return (
    /* Overlay */
    <div
      className="fixed inset-0 bg-black/40 z-40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalhe-titulo"
      onClick={(e) => { if (e.target === e.currentTarget) onFechar(); }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="detalhe-titulo" className="text-slate-800 font-semibold text-base">
            Detalhes da solicitação
          </h2>
          <button
            onClick={onFechar}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
            aria-label="Fechar"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {loading && (
            <div className="flex justify-center py-10"><Spinner /></div>
          )}
          {error && <ErrorBanner message={error} />}
          {data && <ConteudoDetalhe solicitacao={data} />}
        </div>

        {/* Footer — ações de status */}
        {data && data.proximos_status.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50">
            {erroStatus && (
              <p className="text-sm text-red-600 mb-3">{erroStatus}</p>
            )}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 mr-1">Atualizar para:</span>
              {data.proximos_status.map((s) => (
                <button
                  key={s}
                  disabled={atualizando}
                  onClick={() => handleAtualizarStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all focus:outline-none focus:ring-2 focus:ring-teal-500
                    ${confirmando === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white border-slate-300 text-slate-700 hover:border-teal-400 hover:text-teal-700'
                    } disabled:opacity-50`}
                >
                  {atualizando && confirmando === s
                    ? 'Salvando...'
                    : confirmando === s
                    ? `Confirmar → ${STATUS_LABEL[s]}`
                    : STATUS_LABEL[s]}
                </button>
              ))}
              {confirmando && (
                <button
                  onClick={() => setConfirmando(null)}
                  className="text-xs text-slate-400 hover:text-slate-600 px-2"
                >
                  Cancelar
                </button>
              )}
            </div>
            {confirmando && (
              <p className="text-xs text-slate-400 mt-2">
                Clique novamente para confirmar a transição de status.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Conteúdo interno ─────────────────────────────────────────────────────────

function ConteudoDetalhe({ solicitacao: s }: { solicitacao: Solicitacao }) {
  return (
    <div className="space-y-5">
      {/* Protocolo + status */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Protocolo</p>
          <p className="font-mono text-sm font-semibold text-slate-800">{s.protocolo}</p>
        </div>
        <StatusBadge status={s.status} />
      </div>

      {/* Solicitante */}
      <InfoRow label="Solicitante" value={s.nome_solicitante} />

      {/* Categoria + Prioridade */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">Categoria</p>
          <p className="text-sm text-slate-700">{CATEGORIA_LABEL[s.categoria]}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-1">Prioridade</p>
          <PrioridadeBadge prioridade={s.prioridade} />
        </div>
      </div>

      {/* Descrição */}
      <div>
        <p className="text-xs text-slate-400 mb-1">Descrição</p>
        <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg px-3 py-2.5">
          {s.descricao}
        </p>
      </div>

      {/* Justificativa de urgência */}
      {s.justificativa_prioridade && (
        <div className="rounded-lg bg-orange-50 border border-orange-200 px-3 py-2.5">
          <p className="text-xs text-orange-600 font-medium mb-0.5">Justificativa de urgência</p>
          <p className="text-sm text-orange-800">{s.justificativa_prioridade}</p>
        </div>
      )}

      {/* Datas */}
      <div className="grid grid-cols-2 gap-4 pt-1 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Registrada em</p>
          <p className="text-xs text-slate-600">{formatarData(s.data_criacao)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Atualizada em</p>
          <p className="text-xs text-slate-600">{formatarData(s.data_atualizacao)}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-400 mb-0.5">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

function formatarData(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}